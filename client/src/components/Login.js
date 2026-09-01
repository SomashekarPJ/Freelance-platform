import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';

export default function Login(){
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email:'', password:'' });
  const [msg, setMsg] = useState('');

  async function submit(e){
    e.preventDefault();
    const res = await login(form);
    if(res.token) setMsg('Logged in'); else setMsg(res.message || res.error || 'Error');
  }

  return (
    <div>
      <h3>Login</h3>
      <form onSubmit={submit}>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
        <button type="submit">Login</button>
      </form>
      <div>{msg}</div>
    </div>
  );
}
