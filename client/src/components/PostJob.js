import React, { useState, useContext } from 'react';
import { postJob } from '../api';
import { AuthContext } from '../AuthContext';

export default function PostJob(){
  const { token, user } = useContext(AuthContext);
  const [form, setForm] = useState({ title:'', description:'', budget:'' });
  const [msg, setMsg] = useState('');

  async function submit(e){
    e.preventDefault();
    if (!token) { setMsg('Please login first'); return; }
    if (user && user.role !== 'client') {
      setMsg('Only clients can post jobs. Register/login as a client.');
      return;
    }
    const payload = {
      title: form.title,
      description: form.description,
      budget: parseFloat(form.budget)
    };
    const res = await postJob(payload, token);
    if (res._id) {
      setMsg('Posted successfully');
      setForm({ title:'', description:'', budget:'' });
    } else {
      setMsg(res.message || res.error || (res.errors && res.errors[0]?.msg) || 'Error');
    }
  }

  return (
    <div>
      <h3>Post Job</h3>
      <form onSubmit={submit}>
        <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
        <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required />
        <input placeholder="Budget" type="number" step="0.01" min="0.01" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} required />
        <button type="submit">Post</button>
      </form>
      <div>{msg}</div>
    </div>
  );
}

