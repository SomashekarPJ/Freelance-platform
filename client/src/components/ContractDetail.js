import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { approveContract, completeContract, getContract } from '../api';
import Spinner from './Spinner';

export default function ContractDetail(){
  const { id } = useParams();
  const { token, user } = useContext(AuthContext);
  const [contract, setContract] = useState(null);

  useEffect(()=>{
    if(id) getContract(id, token).then(setContract);
  },[id, token]);

  if(!contract) return <Spinner label="Loading contract" size="large" />;

  const isClient = user && String(user._id) === String(contract.client?._id);
  const isFreelancer = user && String(user._id) === String(contract.freelancer?._id);

  async function markDelivered(){
    await completeContract(id, token);
    getContract(id, token).then(setContract);
  }

  async function markApprove(){
    await approveContract(id, token);
    getContract(id, token).then(setContract);
  }

  return (
    <div className="detail-layout detail-layout--contract">
      <section className="detail-main">
        <div className="detail-card">
          <div className="detail-card__header">
            <div>
              <span className="eyebrow">Contract</span>
              <h1>{contract.job?.title || 'Project contract'}</h1>
            </div>
            <div className="pill-group">
              <span className={`status-pill status-pill--${contract.status || 'default'}`}>{contract.status || 'draft'}</span>
              <span className={`payment-chip ${contract.paid ? 'paid' : 'unpaid'}`}>{contract.paid ? 'Paid' : 'Unpaid'}</span>
            </div>
          </div>

          <div className="detail-meta">
            <div>
              <span>Client</span>
              <strong>{contract.client?.name || 'Unknown'}</strong>
            </div>
            <div>
              <span>Freelancer</span>
              <strong>{contract.freelancer?.name || 'Unknown'}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{contract.status || 'Pending'}</strong>
            </div>
          </div>
        </div>

        {contract.paymentIntent && (
          <section className="panel">
            <div className="panel__header">
              <div>
                <span className="eyebrow">Payment reference</span>
                <h2>Stripe intent</h2>
              </div>
            </div>
            <code className="code-block">{contract.paymentIntent}</code>
          </section>
        )}
      </section>

      <aside className="detail-side">
        <section className="side-panel">
          <span className="eyebrow">Actions</span>
          <h2>Move work forward</h2>
          <p>Freelancers mark delivered work. Clients approve after review.</p>
          <div className="action-stack">
            {isFreelancer && contract.status === 'active' && (
              <button type="button" onClick={markDelivered} className="button button--primary button--full">
                Mark delivered
              </button>
            )}
            {isClient && contract.status === 'delivered' && (
              <button type="button" onClick={markApprove} className="button button--success button--full">
                Approve work
              </button>
            )}
            {!(isFreelancer && contract.status === 'active') && !(isClient && contract.status === 'delivered') && (
              <span className="muted-note">No action is currently available for your role and this contract status.</span>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
