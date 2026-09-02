import React, { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { postJob } from '../api';

export default function PostJob(){
  const { token, user } = useContext(AuthContext);
  const [form, setForm] = useState({ title:'', description:'', budget:'' });
  const [msg, setMsg] = useState('');

  async function submit(e){
    e.preventDefault();
    if (!token) { setMsg('Please login first'); return; }
    if (user && user.role !== 'client') {
      setMsg('Only client accounts can post jobs.');
      return;
    }

    const res = await postJob({
      title: form.title,
      description: form.description,
      budget: parseFloat(form.budget)
    }, token);

    if (res._id) {
      setMsg('Job posted successfully');
      setForm({ title:'', description:'', budget:'' });
    } else {
      setMsg(res.message || res.error || (res.errors && res.errors[0]?.msg) || 'Unable to post job');
    }
  }

  return (
    <div className="compose-layout">
      <section className="section-heading section-heading--vertical">
        <span className="eyebrow">Client workspace</span>
        <h1>Post a focused project brief</h1>
        <p>Set a clear title, budget, and description so freelancers can bid with confidence.</p>
      </section>

      <section className="form-card form-card--wide">
        <form onSubmit={submit} className="form-stack">
          <label className="field">
            <span>Job title</span>
            <input
              type="text"
              placeholder="Build a responsive customer dashboard"
              value={form.title}
              onChange={e=>setForm({...form,title:e.target.value})}
              required
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              placeholder="Describe scope, deliverables, timeline, and any technical constraints."
              value={form.description}
              onChange={e=>setForm({...form,description:e.target.value})}
              rows={8}
              required
            />
          </label>

          <label className="field">
            <span>Budget (USD)</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="2500"
              value={form.budget}
              onChange={e=>setForm({...form,budget:e.target.value})}
              required
            />
          </label>

          <button type="submit" className="button button--primary button--full">Publish job</button>

          {msg && (
            <div className={`alert ${msg.includes('success') ? 'alert--success' : 'alert--error'}`}>
              {msg}
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
