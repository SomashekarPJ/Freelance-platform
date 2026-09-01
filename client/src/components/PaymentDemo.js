import React, { useState, useContext } from 'react';
import { createPaymentIntent } from '../api';
import { AuthContext } from '../AuthContext';
import PaymentForm from './PaymentForm';

export default function PaymentDemo(){
  const { token } = useContext(AuthContext);
  const [amount, setAmount] = useState(10);
  const [clientSecret, setClientSecret] = useState(null);
  const [msg, setMsg] = useState('');

  async function createIntent(){
    setMsg('Creating...');
    const res = await createPaymentIntent(amount, 'usd', token);
    if(res.clientSecret){
      setClientSecret(res.clientSecret);
      setMsg('Client secret received. Integrate with Stripe Elements to complete payment.');
    } else {
      setMsg(res.error || JSON.stringify(res));
    }
  }

  return (
    <div>
      <h3>Stripe Test Payment</h3>
      <p>This demo requests a PaymentIntent client secret from the server. To finish payments, integrate Stripe Elements using the returned `clientSecret`.</p>
      <div>
        <label>Amount (USD): </label>
        <input type="number" value={amount} onChange={e=>setAmount(parseFloat(e.target.value))} />
        <button onClick={createIntent}>Create PaymentIntent</button>
      </div>
      <div style={{marginTop:10}}>{msg}</div>
      {clientSecret && (
        <div style={{marginTop:10}}>
          <PaymentForm clientSecret={clientSecret} />
        </div>
      )}
    </div>
  );
}
