import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ── CORS SAFE CACHE FIX ──
function apiCall(path, method = 'GET', body = null) {
  const token = localStorage.getItem('mk_token');
  const url = method === 'GET' 
    ? `${API}${path}${path.includes('?') ? '&' : '?'}t=${new Date().getTime()}` 
    : `${API}${path}`;

  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  }).then(r => r.json());
}

// ── PREMIUM STYLES ──
const B = {
  card: { background: '#fff', borderRadius: 14, border: '1.5px solid #E3EAFF', boxShadow: '0 4px 15px rgba(30,136,229,0.06)', padding: 16, marginBottom: 12 },
  input: { width: '100%', background: '#F8FBFF', border: '2px solid #BBDEFB', borderRadius: 10, padding: '12px 14px', color: '#1A237E', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontWeight: 600, transition: 'all 0.2s' },
  btn: { width: '100%', background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1, boxShadow: '0 4px 14px rgba(21,101,192,0.3)' },
  label: { fontSize: 11, color: '#1565C0', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6, marginLeft: 4 },
  title: { fontSize: 16, fontWeight: 800, color: '#1A237E', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }
};

// ── CARDS ──
function UserCard({ u, onBlock, onAddCoins, onDeductCoins }) {
  return (
    <div style={B.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#1A237E' }}>{u.name}</div>
          <div style={{ fontSize: 13, color: '#5C6BC0', marginTop: 2, fontWeight: 600 }}>{u.mobile}</div>
        </div>
        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', background: u.is_blocked ? '#FFEBEE' : '#E8F5E9', color: u.is_blocked ? '#C62828' : '#2E7D32' }}>
          {u.is_blocked ? 'Blocked' : 'Active'}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{ background: '#F0F4FF', borderRadius: 10, padding: '10px 12px', border: '1px solid #E3EAFF' }}>
          <div style={{ fontSize: 10, color: '#1565C0', fontWeight: 800, marginBottom: 4 }}>WALLET</div>
          <div style={{ fontWeight: 900, fontSize: 15, color: '#1A237E' }}>₹{Number(u.wallet_balance || 0).toLocaleString()}</div>
        </div>
        <div style={{ background: '#F0F4FF', borderRadius: 10, padding: '10px 12px', border: '1px solid #E3EAFF' }}>
          <div style={{ fontSize: 10, color: '#1565C0', fontWeight: 800, marginBottom: 4 }}>WINNING</div>
          <div style={{ fontWeight: 900, fontSize: 15, color: '#2E7D32' }}>₹{Number(u.winning_balance || 0).toLocaleString()}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => onBlock(u.id, u.is_blocked)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 12, background: u.is_blocked ? '#E8F5E9' : '#FFF3E0', color: u.is_blocked ? '#2E7D32' : '#E65100', transition: '0.2s' }}>
          {u.is_blocked ? '✅ Unblock' : '🚫 Block'}
        </button>
        <button onClick={() => onAddCoins(u.id)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 12, background: '#E8F5E9', color: '#2E7D32', transition: '0.2s' }}>+ Coins</button>
        <button onClick={() => onDeductCoins(u.id)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 12, background: '#FFEBEE', color: '#C62828', transition: '0.2s' }}>- Coins</button>
      </div>
    </div>
  );
}

function DepositCard({ d, onApprove, onReject }) {
  return (
    <div style={B.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#1A237E' }}>{d.name}</div>
          <div style={{ fontSize: 13, color: '#5C6BC0', fontWeight: 600 }}>{d.mobile}</div>
        </div>
        <div style={{ fontWeight: 900, fontSize: 20, color: '#2E7D32' }}>₹{Number(d.amount).toLocaleString()}</div>
      </div>
      {d.transaction_id && (
        <div style={{ background: '#F8FBFF', border: '1.5px solid #BBDEFB', borderRadius: 8, padding: '8px 12px', marginBottom: 8, fontSize: 13, color: '#1565C0' }}>
          UTR: <strong style={{ color: '#1A237E' }}>{d.transaction_id}</strong>
        </div>
      )}
      {d.upi_id && <div style={{ fontSize: 13, color: '#5C6BC0', marginBottom: 8, fontWeight: 600 }}>UPI: {d.upi_id}</div>}
      <div style={{ fontSize: 11, color: '#90CAF9', marginBottom: 12, fontWeight: 600 }}>{new Date(d.created_at).toLocaleString('en-IN')}</div>
      
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', background: d.status === 'approved' ? '#E8F5E9' : d.status === 'rejected' ? '#FFEBEE' : '#FFF3E0', color: d.status === 'approved' ? '#2E7D32' : d.status === 'rejected' ? '#C62828' : '#E65100' }}>
          {d.status}
        </span>
        {d.status === 'pending' && <>
          <button onClick={() => onApprove(d.id)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 12, background: '#E8F5E9', color: '#2E7D32' }}>✅ Approve</button>
          <button onClick={() => onReject(d.id)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 12, background: '#FFEBEE', color: '#C62828' }}>❌ Reject</button>
        </>}
      </div>
    </div>
  );
}

function WithdrawCard({ w, onApprove, onReject }) {
  const isBank = w.method === 'bank' || w.account_number;
  return (
    <div style={B.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#1A237E' }}>{w.name}</div>
          <div style={{ fontSize: 13, color: '#5C6BC0', fontWeight: 600 }}>{w.mobile}</div>
        </div>
        <div style={{ fontWeight: 900, fontSize: 20, color: '#C62828' }}>₹{Number(w.amount).toLocaleString()}</div>
      </div>

      <div style={{ background: '#F8FBFF', border: '1.5px solid #BBDEFB', borderRadius: 10, padding: '12px', marginBottom: 12 }}>
        {isBank ? <>
          <div style={{ fontSize: 11, color: '#1565C0', fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>🏦 BANK TRANSFER</div>
          <div style={{ fontSize: 13, color: '#1A237E', lineHeight: 1.8, fontWeight: 600 }}>
            <span style={{ color: '#5C6BC0' }}>Name:</span> <strong>{w.account_name}</strong><br />
            <span style={{ color: '#5C6BC0' }}>A/C No:</span> <strong>{w.account_number}</strong><br />
            <span style={{ color: '#5C6BC0' }}>IFSC:</span> <strong>{w.ifsc_code}</strong><br />
            <span style={{ color: '#5C6BC0' }}>Bank:</span> <strong>{w.bank_name}</strong>
          </div>
        </> : <>
          <div style={{ fontSize: 11, color: '#1565C0', fontWeight: 900, marginBottom: 6, textTransform: 'uppercase' }}>📱 UPI TRANSFER</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1A237E' }}>{w.upi_id}</div>
          {w.account_name && <div style={{ fontSize: 13, color: '#5C6BC0', fontWeight: 600, marginTop: 4 }}>{w.account_name}</div>}
        </>}
      </div>

      <div style={{ fontSize: 11, color: '#90CAF9', marginBottom: 12, fontWeight: 600 }}>{new Date(w.created_at).toLocaleString('en-IN')}</div>
      
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', background: w.status === 'approved' ? '#E8F5E9' : w.status === 'rejected' ? '#FFEBEE' : '#FFF3E0', color: w.status === 'approved' ? '#2E7D32' : w.status === 'rejected' ? '#C62828' : '#E65100' }}>
          {w.status}
        </span>
        {w.status === 'pending' && <>
          <button onClick={() => onApprove(w.id)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 12, background: '#E8F5E9', color: '#2E7D32' }}>✅ Approve</button>
          <button onClick={() => onReject(w.id)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 12, background: '#FFEBEE', color: '#C62828' }}>❌ Reject</button>
        </>}
      </div>
    </div>
  );
}

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────
export function AdminLogin({ onLogin }) {
  const [mobile, setMobile]     = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr]           = useState('');
  const [loading, setLoading]   = useState(false);

  const go = async () => {
    setErr('');
    if (!mobile || !password) { setErr('Mobile aur password daalo'); return; }
    setLoading(true);
    try {
      const data = await apiCall('/api/auth/login', 'POST', { mobile, password });
      if (!data.success) { setErr(data.message || 'Login failed'); setLoading(false); return; }
      if (data.user.role !== 'admin') { setErr('Yeh account admin nahi hai'); setLoading(false); return; }
      localStorage.setItem('mk_token', data.token);
      onLogin(data.user);
    } catch {
      setErr('Server se connect nahi ho pa raha.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f0f4ff', padding: 24, fontFamily: '"Segoe UI", sans-serif' }}>
      
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 25px rgba(21,101,192,0.2)', border: '3px solid #1565C0' }}>
          <span style={{ fontSize: 36 }}>👑</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#1A237E', letterSpacing: 1.5 }}>ADMIN PANEL</div>
        <div style={{ fontSize: 13, color: '#1565C0', fontWeight: 700, marginTop: 4 }}>SAKTA MATKA SECURE LOGIN</div>
      </div>

      <div style={{ background: '#fff', borderRadius: 20, padding: 30, width: '100%', maxWidth: 360, boxShadow: '0 15px 35px rgba(21,101,192,0.1)', border: '1.5px solid #E3EAFF' }}>
        <label style={B.label}>Mobile Number</label>
        <input type="tel" placeholder="Admin Mobile" maxLength={10} value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} style={B.input} />
        
        <label style={B.label}>Password</label>
        <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()} style={B.input} />
        
        {err && <div style={{ background: '#FFEBEE', borderLeft: '4px solid #D32F2F', borderRadius: 8, padding: '10px 14px', color: '#C62828', fontSize: 13, fontWeight: 700, marginBottom: 16 }}>⚠️ {err}</div>}
        
        <button onClick={go} disabled={loading} style={{ ...B.btn, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
          {loading ? '⏳ VERIFYING...' : '🚀 SECURE LOGIN'}
        </button>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL MAIN ──────────────────────────────────────────────────────────────
export default function AdminPanel({ onLogout }) {
  const [page, setPage]               = useState('dashboard');
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [stats, setStats]             = useState(null);
  const [users, setUsers]             = useState([]);
  const [games, setGames]             = useState([]);
  const [deposits, setDeposits]       = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [bids, setBids]               = useState([]);
  const [newGame, setNewGame]         = useState({ name: '', open_time: '', close_time: '' });
  const [resultForm, setResultForm]   = useState({});
  const [toast, setToast]             = useState('');
  const [loading, setLoading]         = useState(false);
  
  const [notices, setNotices]         = useState([]);
  const [noticeMsg, setNoticeMsg]     = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  const [settings, setSettings]           = useState({ upi_id: '', site_name: '', whatsapp: '' });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [support, setSupport]           = useState({
    phone:            '9999999999',
    whatsapp:         '',
    telegram:         'matkaking_support',
    support_hours:    'Mon–Sat 10AM–8PM',
    support_email:    '',
    telegram_channel: '',
  });
  const [supportSaved, setSupportSaved] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchPageData = (currentPage, isInitial = false) => {
    if (isInitial) setLoading(true);

    if (currentPage === 'dashboard') {
      apiCall('/api/admin/stats').then(d => {
        if (d.success) { setStats(d.stats); setLastRefresh(new Date()); }
        if (isInitial) setLoading(false);
      }).catch(() => { if (isInitial) setLoading(false); });

    } else if (currentPage === 'users') {
      apiCall('/api/admin/users').then(d => {
        if (d.success) { setUsers(d.users); setLastRefresh(new Date()); }
        if (isInitial) setLoading(false);
      }).catch(() => { if (isInitial) setLoading(false); });

    } else if (currentPage === 'games' || currentPage === 'results') {
      apiCall('/api/admin/games').then(d => {
        if (d.success) { setGames(d.games); setLastRefresh(new Date()); }
        if (isInitial) setLoading(false);
      }).catch(() => { if (isInitial) setLoading(false); });

    } else if (currentPage === 'deposits') {
      apiCall('/api/admin/deposits').then(d => {
        if (d.success) { setDeposits(d.deposits); setLastRefresh(new Date()); }
        if (isInitial) setLoading(false);
      }).catch(() => { if (isInitial) setLoading(false); });

    } else if (currentPage === 'withdrawals') {
      apiCall('/api/admin/withdrawals').then(d => {
        if (d.success) { setWithdrawals(d.withdrawals); setLastRefresh(new Date()); }
        if (isInitial) setLoading(false);
      }).catch(() => { if (isInitial) setLoading(false); });

    } else if (currentPage === 'bids') {
      apiCall('/api/admin/bids').then(d => {
        if (d.success) { setBids(d.bids); setLastRefresh(new Date()); }
        if (isInitial) setLoading(false);
      }).catch(() => { if (isInitial) setLoading(false); });
      
    } else if (currentPage === 'notices') {
      apiCall('/api/admin/notices').then(d => {
        if (d.success) { setNotices(d.notices || []); setLastRefresh(new Date()); }
        if (isInitial) setLoading(false);
      }).catch(() => { if (isInitial) setLoading(false); });

    } else if (currentPage === 'settings' || currentPage === 'support') {
      apiCall('/api/admin/settings').then(d => {
        if (d.success && d.settings) {
          setSettings(d.settings);
          setSupport(prev => ({
            phone:            d.settings.phone            || d.settings.support_phone    || prev.phone,
            whatsapp:         d.settings.whatsapp         || d.settings.whatsapp_number  || prev.whatsapp,
            telegram:         d.settings.telegram         || d.settings.telegram_user    || prev.telegram,
            support_hours:    d.settings.support_hours    || prev.support_hours,
            support_email:    d.settings.support_email    || prev.support_email,
            telegram_channel: d.settings.telegram_channel || prev.telegram_channel,
          }));
        }
        if (isInitial) setLoading(false);
      }).catch(() => { if (isInitial) setLoading(false); });

    } else {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData(page, true);
    const realtimePages = ['dashboard', 'bids', 'deposits', 'withdrawals', 'notices'];
    let interval = null;
    if (realtimePages.includes(page)) {
      interval = setInterval(() => { fetchPageData(page, false); }, 15000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [page]);

  const navigateTo = (id) => { setPage(id); setDrawerOpen(false); };

  // ── USER ACTIONS ──
  const toggleBlock = async (id, blocked) => {
    const res = await apiCall(`/api/admin/users/${id}/block`, 'PUT', { block: !blocked });
    if (res.success) {
      setUsers(us => us.map(u => u.id === id ? { ...u, is_blocked: !blocked } : u));
      showToast(blocked ? 'User unblocked ✅' : 'User blocked 🚫');
    }
  };

  const addCoins = async (id) => {
    const a = prompt('Kitne coins ADD karne hain?');
    if (!a) return;
    const res = await apiCall(`/api/admin/users/${id}/coins`, 'PUT', { amount: Number(a), action: 'add', wallet: 'wallet' });
    if (res.success) { showToast('Coins added ✅'); fetchPageData('users', false); } 
    else showToast('Error: ' + res.message);
  };

  const deductCoins = async (id) => {
    const a = prompt('Kitne coins DEDUCT karne hain?');
    if (!a) return;
    const res = await apiCall(`/api/admin/users/${id}/coins`, 'PUT', { amount: Number(a), action: 'deduct', wallet: 'wallet' });
    if (res.success) { showToast('Coins deducted ✅'); fetchPageData('users', false); } 
    else showToast('Error: ' + res.message);
  };

  // ── GAME ACTIONS ──
  const addGame = async () => {
    if (!newGame.name || !newGame.open_time || !newGame.close_time) { showToast('Saari details bhariye!'); return; }
    const res = await apiCall('/api/admin/games', 'POST', { ...newGame, category: 'regular' });
    if (res.success) {
      setGames(gs => [...gs, res.game || res.data]);
      setNewGame({ name: '', open_time: '', close_time: '' });
      showToast('Game added ✅');
      fetchPageData('games');
    } else showToast('Error: ' + res.message);
  };

  const toggleGameStatus = async (id, status) => {
    const newStatus = status === 'open' ? 'closed' : 'open';
    const res = await apiCall(`/api/admin/games/${id}/status`, 'PUT', { status: newStatus });
    if (res.success) {
      setGames(gs => gs.map(g => g.id === id ? { ...g, status: newStatus } : g));
      showToast(`Game ${newStatus} ✅`);
    }
  };

  const declareResult = async (gameId) => {
    const val = resultForm[gameId];
    if (!val) return;
    const parts = val.split('-');
    const res = await apiCall(`/api/admin/games/${gameId}/result`, 'PUT', { open_result: parts[0] || '', close_result: parts[1] || '' });
    if (res.success) {
      setGames(gs => gs.map(g => g.id === gameId ? { ...g, result: val } : g));
      setResultForm(rf => ({ ...rf, [gameId]: '' }));
      showToast('Result declared! Winners credited ✅');
    } else showToast('Error: ' + (res.message || 'Failed'));
  };

  // ── DEPOSIT / WITHDRAWAL ──
  const updateDeposit = async (id, action) => {
    const res = await apiCall(`/api/admin/deposits/${id}`, 'PUT', { action });
    if (res.success) {
      setDeposits(ds => ds.map(d => d.id === id ? { ...d, status: action === 'approve' ? 'approved' : 'rejected' } : d));
      showToast(`Deposit ${action}d ✅`);
    }
  };
  const updateWithdrawal = async (id, action) => {
    const res = await apiCall(`/api/admin/withdrawals/${id}`, 'PUT', { action });
    if (res.success) {
      setWithdrawals(ws => ws.map(w => w.id === id ? { ...w, status: action === 'approve' ? 'approved' : 'rejected' } : w));
      showToast(`Withdrawal ${action}d ✅`);
    }
  };

  // ── SETTINGS SAVE ──
  const saveSettings = async () => {
    const res = await apiCall('/api/admin/settings', 'POST', settings);
    if (res.success) { setSettingsSaved(true); showToast('Settings saved ✅'); setTimeout(() => setSettingsSaved(false), 2000); }
    else showToast('Error saving settings');
  };

  const saveSupport = async () => {
    const merged = { ...settings, ...support };
    const res = await apiCall('/api/admin/settings', 'POST', merged);
    if (res.success) { setSupportSaved(true); showToast('Support settings saved ✅'); setTimeout(() => setSupportSaved(false), 2000); } 
    else showToast('Error saving support settings');
  };

  const SIDEBAR = [
    { id: 'dashboard',   ic: '📊', l: 'Dashboard' },
    { id: 'users',       ic: '👥', l: 'Users' },
    { id: 'games',       ic: '🎮', l: 'Games' },
    { id: 'deposits',    ic: '💰', l: 'Deposits' },
    { id: 'withdrawals', ic: '💸', l: 'Withdrawals' },
    { id: 'bids',        ic: '🎯', l: 'All Bids' },
    { id: 'results',     ic: '🏆', l: 'Declare Result' },
    { id: 'notices',     ic: '🔔', l: 'Notices' },
    { id: 'settings',    ic: '⚙️', l: 'Settings' },
    { id: 'support',     ic: '💬', l: 'Support System' },
  ];

  const pageTitles = {
    dashboard:   '📊 Dashboard',
    users:       '👥 Users',
    games:       '🎮 Manage Games',
    deposits:    '💰 Deposit Requests',
    withdrawals: '💸 Withdrawal Requests',
    bids:        '🎯 All Player Bids',
    results:     '🏆 Declare Results',
    notices:     '🔔 Notices & Alerts',
    settings:    '⚙️ Global Settings',
    support:     '💬 Support Details',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f4ff', fontFamily: '"Segoe UI", sans-serif' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#1A237E', color: '#fff', padding: '14px 24px', borderRadius: 12, borderLeft: '4px solid #2E7D32', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 9999, fontWeight: 700, fontSize: 14 }}>
          {toast}
        </div>
      )}

      {/* NAVBAR */}
      <div style={{ background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', position: 'sticky', top: 0, zIndex: 200, flexShrink: 0, boxShadow: '0 2px 15px rgba(21,101,192,0.2)' }}>
        <button onClick={() => setDrawerOpen(true)} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 10, width: 40, height: 40, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 0 }}>
          {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: 20, height: 2.5, background: '#fff', borderRadius: 2 }} />)}
        </button>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: 1.5 }}>
          SAKTA MATKA <span style={{ fontSize: 12, fontWeight: 700, background: '#fff', color: '#1565C0', padding: '2px 8px', borderRadius: 10, verticalAlign: 'middle', marginLeft: 6 }}>ADMIN</span>
        </div>
        <button onClick={() => { localStorage.removeItem('mk_token'); onLogout(); }} style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '8px 16px', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
          LOGOUT
        </button>
      </div>

      {/* DRAWER OVERLAY */}
      {drawerOpen && <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 300 }} />}

      {/* SIDE DRAWER */}
      <div style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: 280, background: '#ffffff', zIndex: 400, overflowY: 'auto', paddingBottom: 40, transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', boxShadow: drawerOpen ? '5px 0 30px rgba(21,101,192,0.15)' : 'none' }}>
        <div style={{ background: 'linear-gradient(135deg, #1565C0, #1E88E5)', padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>SAKTA MATKA</div>
            <div style={{ fontSize: 12, color: '#BBDEFB', marginTop: 4, fontWeight: 600 }}>Admin Control Panel</div>
          </div>
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: '#fff', fontSize: 18, fontWeight: 'bold' }}>✕</button>
        </div>

        <div style={{ fontSize: 11, color: '#90CAF9', letterSpacing: 1.5, textTransform: 'uppercase', padding: '20px 20px 8px', fontWeight: 800 }}>Navigation</div>
        
        {SIDEBAR.map(s => (
          <div key={s.id} onClick={() => navigateTo(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid #F8FBFF', background: page === s.id ? '#E3F2FD' : 'transparent', borderLeft: page === s.id ? '4px solid #1565C0' : '4px solid transparent', color: page === s.id ? '#1565C0' : '#5C6BC0', fontSize: 15, fontWeight: page === s.id ? 800 : 600, transition: 'all 0.2s' }}>
            <span style={{ fontSize: 20, width: 26, textAlign: 'center' }}>{s.ic}</span>
            {s.l}
            {page === s.id && <span style={{ marginLeft: 'auto', color: '#1565C0', fontSize: 16 }}>›</span>}
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#1A237E' }}>{pageTitles[page]}</div>
          {['dashboard','bids','deposits','withdrawals','notices'].includes(page) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#E8F5E9', border: '1.5px solid #A5D6A7', borderRadius: 20, padding: '6px 12px', fontSize: 11, color: '#2E7D32', fontWeight: 800 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E7D32', display: 'inline-block', animation: 'pulse 2s infinite' }}/>
              LIVE
              {lastRefresh && <span style={{ color: '#81C784', marginLeft: 4 }}>· {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
            </div>
          )}
        </div>

        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }`}</style>

        {loading && <div style={{ textAlign: 'center', padding: 50, color: '#90CAF9', fontSize: 16, fontWeight: 700 }}>⏳ Loading Data...</div>}

        {/* DASHBOARD */}
        {!loading && page === 'dashboard' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { val: stats.total_users || 0, label: 'Total Users', color: '#1565C0', icon: '👥' },
              { val: stats.active_games || 0, label: 'Active Games', color: '#7B1FA2', icon: '🎮' },
              { val: stats.today_bids?.count || 0, label: 'Aaj ke Bids', color: '#E65100', icon: '🎯' },
              { val: '₹' + (stats.today_bids?.volume || 0).toLocaleString(), label: 'Bid Volume', color: '#E65100', icon: '📈' },
              { val: stats.pending_deposits?.count || 0, label: 'Pending Deposits', color: '#C62828', icon: '⏳' },
              { val: '₹' + (stats.pending_deposits?.volume || 0).toLocaleString(), label: 'Pending Dep. Amt', color: '#C62828', icon: '💳' },
              { val: stats.pending_withdrawals?.count || 0, label: 'Pending Withdraw', color: '#D84315', icon: '🔄' },
              { val: '₹' + (stats.pending_withdrawals?.volume || 0).toLocaleString(), label: 'Pending With. Amt', color: '#D84315', icon: '💵' },
              { val: '₹' + (stats.total_deposited || 0).toLocaleString(), label: 'Total Deposited', color: '#0277BD', icon: '🏦' },
              { val: '₹' + (stats.total_winnings_paid || 0).toLocaleString(), label: 'Winnings Paid', color: '#2E7D32', icon: '🏆' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px', boxShadow: '0 4px 15px rgba(30,136,229,0.06)', border: '1.5px solid #E3EAFF', borderLeft: `5px solid ${s.color}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: '#5C6BC0', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4, fontWeight: 800 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* USERS */}
        {!loading && page === 'users' && (
          <div>
            {users.length === 0 ? <div style={{ textAlign: 'center', color: '#90CAF9', padding: 40, fontWeight: 700 }}>Koi user nahi mila</div> : users.map(u => <UserCard key={u.id} u={u} onBlock={toggleBlock} onAddCoins={addCoins} onDeductCoins={deductCoins} />)}
          </div>
        )}

        {/* GAMES */}
        {!loading && page === 'games' && <>
          <div style={B.card}>
            <div style={B.title}>➕ Add New Game</div>
            <input style={B.input} placeholder="Game Name (e.g. Kalyan)" value={newGame.name} onChange={e => setNewGame({ ...newGame, name: e.target.value })} />
            <div style={{ display: 'flex', gap: 10 }}>
              <input style={{ ...B.input, flex: 1 }} placeholder="Open Time (e.g. 10:00 AM)" value={newGame.open_time} onChange={e => setNewGame({ ...newGame, open_time: e.target.value })} />
              <input style={{ ...B.input, flex: 1 }} placeholder="Close Time (e.g. 12:00 PM)" value={newGame.close_time} onChange={e => setNewGame({ ...newGame, close_time: e.target.value })} />
            </div>
            <button style={B.btn} onClick={addGame}>+ ADD GAME</button>
          </div>

          <div style={B.card}>
            <div style={B.title}>🎮 All Games</div>
            {games.length === 0 ? <div style={{ color: '#90CAF9', textAlign: 'center', padding: 20, fontWeight: 700 }}>No games found.</div> : 
              games.map(g => (
              <div key={g.id} style={{ background: '#F8FBFF', borderRadius: 12, padding: '14px', marginBottom: 12, border: '1.5px solid #BBDEFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, opacity: g.is_hidden ? 0.6 : 1 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#1A237E' }}>{g.name} {g.is_hidden && <span style={{ fontSize: 11, color: '#C62828', background: '#FFEBEE', padding: '2px 6px', borderRadius: 6 }}>(HIDDEN)</span>}</div>
                  <div style={{ fontSize: 12, color: '#5C6BC0', marginTop: 4, fontWeight: 600 }}>{g.open_time} – {g.close_time}</div>
                  <div style={{ fontSize: 13, color: '#1565C0', marginTop: 4, fontWeight: 800 }}>Result: <strong style={{ color: '#E65100', fontSize: 15 }}>{g.result || '***-**-***'}</strong></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={async () => {
                        const res = await apiCall(`/api/admin/games/${g.id}/hide`, 'PUT', { hide: !g.is_hidden });
                        if(res.success) { showToast(g.is_hidden ? 'Game Show Kar Diya!' : 'Game Hide Kar Diya!'); setGames(gs => gs.map(item => item.id === g.id ? { ...item, is_hidden: !g.is_hidden } : item)); }
                      }}
                      style={{ padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: g.is_hidden ? '#E8F5E9' : '#FFF3E0', color: g.is_hidden ? '#2E7D32' : '#E65100', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}
                    >{g.is_hidden ? '👁️ Show' : '🙈 Hide'}</button>
                    
                    <button onClick={async () => {
                        if(!window.confirm(`Kya aap "${g.name}" ko delete karna chahte hain?`)) return;
                        const res = await apiCall(`/api/admin/games/${g.id}`, 'DELETE');
                        if(res.success) { showToast('Game Delete Ho Gaya! 🗑️'); setGames(prev => prev.filter(item => item.id !== g.id)); }
                      }}
                      style={{ padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#FFEBEE', color: '#C62828', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}
                    >🗑️ Delete</button>
                  </div>
                  <button onClick={() => toggleGameStatus(g.id, g.status)} style={{ padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 11, background: g.status === 'open' ? '#E8F5E9' : '#FFEBEE', color: g.status === 'open' ? '#2E7D32' : '#C62828', textTransform: 'uppercase' }}>
                    STATUS: {g.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>}

        {/* DEPOSITS */}
        {!loading && page === 'deposits' && (
          <div>
            {deposits.length === 0 ? <div style={{ textAlign: 'center', color: '#90CAF9', padding: 40, fontWeight: 700 }}>Koi deposit request nahi</div> : deposits.map(d => <DepositCard key={d.id} d={d} onApprove={id => updateDeposit(id, 'approve')} onReject={id => updateDeposit(id, 'reject')} />)}
          </div>
        )}

        {/* WITHDRAWALS */}
        {!loading && page === 'withdrawals' && (
          <div>
            {withdrawals.length === 0 ? <div style={{ textAlign: 'center', color: '#90CAF9', padding: 40, fontWeight: 700 }}>Koi withdrawal request nahi</div> : withdrawals.map(w => <WithdrawCard key={w.id} w={w} onApprove={id => updateWithdrawal(id, 'approve')} onReject={id => updateWithdrawal(id, 'reject')} />)}
          </div>
        )}

        {/* BIDS */}
        {!loading && page === 'bids' && (
          <div>
            {bids.length === 0 ? <div style={{ textAlign: 'center', color: '#90CAF9', padding: 40, fontWeight: 700 }}>Koi bid nahi mili</div> : bids.map(b => (
              <div key={b.id} style={B.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 900, color: '#1A237E', fontSize: 15 }}>{b.name} <span style={{ color: '#5C6BC0', fontSize: 12, fontWeight: 600 }}>({b.mobile})</span></div>
                  <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', background: b.status === 'win' ? '#E8F5E9' : b.status === 'loss' ? '#FFEBEE' : '#FFF3E0', color: b.status === 'win' ? '#2E7D32' : b.status === 'loss' ? '#C62828' : '#E65100' }}>{b.status}</span>
                </div>
                <div style={{ background: '#F8FBFF', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#1A237E', lineHeight: 1.8, fontWeight: 600, border: '1px solid #BBDEFB' }}>
                  Game: <strong style={{ color: '#1565C0' }}>{b.game_name}</strong> · Session: <strong style={{ color: '#E65100' }}>{b.session ? b.session.toUpperCase() : 'N/A'}</strong> · Type: <strong>{b.game_type}</strong><br />
                  Number: <strong style={{ fontSize: 16 }}>{b.number}</strong> · Amount: <strong style={{ color: '#2E7D32', fontSize: 16 }}>₹{Number(b.amount).toLocaleString()}</strong>
                </div>
                <div style={{ fontSize: 11, color: '#90CAF9', marginTop: 10, fontWeight: 600 }}>{new Date(b.created_at).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        )}

        {/* DECLARE RESULT */}
        {!loading && page === 'results' && (
          <div style={B.card}>
            <div style={B.title}>🏆 Declare Results</div>
            <div style={{ background: '#FFF8E1', border: '1.5px solid #FFE082', borderRadius: 10, padding: '12px', color: '#E65100', fontSize: 12, marginBottom: 16, fontWeight: 600, lineHeight: 1.6 }}>
              Format: <strong>OpenPana-ClosePana</strong> (e.g. <code>128-456</code>)<br />
              Digit auto-calculate hoga. Winners ko winning_balance credit milega.
            </div>
            {games.map(g => (
              <div key={g.id} style={{ background: '#F8FBFF', borderRadius: 12, padding: '14px', marginBottom: 12, border: '1.5px solid #BBDEFB' }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#1A237E', marginBottom: 4 }}>{g.name}</div>
                <div style={{ fontSize: 12, color: '#5C6BC0', marginBottom: 12, fontWeight: 600 }}>
                  {g.open_time} – {g.close_time} · Current Result: <strong style={{ color: '#E65100', fontSize: 14 }}>{g.result || '***-**-***'}</strong>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input style={{ ...B.input, flex: 1, marginBottom: 0 }} placeholder="e.g. 128-456" value={resultForm[g.id] || ''} onChange={e => setResultForm(rf => ({ ...rf, [g.id]: e.target.value }))} />
                  <button style={{ ...B.btn, width: 'auto', padding: '12px 24px', background: '#2E7D32' }} onClick={() => declareResult(g.id)}>SET RESULT</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NOTICES */}
        {!loading && page === 'notices' && (
          <div style={B.card}>
            <div style={B.title}>🔔 Send Notification</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <input style={{ ...B.input, flex: 1, marginBottom: 0 }} placeholder="Message likhein..." value={noticeMsg} onChange={e => setNoticeMsg(e.target.value)} />
              <button style={{ ...B.btn, width: 'auto', padding: '12px 24px' }} onClick={async () => {
                if(!noticeMsg) return;
                const res = await apiCall('/api/admin/notices', 'POST', { message: noticeMsg, type: 'info' });
                if(res.success) { showToast('Notice sent ✅'); setNoticeMsg(''); fetchPageData('notices'); } else showToast('Error: ' + res.message);
              }}>SEND NOTIFY</button>
            </div>

            <div style={{ ...B.title, marginTop: 10 }}>📋 Active Notifications</div>
            {notices.length === 0 ? (
              <div style={{ color: '#90CAF9', fontSize: 13, fontWeight: 700, padding: 10 }}>Koi active notice nahi hai.</div>
            ) : (
              notices.map(n => (
                <div key={n.id} style={{ background: '#F8FBFF', padding: '14px', borderRadius: 10, marginBottom: 10, borderLeft: '4px solid #1565C0', border: '1px solid #E3EAFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#1A237E', fontSize: 14, fontWeight: 600, flex: 1, paddingRight: 10 }}>{n.message}</div>
                  <button onClick={async () => {
                    if(!window.confirm('Delete this notice?')) return;
                    const res = await apiCall(`/api/admin/notices/${n.id}`, 'DELETE');
                    if(res.success) { showToast('Notice deleted ✅'); fetchPageData('notices'); }
                  }} style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 800 }}>DELETE</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* SETTINGS */}
        {!loading && page === 'settings' && (
          <div style={B.card}>
            <div style={B.title}>⚙️ Global Settings</div>

            <label style={B.label}>UPI ID (QR auto-update hoga)</label>
            <input style={B.input} placeholder="yourname@upi" value={settings.upi_id || ''} onChange={e => setSettings(s => ({ ...s, upi_id: e.target.value }))} />

            {settings.upi_id && (
              <div style={{ textAlign: 'center', margin: '16px 0 24px', background: '#F8FBFF', padding: 16, borderRadius: 12, border: '1.5px solid #BBDEFB' }}>
                <div style={{ fontSize: 12, color: '#1565C0', marginBottom: 10, fontWeight: 800 }}>LIVE QR PREVIEW:</div>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent('upi://pay?pa=' + settings.upi_id + '&pn=MatkaKing&cu=INR')}`} alt="UPI QR" style={{ borderRadius: 12, border: '3px solid #1565C0', display: 'inline-block' }} />
                <div style={{ fontSize: 15, color: '#1A237E', marginTop: 10, fontWeight: 900 }}>{settings.upi_id}</div>
              </div>
            )}

            <label style={B.label}>WhatsApp Number</label>
            <input style={B.input} placeholder="91XXXXXXXXXX" value={settings.whatsapp || ''} onChange={e => setSettings(s => ({ ...s, whatsapp: e.target.value }))} />

            <label style={B.label}>Site Name</label>
            <input style={B.input} placeholder="MatkaKing" value={settings.site_name || ''} onChange={e => setSettings(s => ({ ...s, site_name: e.target.value }))} />

            <button style={{ ...B.btn, marginTop: 12 }} onClick={saveSettings}>{settingsSaved ? '✅ SAVED!' : '💾 SAVE SETTINGS'}</button>
          </div>
        )}

        {/* SUPPORT SYSTEM */}
        {!loading && page === 'support' && (
          <div>
            <div style={{ background: '#E8F5E9', border: '1.5px solid #A5D6A7', borderRadius: 12, padding: '14px', marginBottom: 16, fontSize: 13, color: '#2E7D32', fontWeight: 600 }}>
              💡 Yahan jo bhi change karoge, woh app ke <strong>Support page</strong> pe users ko turant dikhega.
            </div>

            <div style={B.card}>
              <div style={B.title}>📞 Contact Details</div>
              <label style={B.label}>Phone Number</label>
              <input style={B.input} type="tel" placeholder="9999999999" maxLength={15} value={support.phone} onChange={e => setSupport(s => ({ ...s, phone: e.target.value }))} />
              
              <label style={B.label}>WhatsApp Number (with country code)</label>
              <input style={B.input} type="tel" placeholder="919999999999" value={support.whatsapp} onChange={e => setSupport(s => ({ ...s, whatsapp: e.target.value }))} />
              
              <label style={B.label}>Telegram Username</label>
              <input style={B.input} placeholder="matkaking_support" value={support.telegram} onChange={e => setSupport(s => ({ ...s, telegram: e.target.value.replace('@','') }))} />
              
              <label style={B.label}>Telegram Channel (optional)</label>
              <input style={B.input} placeholder="matkaking_official" value={support.telegram_channel} onChange={e => setSupport(s => ({ ...s, telegram_channel: e.target.value.replace('@','') }))} />
              
              <label style={B.label}>Support Email (optional)</label>
              <input style={B.input} type="email" placeholder="support@matkaking.com" value={support.support_email} onChange={e => setSupport(s => ({ ...s, support_email: e.target.value }))} />
            </div>

            <div style={B.card}>
              <div style={B.title}>🕐 Support Hours</div>
              <label style={B.label}>Support Timing Text</label>
              <input style={B.input} placeholder="Mon–Sat 10AM–8PM" value={support.support_hours} onChange={e => setSupport(s => ({ ...s, support_hours: e.target.value }))} />
            </div>

            <button onClick={saveSupport} style={{ ...B.btn, background: supportSaved ? '#2E7D32' : B.btn.background, marginBottom: 30 }}>
              {supportSaved ? '✅ SUPPORT SETTINGS SAVED!' : '💾 SAVE SUPPORT SETTINGS'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}