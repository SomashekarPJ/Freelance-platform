import React, { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { createPaymentIntent } from '../api';
import PaymentForm from './PaymentForm';

export default function PaymentDemo(){
  const { token } = useContext(AuthContext);
  const [amount, setAmount] = useState(10);
  const [clientSecret, setClientSecret] = useState(null);
  const [msg, setMsg] = useState('');

  async function createIntent(){
    setMsg('Creating payment intent...');
    const res = await createPaymentIntent(amount, 'usd', token);
    if(res.clientSecret){
      setClientSecret(res.clientSecret);
      setMsg('Payment intent ready');
    } else {
      setMsg(res.error || JSON.stringify(res));
    }
  }

  return (
    <div className="compose-layout">
      <section className="section-heading section-heading--vertical">
        <span className="eyebrow">Stripe test</span>
        <h1>Payment demo</h1>
        <p>Create a test PaymentIntent and complete it with Stripe Elements.</p>
      </section>

      <section className="form-card form-card--wide">
        <div className="form-stack">
          <label className="field">
            <span>Amount (USD)</span>
            <input type="number" value={amount} onChange={e=>setAmount(parseFloat(e.target.value || '0'))} />
          </label>
          <button type="button" onClick={createIntent} className="button button--primary">Create PaymentIntent</button>
          {msg && <div className={`alert ${msg === 'Payment intent ready' ? 'alert--success' : 'alert--info'}`}>{msg}</div>}
          {clientSecret && <PaymentForm clientSecret={clientSecret} />}
        </div>
      </section>
    </div>
  );
}
