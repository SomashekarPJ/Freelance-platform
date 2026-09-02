import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function Login(){
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email:'', password:'' });
  const [msg, setMsg] = useState('');

  async function submit(e){
    e.preventDefault();
    const res = await login(form);
    setMsg(res.token ? 'Logged in successfully' : (res.message || res.error || 'Unable to log in'));
  }

  return (
    <div className="auth-layout">
      <section className="auth-panel">
        <span className="eyebrow">Account access</span>
        <h1>Welcome back</h1>
        <p>Sign in to manage bids, contracts, payments, and client conversations.</p>
        <div className="auth-points">
          <span>Secure project records</span>
          <span>Contract status tracking</span>
          <span>Built-in workspace messages</span>
        </div>
      </section>

      <section className="form-card">
        <form onSubmit={submit} className="form-stack">
          <div className="form-heading">
            <h2>Login</h2>
            <p>Use the email and password connected to your marketplace account.</p>
          </div>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e=>setForm({...form,email:e.target.value})}
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e=>setForm({...form,password:e.target.value})}
              required
            />
          </label>

          <button type="submit" className="button button--primary button--full">Login</button>

          {msg && (
            <div className={`alert ${msg.includes('success') ? 'alert--success' : 'alert--error'}`}>
              {msg}
            </div>
          )}

          <p className="form-note">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
