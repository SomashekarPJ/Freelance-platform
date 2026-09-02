import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../api';
import Spinner from './Spinner';

function formatMoney(value){
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

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

  const openJobs = useMemo(() => jobs.filter(job => job.status === 'open').length, [jobs]);
  const totalBudget = useMemo(() => jobs.reduce((sum, job) => sum + Number(job.budget || 0), 0), [jobs]);

  if (loading) return <Spinner label="Loading jobs" size="large" />;
  if (error) return <div className="alert alert--error">{error}</div>;

  return (
    <div className="screen-stack">
      <section className="hero-panel">
        <div className="hero-panel__content">
          <span className="eyebrow">Freelance marketplace</span>
          <h1>Find vetted project work without digging through clutter.</h1>
          <p>
            Browse open opportunities, compare budgets, and move from proposal to contract in one focused workspace.
          </p>
          <div className="hero-actions">
            <Link to="/post" className="button button--primary">Post a job</Link>
            <Link to="/contracts" className="button button--secondary">View contracts</Link>
          </div>
        </div>
        <div className="hero-panel__stats" aria-label="Marketplace summary">
          <div>
            <strong>{jobs.length}</strong>
            <span>Total jobs</span>
          </div>
          <div>
            <strong>{openJobs}</strong>
            <span>Open roles</span>
          </div>
          <div>
            <strong>{formatMoney(totalBudget)}</strong>
            <span>Listed budget</span>
          </div>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <span className="eyebrow">Live opportunities</span>
          <h2>Available jobs</h2>
        </div>
        <p>{jobs.length ? `${jobs.length} project${jobs.length === 1 ? '' : 's'} ready for bids` : 'No active listings yet'}</p>
      </section>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <strong>No jobs posted yet</strong>
          <span>Clients can create the first listing from the post job screen.</span>
          <Link to="/post" className="button button--primary">Create listing</Link>
        </div>
      ) : (
        <div className="job-grid">
          {jobs.map(job => (
            <Link key={job._id} to={`/jobs/${job._id}`} className="job-card">
              <div className="job-card__top">
                <span className={`status-pill status-pill--${job.status || 'default'}`}>{job.status || 'draft'}</span>
                <span className="job-card__budget">{formatMoney(job.budget)}</span>
              </div>
              <h3>{job.title}</h3>
              <p>{job.description}</p>
              <div className="job-card__footer">
                <span>Client</span>
                <strong>{job.client?.name || 'Unknown'}</strong>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
