import React, { useMemo } from 'react';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

function CheckoutForm({ clientSecret, onSuccess }){
  const stripe = useStripe();
  const elements = useElements();

  async function handleSubmit(e){
    e.preventDefault();
    if(!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
    if(error){
      alert('Payment failed: ' + error.message);
    } else if(paymentIntent && paymentIntent.status === 'succeeded'){
      alert('Payment succeeded');
      if (typeof onSuccess === 'function') onSuccess(paymentIntent);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <label className="field">
        <span>Card details</span>
        <div className="stripe-card">
          <CardElement options={{ style: { base: { fontSize: '16px', color: '#172033' } } }} />
        </div>
      </label>
      <button type="submit" disabled={!stripe} className="button button--primary">
        Pay securely
      </button>
    </form>
  );
}

export default function PaymentForm({ clientSecret, stripePubKey, onSuccess }){
  const stripePromise = useMemo(() => loadStripe(stripePubKey || process.env.REACT_APP_STRIPE_PUBLISHABLE), [stripePubKey]);
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm clientSecret={clientSecret} onSuccess={onSuccess} />
    </Elements>
  );
}
