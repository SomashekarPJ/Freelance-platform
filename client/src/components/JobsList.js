import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../api';

export default function JobsList(){
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    getJobs()
      .then(data => {
        if (Array.isArray(data)) setJobs(data);
        else setError(data?.message || data?.error || 'Failed to load jobs');
      })
      .catch(err => setError(err.message || 'Network error'))
      .finally(() => setLoading(false));
  },[]);

  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div>
      <h3>Jobs</h3>
      {jobs.length === 0 ? <p>No jobs yet. Be the first to post one!</p> : null}
      <ul>
        {jobs.map(j=> (
          <li key={j._id}><Link to={'/jobs/'+j._id}>{j.title}</Link> — {j.budget} — {j.client?.name}</li>
        ))}
      </ul>
    </div>
  );
}

