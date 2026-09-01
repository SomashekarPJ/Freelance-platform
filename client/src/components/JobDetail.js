import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, placeBid, acceptBid, getContract } from '../api';
import PaymentForm from './PaymentForm';
import Spinner from './Spinner';
import { AuthContext } from '../AuthContext';

export default function JobDetail(){
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [amount, setAmount] = useState('');
  const [cover, setCover] = useState('');
  const [clientSecret, setClientSecret] = useState(null);
  const [contractId, setContractId] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(()=>{
    getJob(id).then(res => {
      if (res && res.job) setData(res);
      else setMsg(res?.message || 'Job not found');
    }).catch(e => setMsg(e.message || 'Failed to load'));
  },[id]);

  async function sendBid(e){
    e.preventDefault();
    if (!token) { setMsg('Please login first'); return; }
    const res = await placeBid({ jobId: id, amount: parseFloat(amount), coverLetter: cover }, token);
    if (res._id) {
      setMsg('Bid placed');
      setAmount('');
      setCover('');
      getJob(id).then(setData);
    } else {
      setMsg(res.message || res.error || (res.errors && res.errors[0]?.msg) || 'Failed to place bid');
    }
  }

  async function onAccept(bidId){
    if (!token) { setMsg('Please login first'); return; }
    const res = await acceptBid(bidId, token);
    if (res.bid) getJob(id).then(setData);
    else setMsg(res.message || res.error || 'Failed to accept bid');
    if (res.clientSecret) setClientSecret(res.clientSecret);
    if (res.contract && res.contract._id) {
      setContractId(res.contract._id);
      setTimeout(()=>{ getJob(id).then(setData); }, 1500);
    }
  }

  if (msg && !data) return <div style={{color:'red'}}>{msg}</div>;
  if (!data) return <div>Loading...</div>;
  const { job, bids } = data;
  if (!job) return <div>Job not found</div>;

  return (
    <div>
      <h3>{job.title}</h3>
      <div>{job.description}</div>
      <div>Budget: {job.budget}</div>
      <div>Status: {job.status}</div>
      {msg && <div style={{color: msg.includes('Fail') || msg.includes('login') ? 'red' : 'green'}}>{msg}</div>}
      <h4>Bids</h4>
      <ul>
        {(bids || []).map(b=> (
          <li key={b._id}>{b.freelancer?.name} — {b.amount} — {b.coverLetter}
            {user && String(user._id)===String(job.client?._id || job.client) && job.status === 'open' && !b.accepted
              ? <button onClick={()=>onAccept(b._id)} style={{marginLeft:8}}>Accept</button>
              : null}
            {b.accepted ? <span style={{marginLeft:8,color:'green'}}>(Accepted)</span> : null}
          </li>
        ))}
      </ul>
      {clientSecret && (
        <div style={{marginTop:20}}>
          <h4>Complete Payment</h4>
          <PaymentForm clientSecret={clientSecret} onSuccess={async ()=>{
            setClientSecret(null);
            getJob(id).then(setData);
            if (!contractId) return;
            const cid = contractId;
            setContractId(null);
            setIsPolling(true);
            const maxAttempts = 10;
            const interval = 1500;
            for (let i = 0; i < maxAttempts; i++) {
              try {
                const c = await getContract(cid, token);
                if (c && c.paid) { setIsPolling(false); navigate('/contracts/'+cid); return; }
              } catch (e) {}
              await new Promise(r => setTimeout(r, interval));
            }
            setIsPolling(false);
            navigate('/contracts/'+cid);
          }} />
        </div>
      )}
      {isPolling && (
        <div style={{marginTop:10, display:'flex', alignItems:'center', gap:10, color:'#0a58ca'}}>
          <Spinner />
          <div>Waiting for payment confirmation... (this may take a few seconds)</div>
        </div>
      )}
      {user && user.role==='freelancer' && job.status === 'open' && (
        <form onSubmit={sendBid} style={{marginTop:16}}>
          <input placeholder="Amount" type="number" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} required />
          <textarea placeholder="Cover letter" value={cover} onChange={e=>setCover(e.target.value)} />
          <button type="submit">Place Bid</button>
        </form>
      )}
    </div>
  );
}

