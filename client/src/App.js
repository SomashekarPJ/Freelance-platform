import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import JobsList from './components/JobsList';
import JobDetail from './components/JobDetail';
import Login from './components/Login';
import Register from './components/Register';
import PostJob from './components/PostJob';
import ContractsList from './components/ContractsList';
import ContractDetail from './components/ContractDetail';
import Messages from './components/Messages';
import PaymentDemo from './components/PaymentDemo';

function NavBar(){
  const { user, logout } = useContext(AuthContext);
  return (
    <nav style={{marginBottom:16}}>
      <Link to="/">Jobs</Link> {' | '}
      <Link to="/post">Post Job</Link> {' | '}
      <Link to="/contracts">Contracts</Link> {' | '}
      <Link to="/messages">Messages</Link> {' | '}
      {user ? (
        <>
          <span style={{marginRight:8}}>Hi, {user.name} ({user.role})</span>
          <button type="button" onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link> {' | '}
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{padding:20, fontFamily:'system-ui, sans-serif', maxWidth:900, margin:'0 auto'}}>
          <h1>Mini Freelance Marketplace</h1>
          <NavBar />
          <Routes>
            <Route path="/" element={<JobsList/>} />
            <Route path="/jobs/:id" element={<JobDetail/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/post" element={<PostJob/>} />
            <Route path="/contracts" element={<ContractsList/>} />
            <Route path="/contracts/:id" element={<ContractDetail/>} />
            <Route path="/messages" element={<Messages/>} />
            <Route path="/payments" element={<PaymentDemo/>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

