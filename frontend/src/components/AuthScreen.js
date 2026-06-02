import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
      let endpoint = '';
      let payload = {};
      if (tab === 'login') {
        if (!mobile || !password) { setErr('Mobile aur password daalo'); setLoading(false); return; }
        endpoint = '/api/auth/login';
        payload = { mobile, password };
      } else {
        if (!name || !mobile || !password) { setErr('Sab fields zaroori hain'); setLoading(false); return; }
        if (mobile.length !== 10) { setErr('Valid 10-digit mobile daalo'); setLoading(false); return; }
        if (password.length < 6) { setErr('Password minimum 6 characters'); setLoading(false); return; }
        endpoint = '/api/auth/register';
        payload = { name, mobile, password };
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const res = await response.json();
      if (!res.success) { setErr(res.message || 'Failed'); setLoading(false); return; }
      localStorage.setItem('mk_token', res.token);
      onLogin(res.user);
    } catch (e) {
      setErr(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const switchTab = (t) => { setTab(t); setErr(''); setName(''); setMobile(''); setPassword(''); };

  return (
    <div className="auth-page">
      {/* Subtle Background Glows */}
      <div className="bg-circle-1"></div>
      <div className="bg-circle-2"></div>

      {/* Logo Section */}
      <div className="auth-logo-wrap">
        <div className="auth-logo-circle">
          {/* Logo ab proper 100% fit hoga */}
          <img src="/logo1.jpeg" alt="Satka Matka Logo" className="auth-logo-img" />
        </div>
        <div className="auth-logo-text">SATKA MATKA</div>
        <div className="auth-logo-sub">India's #1 Premium Matka Platform</div>
      </div>

      {/* Auth Card */}
      <div className="auth-card-wrap">
        {/* Tabs */}
        <div className="auth-tabs">
          <div className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')}>
            🔐 LOGIN
          </div>
          <div className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => switchTab('register')}>
            📝 REGISTER
          </div>
        </div>

        {tab === 'register' && (
          <div className="auth-fg">
            <label className="auth-lbl">Full Name</label>
            <div className="auth-input-wrapper">
              <span className="auth-icon">👤</span>
              <input className="auth-input with-icon" type="text" placeholder="Aapka pura naam" value={name} onChange={e => setName(e.target.value)} />
            </div>
          </div>
        )}

        <div className="auth-fg">
          <label className="auth-lbl">Mobile Number</label>
          <div className="auth-input-wrapper">
            <span className="auth-icon">📱</span>
            <span className="auth-prefix">+91</span>
            <input className="auth-input with-prefix" type="tel" placeholder="10-digit mobile" maxLength={10} value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} />
          </div>
        </div>

        <div className="auth-fg">
          <label className="auth-lbl">Password</label>
          <div className="auth-pass-wrap auth-input-wrapper">
            <span className="auth-icon">🔒</span>
            <input className="auth-input with-icon" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()} style={{paddingRight: 44}} />
            <span className="auth-eye" onClick={() => setShowPass(p => !p)}>{showPass ? '🙈' : '👁️'}</span>
          </div>
        </div>

        {err && <div className="auth-err">⚠️ {err}</div>}

        <button className="auth-btn" onClick={go} disabled={loading}>
          {loading ? '⏳ PROCESSING...' : tab === 'login' ? '🚀 SECURE LOGIN' : '✨ CREATE ACCOUNT'}
        </button>

        {tab === 'login' && (
          <div className="auth-forgot">
             Forgot Password?
          </div>
        )}
      </div>
      
      <p className="auth-footer">18+ Only · Play Responsibly · © 2026 MatkaKing</p>

      <style>{`
        /* ─── BASE STYLES ─── */
        .auth-page {
          min-height: 100vh;
          background: #0B192C;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 16px 40px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* ─── BACKGROUND DECORATION ─── */
        .bg-circle-1 { position: absolute; top: -10%; left: -10%; width: 350px; height: 350px; background: rgba(30,136,229,0.1); border-radius: 50%; filter: blur(60px); z-index: 0; }
        .bg-circle-2 { position: absolute; bottom: -10%; right: -10%; width: 350px; height: 350px; background: rgba(21,101,192,0.1); border-radius: 50%; filter: blur(60px); z-index: 0; }

        /* ─── HEADER & LOGO ─── */
        .auth-logo-wrap {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 60px 0 35px;
        }

        .auth-logo-circle {
          width: 125px; height: 130px; /* Size thoda bada kiya */
          background: #000000; /* Dark background */
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.5);
          border: 3px solid rgba(255, 255, 255, 0.2); /* Premium border */
          overflow: hidden;
        }

        /* 🔥 PROPER FIT TRICK 🔥 */
        .auth-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover; /* Yeh image ko circle ke andar perfect fit karega */
        }

        .auth-logo-text {
          font-size: 28px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 3px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        .auth-logo-sub {
          font-size: 13px;
          color: #90CAF9;
          margin-top: 6px;
          letter-spacing: 0.5px;
          font-weight: 500;
        }

        /* ─── MAIN CARD ─── */
        .auth-card-wrap {
          position: relative;
          z-index: 1;
          background: #ffffff;
          border-radius: 24px;
          padding: 28px 24px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        }

        /* ─── TABS ─── */
        .auth-tabs {
          display: flex;
          background: #F0F4FF;
          border-radius: 14px;
          padding: 4px;
          margin-bottom: 24px;
        }

        .auth-tab {
          flex: 1; text-align: center; padding: 12px;
          font-size: 14px; font-weight: 800; cursor: pointer;
          border-radius: 10px; color: #5C6BC0;
          transition: all 0.3s ease;
        }
        .auth-tab:hover:not(.active) { color: #1565C0; }
        .auth-tab.active { 
          background: #1565C0; 
          color: #ffffff; 
          box-shadow: 0 4px 12px rgba(21,101,192,0.3); 
        }

        /* ─── FORM ELEMENTS ─── */
        .auth-fg { margin-bottom: 18px; }
        .auth-lbl { 
          font-size: 11px; color: #1565C0; font-weight: 800; 
          text-transform: uppercase; letter-spacing: 1px; 
          display: block; margin-bottom: 8px; margin-left: 4px;
        }

        .auth-input-wrapper { 
          position: relative; 
          display: flex; align-items: center; 
          background: #F8FBFF;
          border: 2px solid #E3EAFF; 
          border-radius: 12px; 
          overflow: hidden; 
          transition: all 0.3s ease; 
        }
        .auth-input-wrapper:focus-within { 
          border-color: #1976D2; 
          box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.1); 
          background: #ffffff;
        }

        .auth-icon { 
          padding-left: 14px; 
          color: #90CAF9; 
          font-size: 18px; 
        }
        .auth-prefix { 
          padding: 0 8px 0 10px; 
          color: #1565C0; font-weight: 800; font-size: 15px; 
        }

        .auth-input { 
          width: 100%; background: transparent; border: none; 
          padding: 14px 14px 14px 10px; color: #1A237E; 
          font-size: 15px; font-weight: 600; outline: none; 
        }
        .auth-input::placeholder { color: #9EBAED; font-weight: 500; }

        .auth-pass-wrap { width: 100%; }
        .auth-eye { 
          position: absolute; right: 14px; top: 50%; 
          transform: translateY(-50%); cursor: pointer; 
          font-size: 18px; 
        }

        /* ─── MESSAGES & BUTTONS ─── */
        .auth-err { 
          background: #FFEBEE; border-left: 4px solid #D32F2F; 
          border-radius: 8px; padding: 10px 14px; color: #C62828; 
          font-size: 13px; font-weight: 700; margin-bottom: 16px; 
        }

        .auth-btn {
          width: 100%;
          background: linear-gradient(135deg, #1565C0 0%, #1976D2 100%);
          color: #fff; border: none; border-radius: 12px;
          padding: 16px; font-size: 15px; font-weight: 800;
          cursor: pointer; letter-spacing: 1.5px; text-transform: uppercase;
          box-shadow: 0 6px 20px rgba(21,101,192,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 8px;
        }
        .auth-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(21,101,192,0.4); }
        .auth-btn:active:not(:disabled) { transform: translateY(1px); }
        .auth-btn:disabled { background: #90CAF9; box-shadow: none; cursor: not-allowed; }

        .auth-forgot {
          text-align: center;
          margin-top: 16px;
          font-size: 13px;
          color: #1976D2;
          font-weight: 700;
          cursor: pointer;
        }

        /* ─── FOOTER ─── */
        .auth-footer { 
          text-align: center; font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.4); margin-top: 30px; z-index: 1;
        }

        /* Autofill fix */
        input:-webkit-autofill, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #F8FBFF inset !important;
          -webkit-text-fill-color: #1A237E !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}