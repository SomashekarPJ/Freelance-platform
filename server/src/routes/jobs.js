const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { body, param } = require('express-validator');
const expressValidator = require('../middleware/expressValidator');

// Create job
router.post('/', auth, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be under 200 chars').escape(),
  body('description').trim().isLength({ min: 1, max: 5000 }).withMessage('Description is required (max 5000 chars)'),
  body('budget').isFloat({ gt: 0 }).withMessage('Budget must be a positive number')
], expressValidator, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (user.role !== 'client') return res.status(403).json({ message: 'Only clients can post jobs' });
    const { title, description, budget } = req.body;
    const job = await Job.create({ title, description, budget, client: req.userId });
    res.status(201).json(job);
  } catch (err) { next(err); }
});

// List jobs
router.get('/', async (req, res, next) => {
  try {
    const jobs = await Job.find().populate('client', 'name email').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) { next(err); }
});

// Get job with bids
router.get('/:id', [ param('id').isMongoId().withMessage('Valid job id required') ], expressValidator, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('client', 'name email').populate({ path: 'acceptedBid' });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const bids = await Bid.find({ job: req.params.id }).populate('freelancer', 'name');
    res.json({ job, bids });
  } catch (err) { next(err); }
});

module.exports = router;

