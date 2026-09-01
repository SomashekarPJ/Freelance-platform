const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const { param } = require('express-validator');
const expressValidator = require('../middleware/expressValidator');

// List contracts for current user (must be before /:id)
router.get('/', auth, async (req, res, next) => {
  try {
    const contracts = await Contract.find({ $or: [{ client: req.userId }, { freelancer: req.userId }] }).populate('job bid client freelancer').sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err) { next(err); }
});

router.get('/:id', auth, [ param('id').isMongoId().withMessage('Valid contract id required') ], expressValidator, async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id).populate('job bid client freelancer');
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    // only parties to the contract can view it
    if (String(contract.client._id || contract.client) !== String(req.userId) &&
        String(contract.freelancer._id || contract.freelancer) !== String(req.userId)) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    res.json(contract);
  } catch (err) { next(err); }
});

router.post('/:id/complete', auth, [ param('id').isMongoId().withMessage('Valid contract id required') ], expressValidator, async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    // only freelancer can mark delivered
    if (String(contract.freelancer) !== String(req.userId)) return res.status(403).json({ message: 'Not allowed' });
    contract.status = 'delivered';
    await contract.save();
    res.json(contract);
  } catch (err) { next(err); }
});

router.post('/:id/approve', auth, [ param('id').isMongoId().withMessage('Valid contract id required') ], expressValidator, async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    // only client can approve
    if (String(contract.client) !== String(req.userId)) return res.status(403).json({ message: 'Not allowed' });
    contract.status = 'approved';
    await contract.save();
    // mark related job completed
    await Job.findByIdAndUpdate(contract.job, { status: 'completed' });
    res.json(contract);
  } catch (err) { next(err); }
});

module.exports = router;

