const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');
const Job = require('../models/Job');
const Contract = require('../models/Contract');
const auth = require('../middleware/auth');
const { body, param } = require('express-validator');
const expressValidator = require('../middleware/expressValidator');

// Place a bid
router.post('/', auth, [
  body('jobId').isMongoId().withMessage('Valid jobId is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('coverLetter').optional().trim().isLength({ max: 2000 }).withMessage('Cover letter max 2000 chars')
], expressValidator, async (req, res, next) => {
  try {
    const { jobId, amount, coverLetter } = req.body;
    // ensure job exists
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'open') return res.status(400).json({ message: 'Job is not open for bidding' });
    // prevent client from bidding on own job
    if (String(job.client) === String(req.userId)) {
      return res.status(403).json({ message: 'Cannot bid on your own job' });
    }
    const bid = await Bid.create({ job: jobId, freelancer: req.userId, amount, coverLetter });
    res.status(201).json(bid);
  } catch (err) { next(err); }
});

// Accept a bid -> create contract and mark accepted
router.post('/:id/accept', auth, [ param('id').isMongoId().withMessage('Valid bid id required') ], expressValidator, async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('job');
    if (!bid) return res.status(404).json({ message: 'Bid not found' });
    if (!bid.job) return res.status(404).json({ message: 'Job not found for bid' });
    // only job client can accept
    if (String(bid.job.client) !== String(req.userId)) return res.status(403).json({ message: 'Not allowed' });
    if (bid.job.status !== 'open') return res.status(400).json({ message: 'Job is not open' });
    if (bid.accepted) return res.status(400).json({ message: 'Bid already accepted' });

    bid.accepted = true;
    await bid.save();
    bid.job.acceptedBid = bid._id;
    bid.job.status = 'in_progress';
    await bid.job.save();

    const contract = await Contract.create({
      job: bid.job._id,
      bid: bid._id,
      client: bid.job.client,
      freelancer: bid.freelancer,
      status: 'active',
      paid: false
    });

    let clientSecret = null;
    // Optionally create a Stripe PaymentIntent when STRIPE_KEY is a secret key
    const stripeKey = process.env.STRIPE_KEY;
    if (stripeKey && stripeKey.startsWith('sk_')) {
      try {
        const stripe = require('stripe')(stripeKey);
        const amountCents = Math.round(Number(bid.amount) * 100);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountCents,
          currency: 'usd',
          metadata: { contractId: String(contract._id), bidId: String(bid._id) },
          automatic_payment_methods: { enabled: true }
        });
        contract.paymentIntent = paymentIntent.id;
        await contract.save();
        clientSecret = paymentIntent.client_secret;
      } catch (stripeErr) {
        console.error('Stripe PaymentIntent error:', stripeErr.message);
        // continue without payment — contract still created
      }
    }

    res.json({ bid, contract, clientSecret });
  } catch (err) { next(err); }
});

module.exports = router;

