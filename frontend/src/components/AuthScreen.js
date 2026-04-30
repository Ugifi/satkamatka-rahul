import React, { useState } from 'react';
import { api } from '../api';

export default function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const go = async () => {
    setErr('');
    setLoading(true);
    try {
      if (tab === 'login') {
        if (!mobile || !password) { setErr('Mobile aur password daalo'); setLoading(false); return; }
        const res = await api.login({ mobile, password });
        if (!res.success) { setErr(res.message || 'Login failed'); setLoading(false); return; }
        localStorage.setItem('mk_token', res.token);
        onLogin(res.user);
      } else {
        if (!name || !mobile || !password) { setErr('Sab fields zaroori hain'); setLoading(false); return; }
        if (mobile.length !== 10) { setErr('Valid 10-digit mobile daalo'); setLoading(false); return; }
        if (password.length < 6) { setErr('Password minimum 6 characters'); setLoading(false); return; }
        const res = await api.register({ name, mobile, password });
        if (!res.success) { setErr(res.message || 'Registration failed'); setLoading(false); return; }
        localStorage.setItem('mk_token', res.token);
        onLogin(res.user);
      }
    } catch (e) {
      setErr('Server se connect nahi ho pa raha. Backend chalao!');
    }
    setLoading(false);
  };

  const switchTab = (t) => { setTab(t); setErr(''); setName(''); setMobile(''); setPassword(''); };

  return (
    <div className="auth-wrap">
      <div className="auth-logo">SAKTA MATKA <em></em></div>
      <div className="auth-sub">India's #1 Matka Gaming Platform</div>

      <div className="auth-card">
        <div className="auth-tabs">
          <div className={`at${tab === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')}>Login</div>
          <div className={`at${tab === 'register' ? ' active' : ''}`} onClick={() => switchTab('register')}>Register</div>
        </div>

        {tab === 'register' && (
          <div className="fg">
            <label className="fl">Full Name</label>
            <input
              className="fi"
              type="text"
              placeholder="Aapka naam"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
        )}

        <div className="fg">
          <label className="fl">Mobile Number</label>
          <input
            className="fi"
            type="tel"
            placeholder="10-digit mobile"
            maxLength={10}
            value={mobile}
            onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
          />
        </div>

        <div className="fg" style={{ position: 'relative' }}>
          <label className="fl">Password</label>
          <input
            className="fi"
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && go()}
            style={{ paddingRight: 40 }}
          />
          <span
            onClick={() => setShowPass(p => !p)}
            style={{ position: 'absolute', right: 12, top: 34, cursor: 'pointer', fontSize: 16, userSelect: 'none' }}
          >
            {showPass ? '🙈' : '👁️'}
          </span>
        </div>

        {err && <div className="err-msg">{err}</div>}

        <button className="btn-g" onClick={go} disabled={loading}>
          {loading ? '⏳ Please wait...' : tab === 'login' ? '🔐 Login' : '🚀 Create Account'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 10, color: '#bbb', marginTop: 12 }}>
          18+ Only. Play Responsibly.
        </p>
      </div>
    </div>
  );
}