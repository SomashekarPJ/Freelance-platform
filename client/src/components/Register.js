import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function Register(){
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'freelancer' });
  const [msg, setMsg] = useState('');

  async function submit(e){
    e.preventDefault();
    const res = await register(form);
    setMsg(res.token ? 'Account created successfully' : (res.message || res.error || 'Unable to register'));
  }

  return (
    <div className="auth-layout">
      <section className="auth-panel">
        <span className="eyebrow">Join the marketplace</span>
        <h1>Create your workspace</h1>
        <p>Choose how you work, then manage every project handoff from a single account.</p>
        <div className="metric-row">
          <div><strong>2</strong><span>Role types</span></div>
          <div><strong>1</strong><span>Contract flow</span></div>
        </div>
      </section>

      <section className="form-card">
        <form onSubmit={submit} className="form-stack">
          <div className="form-heading">
            <h2>Register</h2>
            <p>Set up a freelancer or client account.</p>
          </div>

          <label className="field">
            <span>Full name</span>
            <input
              type="text"
              placeholder="Alex Morgan"
              value={form.name}
              onChange={e=>setForm({...form,name:e.target.value})}
              required
            />
          </label>

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
              placeholder="Create a password"
              value={form.password}
              onChange={e=>setForm({...form,password:e.target.value})}
              required
            />
          </label>

          <label className="field">
            <span>Role</span>
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
              <option value="freelancer">Work as a freelancer</option>
              <option value="client">Hire freelancers</option>
            </select>
          </label>

          <button type="submit" className="button button--primary button--full">Create account</button>

          {msg && (
            <div className={`alert ${msg.includes('success') ? 'alert--success' : 'alert--error'}`}>
              {msg}
            </div>
          )}

          <p className="form-note">
            Already registered? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
