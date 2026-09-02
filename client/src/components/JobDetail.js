import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { acceptBid, getContract, getJob, placeBid } from '../api';
import PaymentForm from './PaymentForm';
import Spinner from './Spinner';

function money(value){
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value || 0));
}

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
    getJob(id)
      .then(res => {
        if (res && res.job) setData(res);
        else setMsg(res?.message || 'Job not found');
      })
      .catch(e => setMsg(e.message || 'Failed to load job'));
  },[id]);

  async function refreshJob(){
    const fresh = await getJob(id);
    setData(fresh);
  }

  async function sendBid(e){
    e.preventDefault();
    if (!token) { setMsg('Please login first'); return; }
    const res = await placeBid({ jobId: id, amount: parseFloat(amount), coverLetter: cover }, token);
    if (res._id) {
      setMsg('Bid placed successfully');
      setAmount('');
      setCover('');
      refreshJob();
    } else {
      setMsg(res.message || res.error || (res.errors && res.errors[0]?.msg) || 'Failed to place bid');
    }
  }

  async function onAccept(bidId){
    if (!token) { setMsg('Please login first'); return; }
    const res = await acceptBid(bidId, token);
    if (res.bid) refreshJob();
    else setMsg(res.message || res.error || 'Failed to accept bid');
    if (res.clientSecret) setClientSecret(res.clientSecret);
    if (res.contract && res.contract._id) {
      setContractId(res.contract._id);
      setTimeout(refreshJob, 1500);
    }
  }

  if (msg && !data) return <div className="alert alert--error">{msg}</div>;
  if (!data) return <Spinner label="Loading job" size="large" />;

  const { job, bids = [] } = data;
  if (!job) return <div className="alert alert--error">Job not found</div>;

  const isOwner = user && String(user._id) === String(job.client?._id || job.client);
  const canBid = user && user.role === 'freelancer' && job.status === 'open';

  return (
    <div className="detail-layout">
      <section className="detail-main">
        <div className="detail-card">
          <div className="detail-card__header">
            <div>
              <span className="eyebrow">Project brief</span>
              <h1>{job.title}</h1>
            </div>
            <span className={`status-pill status-pill--${job.status || 'default'}`}>{job.status || 'draft'}</span>
          </div>
          <p className="detail-description">{job.description}</p>
          <div className="detail-meta">
            <div>
              <span>Budget</span>
              <strong>{money(job.budget)}</strong>
            </div>
            <div>
              <span>Client</span>
              <strong>{job.client?.name || 'Unknown'}</strong>
            </div>
            <div>
              <span>Bids</span>
              <strong>{bids.length}</strong>
            </div>
          </div>
        </div>

        {msg && (
          <div className={`alert ${msg.includes('success') || msg === 'Bid placed' ? 'alert--success' : 'alert--error'}`}>
            {msg}
          </div>
        )}

        <section className="panel">
          <div className="panel__header">
            <div>
              <span className="eyebrow">Proposals</span>
              <h2>Bids</h2>
            </div>
            <span className="count-pill">{bids.length}</span>
          </div>

          {bids.length === 0 ? (
            <div className="empty-state empty-state--compact">
              <strong>No bids yet</strong>
              <span>This project is waiting for its first freelancer proposal.</span>
            </div>
          ) : (
            <div className="bid-list">
              {bids.map(bid => (
                <article key={bid._id} className="bid-item">
                  <div className="bid-item__body">
                    <div>
                      <h3>{bid.freelancer?.name || 'Unknown freelancer'}</h3>
                      <p>{bid.coverLetter || 'No cover letter provided.'}</p>
                    </div>
                    <div className="bid-item__price">
                      <strong>{money(bid.amount)}</strong>
                      {bid.accepted && <span className="status-pill status-pill--approved">Accepted</span>}
                    </div>
                  </div>
                  {isOwner && job.status === 'open' && !bid.accepted && (
                    <button type="button" onClick={()=>onAccept(bid._id)} className="button button--primary">
                      Accept bid
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {clientSecret && (
          <section className="panel panel--accent">
            <div className="panel__header">
              <div>
                <span className="eyebrow">Payment</span>
                <h2>Complete payment</h2>
              </div>
            </div>
            <PaymentForm clientSecret={clientSecret} onSuccess={async ()=>{
              setClientSecret(null);
              refreshJob();
              if (!contractId) return;
              const cid = contractId;
              setContractId(null);
              setIsPolling(true);
              for (let i = 0; i < 10; i++) {
                try {
                  const contract = await getContract(cid, token);
                  if (contract && contract.paid) {
                    setIsPolling(false);
                    navigate(`/contracts/${cid}`);
                    return;
                  }
                } catch (e) {}
                await new Promise(resolve => setTimeout(resolve, 1500));
              }
              setIsPolling(false);
              navigate(`/contracts/${cid}`);
            }} />
          </section>
        )}

        {isPolling && <Spinner label="Waiting for payment confirmation" size="large" />}
      </section>

      <aside className="detail-side">
        {canBid ? (
          <section className="form-card">
            <form onSubmit={sendBid} className="form-stack">
              <div className="form-heading">
                <h2>Place your bid</h2>
                <p>Send a concise proposal with a clear price.</p>
              </div>
              <label className="field">
                <span>Bid amount (USD)</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="750"
                  value={amount}
                  onChange={e=>setAmount(e.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Cover letter</span>
                <textarea
                  placeholder="Explain your approach, timeline, and relevant experience."
                  value={cover}
                  onChange={e=>setCover(e.target.value)}
                  rows={6}
                />
              </label>
              <button type="submit" className="button button--primary button--full">Submit bid</button>
            </form>
          </section>
        ) : (
          <section className="side-panel">
            <span className="eyebrow">Next step</span>
            <h2>{user ? 'Review project activity' : 'Login to bid'}</h2>
            <p>{user ? 'Client owners can accept proposals. Freelancers can bid while the job is open.' : 'Create or access a freelancer account to send a proposal.'}</p>
          </section>
        )}
      </aside>
    </div>
  );
}
