import React, { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { getConversation, sendMessage } from '../api';

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
      setError(res?.message || res?.error || (res.errors && res.errors[0]?.msg) || 'Failed to send message');
    }
  }

  return (
    <div className="messages-layout">
      <section className="section-heading section-heading--vertical">
        <span className="eyebrow">Inbox</span>
        <h1>Messages</h1>
        <p>Load a conversation by user ID and keep project communication attached to the marketplace.</p>
      </section>

      {!user && <div className="alert alert--error">Please login to use messaging.</div>}
      {error && <div className="alert alert--error">{error}</div>}

      {user && (
        <section className="messenger">
          <div className="messenger__lookup">
            <label className="field">
              <span>Conversation user ID</span>
              <input
                placeholder="Paste a client or freelancer ID"
                value={otherId}
                onChange={e=>setOtherId(e.target.value)}
              />
            </label>
            <button type="button" onClick={load} className="button button--secondary">Load chat</button>
          </div>

          <div className="message-window">
            {msgs.map(message => {
              const isMine = user && String(message.from) === String(user._id);
              return (
                <div key={message._id} className={`message-row ${isMine ? 'message-row--mine' : ''}`}>
                  <div className="message-bubble">
                    <span>{isMine ? 'You' : message.from}</span>
                    <p>{message.text}</p>
                  </div>
                </div>
              );
            })}
            {msgs.length === 0 && (
              <div className="empty-state empty-state--compact">
                <strong>No messages loaded</strong>
                <span>Enter a user ID to open a conversation.</span>
              </div>
            )}
          </div>

          <div className="message-composer">
            <label className="field">
              <span>Message</span>
              <textarea
                placeholder="Write a project update..."
                value={text}
                onChange={e=>setText(e.target.value)}
                rows={3}
              />
            </label>
            <button type="button" onClick={send} className="button button--primary">Send</button>
          </div>
        </section>
      )}
    </div>
  );
}
