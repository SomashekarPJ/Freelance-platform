import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from './api';

export const AuthContext = createContext();

export function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(()=>{
    if(token){
      const u = localStorage.getItem('user');
      if(u) {
        try { setUser(JSON.parse(u)); } catch (e) { setUser(null); }
      }
    } else {
      setUser(null);
    }
  }, [token]);

  async function login(creds){
    const res = await apiLogin(creds);
    if(res.token){
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  }

  async function register(data){
    const res = await apiRegister(data);
    if(res.token){
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  }

  function logout(){
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
