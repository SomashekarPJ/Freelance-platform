import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getContracts } from '../api';
import { AuthContext } from '../AuthContext';

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
    getContracts(token).then(data => {
      if (Array.isArray(data)) setContracts(data);
      else setError(data?.message || data?.error || 'Failed to load contracts');
    }).catch(e => setError(e.message || 'Network error'));
  },[token]);

  return (
    <div>
      <h3>Your Contracts</h3>
      {error && <div style={{color:'red'}}>{error}</div>}
      {!error && contracts.length === 0 && <p>No contracts yet.</p>}
      <ul>
        {contracts.map(c=> (
          <li key={c._id}>
            <Link to={'/contracts/'+c._id}>{c.job?.title || 'Contract'}</Link>
            {' — '}{c.status} {c.paid ? '(Paid)' : '(Unpaid)'}
          </li>
        ))}
      </ul>
    </div>
  );
}

