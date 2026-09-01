import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';

export default function Register(){
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'freelancer' });
  const [msg, setMsg] = useState('');

  async function submit(e){
    e.preventDefault();
    const res = await register(form);
    if(res.token) setMsg('Registered'); else setMsg(res.message || res.error || 'Error');
  }

  return (
    <div>
      <h3>Register</h3>
      <form onSubmit={submit}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
        <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
          <option value="freelancer">Freelancer</option>
          <option value="client">Client</option>
        </select>
        <button type="submit">Register</button>
      </form>
      <div>{msg}</div>
    </div>
  );
}
