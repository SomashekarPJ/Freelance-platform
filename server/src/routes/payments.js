const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Contract = require('../models/Contract');

function getStripe() {
  const key = process.env.STRIPE_KEY;
  if (!key || !key.startsWith('sk_')) return null;
  return require('stripe')(key);
}

// Create a PaymentIntent
router.post('/create-intent', auth, async (req, res, next) => {
  try {
    const { amount, currency = 'usd', contractId } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const stripe = getStripe();
    if (!stripe) {
      // Dev fallback when no secret key is configured
      return res.json({
        clientSecret: null,
        message: 'Stripe secret key (sk_...) not configured. Set STRIPE_KEY in server/.env'
      });
    }

    const amountCents = Math.round(Number(amount) * 100);
    const metadata = {};
    if (contractId) metadata.contractId = String(contractId);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      metadata,
      automatic_payment_methods: { enabled: true }
    });

    if (contractId) {
      await Contract.findByIdAndUpdate(contractId, { paymentIntent: paymentIntent.id });
    }

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) { next(err); }
});

// Webhook - mark contract paid when PaymentIntent succeeds
// Note: raw body is captured in index.js via express.json verify
router.post('/webhook', async (req, res) => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event = req.body;

  if (stripe && webhookSecret && req.rawBody) {
    const sig = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  try {
    const type = event.type || event?.type;
    const dataObject = event.data?.object || event?.data?.object;

    if (type === 'payment_intent.succeeded' && dataObject) {
      const contractId = dataObject.metadata?.contractId;
      const paymentIntentId = dataObject.id;

      if (contractId) {
        await Contract.findByIdAndUpdate(contractId, { paid: true, paymentIntent: paymentIntentId });
      } else if (paymentIntentId) {
        await Contract.findOneAndUpdate({ paymentIntent: paymentIntentId }, { paid: true });
      }
      console.log('Payment succeeded, contract marked paid');
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

module.exports = router;

