import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { sendMessage, getConversation } from '../api';

export default function Messages(){
  const { token, user } = useContext(AuthContext);
  const [otherId, setOtherId] = useState('');
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  async function load(){
    if (!otherId) return;
    if (!token) { setError('Please login first'); return; }
    setError('');
    const res = await getConversation(otherId, token);
    if (Array.isArray(res)) setMsgs(res);
    else setError(res?.message || res?.error || 'Failed to load messages');
  }

  async function send(){
    if (!otherId || !text) return;
    if (!token) { setError('Please login first'); return; }
    const res = await sendMessage({ to: otherId, text }, token);
    if (res._id) {
      setText('');
      load();
    } else {
      setError(res?.message || res?.error || (res.errors && res.errors[0]?.msg) || 'Failed to send');
    }
  }

  return (
    <div>
      <h3>Messages</h3>
      {!user && <div style={{color:'red'}}>Please login to use messaging.</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      <div>
        <input placeholder="Other user id" value={otherId} onChange={e=>setOtherId(e.target.value)} />
        <button onClick={load}>Load</button>
      </div>
      <div style={{border:'1px solid #ccc',padding:10,marginTop:10}}>
        {msgs.map(m => (
          <div key={m._id}>
            <strong>{user && String(m.from) === String(user._id) ? 'You' : m.from}</strong>: {m.text}
          </div>
        ))}
        {msgs.length === 0 && <div style={{color:'#888'}}>No messages</div>}
      </div>
      <div>
        <textarea value={text} onChange={e=>setText(e.target.value)} />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}

