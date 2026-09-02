import React, { useContext } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { AuthContext, AuthProvider } from './AuthContext';
import JobsList from './components/JobsList';
import JobDetail from './components/JobDetail';
import Login from './components/Login';
import Register from './components/Register';
import PostJob from './components/PostJob';
import ContractsList from './components/ContractsList';
import ContractDetail from './components/ContractDetail';
import Messages from './components/Messages';
import PaymentDemo from './components/PaymentDemo';

function NavItem({ to, children }){
  return (
    <NavLink to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
      {children}
    </NavLink>
  );
}

function NavBar(){
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <NavLink to="/" className="brand" aria-label="FreelanceHub home">
          <span className="brand__mark">FH</span>
          <span>
            <strong>FreelanceHub</strong>
            <small>Project marketplace</small>
          </span>
        </NavLink>

        <nav className="nav-links" aria-label="Primary navigation">
          <NavItem to="/">Jobs</NavItem>
          <NavItem to="/post">Post Job</NavItem>
          <NavItem to="/contracts">Contracts</NavItem>
          <NavItem to="/messages">Messages</NavItem>
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <div className="user-chip" title={user.email || user.name}>
                <span>{user.name?.slice(0, 1)?.toUpperCase() || 'U'}</span>
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.role}</small>
                </div>
              </div>
              <button type="button" onClick={logout} className="button button--ghost">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="button button--ghost">Login</NavLink>
              <NavLink to="/register" className="button button--primary">Register</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <NavBar />
          <main className="page-shell">
            <Routes>
              <Route path="/" element={<JobsList />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/post" element={<PostJob />} />
              <Route path="/contracts" element={<ContractsList />} />
              <Route path="/contracts/:id" element={<ContractDetail />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/payments" element={<PaymentDemo />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
