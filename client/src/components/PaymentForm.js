import React, { useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

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
    } else if(paymentIntent && paymentIntent.status==='succeeded'){
      alert('Payment succeeded');
      if (typeof onSuccess === 'function') onSuccess(paymentIntent);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{border:'1px solid #ccc',padding:10,marginBottom:10}}>
        <CardElement />
      </div>
      <button type="submit" disabled={!stripe}>Pay</button>
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
