const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const expressValidator = require('../middleware/expressValidator');

router.post('/', auth, [
  body('to').isMongoId().withMessage('Valid recipient id required'),
  body('text').trim().isLength({ min: 1, max: 2000 }).withMessage('Text is required (max 2000 chars)')
], expressValidator, async (req, res, next) => {
  try {
    const { to, contract, text } = req.body;
    const m = await Message.create({ from: req.userId, to, contract, text });
    res.status(201).json(m);
  } catch (err) { next(err); }
});

router.get('/conversation/:userId', auth, async (req, res, next) => {
  try {
    const other = req.params.userId;
    const msgs = await Message.find({ $or: [{ from: req.userId, to: other }, { from: other, to: req.userId }] }).sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) { next(err); }
});

module.exports = router;
