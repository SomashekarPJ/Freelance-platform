const API = process.env.REACT_APP_API || 'http://localhost:5000/api';

function authHeader(token){
  const t = token || localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function register(payload){
  const res = await fetch(API+'/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  return res.json();
}

export async function login(payload){
  const res = await fetch(API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  return res.json();
}

export async function getJobs(){
  const res = await fetch(API + '/jobs');
  return res.json();
}

export async function getJob(id){
  const res = await fetch(API + '/jobs/' + id);
  return res.json();
}

export async function postJob(payload, token){
  const headers = { 'Content-Type':'application/json', ...authHeader(token) };
  const res = await fetch(API + '/jobs', { method: 'POST', headers, body: JSON.stringify(payload) });
  return res.json();
}

export async function placeBid(payload, token){
  const headers = { 'Content-Type':'application/json', ...authHeader(token) };
  const res = await fetch(API + '/bids', { method: 'POST', headers, body: JSON.stringify(payload) });
  return res.json();
}

export async function acceptBid(bidId, token){
  const headers = { ...authHeader(token) };
  const res = await fetch(API + '/bids/' + bidId + '/accept', { method: 'POST', headers });
  return res.json();
}

// Contracts
export async function getContracts(token){
  const headers = { ...authHeader(token) };
  const res = await fetch(API + '/contracts', { headers });
  return res.json();
}

export async function getContract(id, token){
  const headers = { ...authHeader(token) };
  const res = await fetch(API + '/contracts/' + id, { headers });
  return res.json();
}

export async function completeContract(id, token){
  const headers = { ...authHeader(token) };
  const res = await fetch(API + '/contracts/' + id + '/complete', { method: 'POST', headers });
  return res.json();
}

export async function approveContract(id, token){
  const headers = { ...authHeader(token) };
  const res = await fetch(API + '/contracts/' + id + '/approve', { method: 'POST', headers });
  return res.json();
}

// Messages
export async function sendMessage(payload, token){
  const headers = { 'Content-Type':'application/json', ...authHeader(token) };
  const res = await fetch(API + '/messages', { method: 'POST', headers, body: JSON.stringify(payload) });
  return res.json();
}

export async function getConversation(userId, token){
  const headers = { ...authHeader(token) };
  const res = await fetch(API + '/messages/conversation/' + userId, { headers });
  return res.json();
}

// Payments
export async function createPaymentIntent(amount, currency='usd', token){
  const headers = { 'Content-Type':'application/json', ...authHeader(token) };
  const res = await fetch(API + '/payments/create-intent', { method: 'POST', headers, body: JSON.stringify({ amount, currency }) });
  return res.json();
}

export default API;
