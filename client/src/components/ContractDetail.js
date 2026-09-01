import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getContract, completeContract, approveContract } from '../api';
import { AuthContext } from '../AuthContext';

export default function ContractDetail(){
  const { id } = useParams();
  const { token, user } = useContext(AuthContext);
  const [contract, setContract] = useState(null);

  useEffect(()=>{ if(id) getContract(id, token).then(setContract); },[id, token]);

  if(!contract) return <div>Loading...</div>;
  const isClient = user && String(user._id)===String(contract.client?._id);
  const isFreelancer = user && String(user._id)===String(contract.freelancer?._id);

  async function markDelivered(){
    await completeContract(id, token);
    getContract(id, token).then(setContract);
  }

  async function markApprove(){
    await approveContract(id, token);
    getContract(id, token).then(setContract);
  }

  return (
    <div>
      <h3>Contract: {contract.job?.title}</h3>
      <div>Status: {contract.status} {contract.paid ? '(Paid)' : '(Unpaid)'}</div>
      {contract.paymentIntent && <div>PaymentIntent: {contract.paymentIntent}</div>}
      <div>Client: {contract.client?.name}</div>
      <div>Freelancer: {contract.freelancer?.name}</div>
      {isFreelancer && contract.status==='active' && <button onClick={markDelivered}>Mark Delivered</button>}
      {isClient && contract.status==='delivered' && <button onClick={markApprove}>Approve</button>}
    </div>
  );
}
