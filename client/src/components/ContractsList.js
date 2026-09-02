import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { getContracts } from '../api';

export default function ContractsList(){
  const { token } = useContext(AuthContext);
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState('');

  useEffect(()=>{
    if (!token) {
      setContracts([]);
      setError('Please login to view contracts');
      return;
    }
    setError('');
    getContracts(token)
      .then(data => {
        if (Array.isArray(data)) setContracts(data);
        else setError(data?.message || data?.error || 'Failed to load contracts');
      })
      .catch(e => setError(e.message || 'Network error'));
  },[token]);

  const paidCount = useMemo(() => contracts.filter(contract => contract.paid).length, [contracts]);

  return (
    <div className="screen-stack">
      <section className="section-heading">
        <div>
          <span className="eyebrow">Delivery desk</span>
          <h1>Your contracts</h1>
        </div>
        <p>{contracts.length ? `${paidCount} paid of ${contracts.length} contract${contracts.length === 1 ? '' : 's'}` : 'Track active, delivered, and approved work'}</p>
      </section>

      {error && <div className="alert alert--error">{error}</div>}

      {!error && contracts.length === 0 && (
        <div className="empty-state">
          <strong>No contracts yet</strong>
          <span>Contracts appear after a client accepts a bid and starts payment.</span>
          <Link to="/" className="button button--primary">Browse jobs</Link>
        </div>
      )}

      {contracts.length > 0 && (
        <div className="contract-grid">
          {contracts.map(contract => (
            <Link key={contract._id} to={`/contracts/${contract._id}`} className="contract-card">
              <div className="contract-card__header">
                <span className={`status-pill status-pill--${contract.status || 'default'}`}>{contract.status || 'draft'}</span>
                <span className={`payment-chip ${contract.paid ? 'paid' : 'unpaid'}`}>{contract.paid ? 'Paid' : 'Unpaid'}</span>
              </div>
              <h2>{contract.job?.title || 'Contract'}</h2>
              <div className="contract-card__people">
                <div>
                  <span>Client</span>
                  <strong>{contract.client?.name || 'Unknown'}</strong>
                </div>
                <div>
                  <span>Freelancer</span>
                  <strong>{contract.freelancer?.name || 'Unknown'}</strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
