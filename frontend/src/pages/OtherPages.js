import React, { useState, useEffect } from 'react';

// ── PREMIUM DARK THEME SHARED STYLES ──
const B = {
  page:      { background: '#0B192C', minHeight: '100vh', paddingBottom: 80, color: '#fff', fontFamily: '"Segoe UI", sans-serif' },
  header:    { background: '#0B192C', padding: '16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 10 },
  headerTxt: { fontSize: 18, fontWeight: 900, color: '#ffffff', letterSpacing: 1.5, textShadow: '0 2px 10px rgba(0,0,0,0.5)' },
  card:      { background: '#162846', borderRadius: 16, border: '1.5px solid #233A5E', boxShadow: '0 8px 25px rgba(0,0,0,0.3)', margin: '12px', padding: '16px' },
  label:     { fontSize: 11, color: '#90CAF9', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, display: 'block', marginLeft: 4 },
  input:     { width: '100%', background: '#0B192C', border: '2px solid #233A5E', borderRadius: 12, padding: '14px', color: '#fff', fontSize: 15, fontWeight: 600, outline: 'none', marginBottom: 16, boxSizing: 'border-box', transition: 'border 0.2s', fontFamily: 'inherit' },
  btn:       { width: '100%', background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)', color: '#fff', border: 'none', borderRadius: 14, padding: 16, fontSize: 15, fontWeight: 800, cursor: 'pointer', letterSpacing: 1.5, textTransform: 'uppercase', boxShadow: '0 6px 20px rgba(21,101,192,0.3)' },
  badge:     (color) => ({ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', background: color === 'green' ? 'rgba(46,125,50,0.2)' : color === 'red' ? 'rgba(198,40,40,0.2)' : 'rgba(230,81,0,0.2)', color: color === 'green' ? '#81C784' : color === 'red' ? '#E57373' : '#FFB74D' }),
};

function SubHeader({ title, onBack, rightBtn }) {
  return (
    <div style={B.header}>
      {onBack && <div onClick={onBack} style={{ fontSize: 26, cursor: 'pointer', color: '#fff', lineHeight: 1, fontWeight: 300, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>‹</div>}
      <div style={{ ...B.headerTxt, flex: 1 }}>{title}</div>
      {rightBtn}
    </div>
  );
}

// ── MY BIDS PAGE ──
export function BidsPage({ apiCall }) {
  const [bids, setBids] = useState([]);
  const [summary, setSummary] = useState({ total_bids: 0, won_bids: 0, lost_bids: 0, pending_bids: 0, total_win_amount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (apiCall) {
      apiCall('/api/games/bids/my').then(res => {
        if (res.success) {
            if (res.bids) setBids(res.bids);
            if (res.summary) setSummary(res.summary);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [apiCall]);

  const winAmt = Number(summary.total_win_amount || 0);

  const statCards = [
    { icon: '🎯', val: summary.total_bids || 0,    label: 'Total Bids',  color: '#90CAF9' },
    { icon: '🏆', val: summary.won_bids || 0,      label: 'Won',         color: '#81C784' },
    { icon: '💔', val: summary.lost_bids || 0,     label: 'Lost',        color: '#E57373' },
    { icon: '⏳', val: summary.pending_bids || 0,  label: 'Pending',     color: '#FFB74D' },
  ];

  return (
    <div style={B.page}>
      <SubHeader title="🎯 My Bids" />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 12px 0' }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: '#162846', borderRadius: 14, padding: '14px', border: '1.5px solid #233A5E', borderTop: `3px solid ${s.color}`, boxShadow: '0 4px 15px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Total winnings */}
      <div style={{ margin: '10px 12px 0', background: 'rgba(46, 125, 50, 0.15)', border: '1.5px solid rgba(46, 125, 50, 0.4)', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#81C784', fontWeight: 800, fontSize: 14 }}>💰 Total Winnings</span>
        <span style={{ color: '#A5D6A7', fontWeight: 900, fontSize: 18 }}>₹{winAmt.toLocaleString('en-IN')}</span>
      </div>

      {/* Bids list */}
      <div style={{ padding: '16px 12px 8px', fontSize: 12, fontWeight: 800, color: '#90CAF9', textTransform: 'uppercase', letterSpacing: 1.5 }}>🎮 Recent Bids</div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 50, color: '#64748B' }}>⏳ Loading bids...</div>
      ) : bids.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50, color: '#64748B' }}>📭 No bids yet</div>
      ) : (
        <div style={{ padding: '0 12px' }}>
          {bids.map(b => {
            const amount = Number(b.amount || 0);
            const winning = Number(b.win_amount || b.potential_winning || 0);
            const clr = b.status === 'win' ? '#81C784' : b.status === 'loss' ? '#E57373' : '#FFB74D';
            return (
              <div key={b.id} style={{ background: '#162846', borderRadius: 14, padding: '14px', marginBottom: 10, border: '1.5px solid #233A5E', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.2)', borderLeft: `4px solid ${clr}` }}>
                <div style={{ width: 40, height: 40, background: '#1E3A68', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🎯</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.game_name} — {b.game_type}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>#{b.number} · {new Date(b.created_at).toLocaleString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 15, color: clr, marginBottom: 4 }}>
                    {b.status === 'win' ? `+₹${winning.toLocaleString('en-IN')}` : `₹${amount.toLocaleString('en-IN')}`}
                  </div>
                  <span style={B.badge(b.status === 'win' ? 'green' : b.status === 'loss' ? 'red' : 'orange')}>{b.status?.toUpperCase()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── TRANSACTIONS PAGE ──
export function TxnsPage({ apiCall, navigate }) {
  const [txns, setTxns]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('all');

  useEffect(() => { fetchTxns(); }, []);

  const fetchTxns = async () => {
    setLoading(true); setError('');
    try {
      const res = await apiCall('/api/wallet/transactions');
      const list = res?.transactions || res?.data || res || [];
      setTxns(Array.isArray(list) ? list : []);
    } catch { setError('Transactions load nahi hui. Dobara try karo.'); }
    finally { setLoading(false); }
  };

  const typeLabel = (type) => ({ deposit:'💰 Deposit', withdrawal:'🏦 Withdrawal', withdraw:'🏦 Withdrawal', bid:'🎯 Bid', winning:'🏆 Winning', win:'🏆 Winning', refund:'↩️ Refund', bonus:'🎁 Bonus', credit:'⬆️ Credit', debit:'⬇️ Debit' })[type?.toLowerCase()] || `📋 ${type || 'Transaction'}`;

  const isCredit = (tx) => {
    if (tx.type === 'credit') return true;
    if (tx.type === 'debit') return false;
    return ['deposit','winning','win','refund','bonus'].includes(tx.type?.toLowerCase());
  };

  const filtered = filter === 'all' ? txns : filter === 'credit' ? txns.filter(t => isCredit(t)) : txns.filter(t => !isCredit(t));
  const totalCredit = txns.filter(t => isCredit(t)).reduce((a,t) => a + Math.abs(Number(t.amount||0)), 0);
  const totalDebit  = txns.filter(t => !isCredit(t)).reduce((a,t) => a + Math.abs(Number(t.amount||0)), 0);

  return (
    <div style={B.page}>
      <SubHeader
        title="💳 Transactions"
        onBack={navigate ? () => navigate('wallet') : null}
        rightBtn={
          <button onClick={fetchTxns} style={{ background: '#162846', border: '1px solid #233A5E', color: '#90CAF9', padding: '8px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>🔄</button>
        }
      />

      {/* Summary */}
      {!loading && txns.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 12px 0' }}>
          <div style={{ background: '#162846', borderRadius: 14, padding: '14px', border: '1.5px solid #233A5E', borderLeft: '4px solid #81C784', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Total Credit</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#81C784' }}>+₹{totalCredit.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ background: '#162846', borderRadius: 14, padding: '14px', border: '1.5px solid #233A5E', borderLeft: '4px solid #E57373', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Total Debit</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#E57373' }}>-₹{totalDebit.toLocaleString('en-IN')}</div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 10, padding: '16px 12px' }}>
        {[['all','All'], ['credit','Credit ⬆️'], ['debit','Debit ⬇️']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ flex: 1, padding: '10px 0', borderRadius: 12, cursor: 'pointer', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', background: filter === val ? 'linear-gradient(135deg,#1565C0,#1E88E5)' : '#162846', color: filter === val ? '#fff' : '#94A3B8', border: filter === val ? 'none' : '1.5px solid #233A5E', transition: 'all 0.2s', boxShadow: filter === val ? '0 4px 12px rgba(21,101,192,0.3)' : 'none' }}>{label}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>⏳ Loading...</div>}
      {!loading && error && <div style={{ textAlign: 'center', padding: 40, color: '#E57373' }}>{error}</div>}
      {!loading && !error && filtered.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>📭 No transactions found</div>}

      <div style={{ padding: '0 12px' }}>
        {filtered.map((tx, i) => {
          const credit = isCredit(tx);
          const amount = Math.abs(Number(tx.amount ?? tx.amt ?? 0));
          const balAfter = tx.balance_after ?? tx.closing_balance ?? null;
          return (
            <div key={tx.id || i} style={{ background: '#162846', borderRadius: 14, padding: '14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid #233A5E', borderLeft: `4px solid ${credit ? '#81C784' : '#E57373'}`, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: credit ? 'rgba(46,125,50,0.2)' : 'rgba(198,40,40,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{credit ? '⬆️' : '⬇️'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: 14, marginBottom: 3 }}>{typeLabel(tx.type)}</div>
                <div style={{ fontSize: 11, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || tx.note || '—'}</div>
                <div style={{ fontSize: 10, color: '#64748B', marginTop: 3 }}>{tx.created_at ? new Date(tx.created_at).toLocaleString('en-IN') : '—'}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 15, color: credit ? '#81C784' : '#E57373' }}>{credit ? '+' : '-'}₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                {balAfter !== null && <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 3 }}>Bal: ₹{Number(balAfter).toLocaleString('en-IN')}</div>}
              </div>
            </div>
          );
        })}
      </div>
      {!loading && filtered.length > 0 && <div style={{ textAlign: 'center', padding: '12px 0 24px', fontSize: 11, color: '#64748B' }}>{filtered.length} transactions</div>}
    </div>
  );
}

// ── WALLET PAGE ──
export function WalletPage({ wallet, onAdd, onWith, user, navigate, apiCall }) {
  const [stats, setStats] = useState({ highest_win: 0, total_bids: 0, games_won: 0, avg_bid: 0 });

  useEffect(() => {
    if (apiCall) {
      apiCall('/api/auth/profile').then(res => {
        if (res?.success && res?.user) {
          setStats({ highest_win: res.user.highest_win || 0, total_bids: res.user.total_bids || 0, games_won: res.user.games_won || 0, avg_bid: res.user.avg_bid || 0 });
        }
      }).catch(() => {});
    }
  }, [apiCall]);

  return (
    <div style={B.page}>
      <SubHeader title="💰 My Wallet" />

      {/* Balance Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0D47A1,#1976D2)', padding: '28px 20px', textAlign: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.3)', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Total Balance</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: '#fff', marginBottom: 20, textShadow: '0 4px 15px rgba(0,0,0,0.4)' }}>₹{wallet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={onAdd} style={{ flex: 1, maxWidth: 150, background: '#fff', color: '#1565C0', border: 'none', borderRadius: 30, padding: '14px 0', fontWeight: 900, fontSize: 14, cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.25)', textTransform: 'uppercase' }}>💰 Add Money</button>
          <button onClick={onWith} style={{ flex: 1, maxWidth: 150, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 30, padding: '14px 0', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase' }}>💸 Withdraw</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 24, paddingTop: 16 }}>
          {[
            { label: 'Total Added', val: '₹' + Number(user?.total_deposited || 0).toLocaleString('en-IN') },
            { label: 'Total Won',   val: '₹' + Number(user?.total_won || 0).toLocaleString('en-IN') },
            { label: 'Withdrawn',   val: '₹' + Number(user?.total_withdrawn || 0).toLocaleString('en-IN') },
          ].map((s, i, arr) => (
            <React.Fragment key={i}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>{s.val}</div>
              </div>
              {i < arr.length-1 && <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div style={{ background: '#162846', margin: '0 12px 16px', borderRadius: 16, border: '1.5px solid #233A5E', overflow: 'hidden', boxShadow: '0 8px 25px rgba(0,0,0,0.3)' }}>
        {[
          { ic: '💰', l: 'Add Fund',            sub: 'UPI, Net Banking, Cards',    fn: onAdd },
          { ic: '💸', l: 'Withdraw Fund',        sub: 'Bank Transfer, UPI',         fn: onWith },
          { ic: '📋', l: 'Transaction History',  sub: 'All credits & debits',       fn: () => navigate && navigate('txns') },
          { ic: '🎁', l: 'Refer & Earn',         sub: 'Earn ₹100 per referral',     fn: undefined },
        ].map((item, i) => (
          <div key={i} onClick={item.fn} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', borderBottom: i < 3 ? '1px solid #233A5E' : 'none', cursor: item.fn ? 'pointer' : 'default', transition: 'background 0.2s' }}
            onMouseEnter={e => { if (item.fn) e.currentTarget.style.background = '#1E3A68'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            <div style={{ width: 42, height: 42, background: '#1E3A68', border: '1.5px solid #233A5E', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{item.ic}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: 15 }}>{item.l}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{item.sub}</div>
            </div>
            <div style={{ color: '#90CAF9', fontSize: 24 }}>›</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ padding: '8px 12px', fontSize: 12, fontWeight: 800, color: '#90CAF9', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>📈 Your Stats</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 12px' }}>
        {[
          { val: '₹' + Number(stats.highest_win).toLocaleString('en-IN'), label: 'HIGHEST WIN',  color: '#81C784' },
          { val: String(stats.total_bids),                                 label: 'TOTAL BIDS',   color: '#90CAF9' },
          { val: String(stats.games_won),                                  label: 'GAMES WON',    color: '#81C784' },
          { val: '₹' + Number(stats.avg_bid).toLocaleString('en-IN'),      label: 'AVG BID',      color: '#90CAF9' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#162846', borderRadius: 14, padding: '16px', border: '1.5px solid #233A5E', borderTop: `3px solid ${s.color}`, boxShadow: '0 4px 15px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── HOW TO PLAY ──
export function HowToPlayPage({ onBack }) {
  return (
    <div style={B.page}>
      <SubHeader title="📖 How to Play" onBack={onBack} />
      <div style={{ padding: '0 12px 20px' }}>
        <div style={{ fontSize: 14, color: '#cbd5e1', padding: '16px 4px', lineHeight: 1.6, fontWeight: 500 }}>Matka ek number guessing game hai. Open aur close numbers pe bet lagao aur jeeto!</div>
        {[
          { n:'1', t:'Wallet Mein Paisa Daalo',   d:'UPI se deposit karo, admin 15–30 min mein approve karega.' },
          { n:'2', t:'Game Chunno',                d:'Home screen se koi bhi open game chunno — Kalyan, Milan Day, etc.' },
          { n:'3', t:'Game Type Chunno',           d:'Single Digit, Jodi, Pana, Sangam — apni marzi ka game type.' },
          { n:'4', t:'Number & Amount Daalo',      d:'Lucky number chunno aur bet amount daalo. Minimum ₹10.' },
          { n:'5', t:'Bid Place Karo',             d:'Place Bid dabao. Amount wallet se turant cut ho jaayega.' },
          { n:'6', t:'Result Ka Intezaar Karo',    d:'Result aane ke baad winning amount winning wallet mein credit hogi.' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#162846', borderRadius: 14, padding: '16px', marginBottom: 10, border: '1.5px solid #233A5E', display: 'flex', gap: 14, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#1565C0,#1976D2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16, flexShrink: 0, boxShadow: '0 4px 10px rgba(21,101,192,0.4)' }}>{s.n}</div>
            <div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: 15, marginBottom: 4 }}>{s.t}</div>
              <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{s.d}</div>
            </div>
          </div>
        ))}

        <div style={{ fontSize: 12, fontWeight: 800, color: '#90CAF9', textTransform: 'uppercase', letterSpacing: 1.5, margin: '20px 4px 12px' }}>🎮 Multipliers</div>
        {[
          { type:'Single Digit', mult:'9x' }, { type:'Jodi', mult:'90x' },
          { type:'Single Pana', mult:'150x' }, { type:'Double Pana', mult:'300x' },
          { type:'Triple Pana', mult:'600x' }, { type:'Half Sangam', mult:'1500x' },
          { type:'Full Sangam', mult:'10000x' },
        ].map((g, i) => (
          <div key={i} style={{ background: '#162846', borderRadius: 12, padding: '14px 16px', marginBottom: 8, border: '1.5px solid #233A5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>{g.type}</div>
            <div style={{ fontWeight: 900, fontSize: 18, color: '#81C784', textShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>{g.mult}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FAQ ──
export function FAQPage({ onBack }) {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q:'Account kaise banayein?',              a:'App ke login page pe "Register" dabao. Mobile number aur password se account bana sakte ho.' },
    { q:'Paisa kaise add karein?',              a:'Wallet → Add Money → UPI se payment → UTR submit karo → Admin 15–30 min mein approve karega.' },
    { q:'Minimum deposit kitna hai?',           a:'Minimum deposit ₹100 hai. Maximum ₹1,00,000 tak kar sakte hain.' },
    { q:'Winning kaise withdraw karein?',       a:'Winning Balance → Withdraw → UPI ya Bank details daalo → Admin approve karega. Min ₹500.' },
    { q:'Result kab aata hai?',                 a:'Har game ka alag result time hota hai. Game card pe time dikh jaata hai.' },
    { q:'Bid cancel ho sakti hai?',             a:'Nahi. Ek baar bid place hone ke baad cancel nahi hogi.' },
    { q:'Ek se zyada account ban sakta hai?',   a:'Nahi. Ek mobile number pe sirf ek account allowed hai.' },
    { q:'Koi problem ho toh kya karein?',       a:'Support page pe jaao. Call ya Telegram se contact karo. Mon–Sat 10AM–8PM.' },
  ];

  return (
    <div style={B.page}>
      <SubHeader title="❓ FAQ" onBack={onBack} />
      <div style={{ padding: '16px 12px' }}>
        {faqs.map((f, i) => (
          <div key={i} style={{ background: '#162846', borderRadius: 14, padding: '16px', marginBottom: 10, border: '1.5px solid #233A5E', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', borderLeft: open === i ? '4px solid #90CAF9' : '1.5px solid #233A5E', transition: 'all 0.2s' }} onClick={() => setOpen(open===i?null:i)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, color: '#fff', flex: 1, paddingRight: 10, fontSize: 14, lineHeight: 1.4 }}>{f.q}</div>
              <div style={{ color: '#90CAF9', fontSize: 24, fontWeight: 700, width: 24, textAlign: 'center' }}>{open===i?'−':'+'}</div>
            </div>
            {open===i && <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 12, paddingTop: 12, borderTop: '1px solid #233A5E', lineHeight: 1.6 }}>{f.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TERMS ──
export function TermsPage({ onBack }) {
  const items = [
    { t:'1. Eligibility',             d:'Sirf 18+ log hi use kar sakte hain. Minor hone pe account band ho jaayega.' },
    { t:'2. Account Rules',           d:'Ek user sirf ek account rakh sakta hai. Fake information pe permanent ban ho sakta hai.' },
    { t:'3. Deposits',                d:'Sirf UPI aur Bank Transfer se deposit hoga. Minimum deposit ₹100 hai.' },
    { t:'4. Withdrawals',             d:'Sirf winning balance se withdrawal hogi. Minimum ₹500 chahiye. Admin approve karega.' },
    { t:'5. Gameplay',                d:'Bid lagane ke baad cancel nahi hogi. Cheating pe permanent ban milega.' },
    { t:'6. Responsible Gaming',      d:'Apni financial limit ke andar khelo. Gambling addiction feel ho toh support se contact karein.' },
    { t:'7. Liability',               d:'Technical issues ya server downtime ke liye zimmedaar nahi hai.' },
    { t:'8. Account Termination',     d:'Rules violation pe account band kar sakta hai. Remaining balance refund kiya jaayega.' },
  ];
  return (
    <div style={B.page}>
      <SubHeader title="📜 Terms & Conditions" onBack={onBack} />
      <div style={{ padding: '16px 12px' }}>
        {items.map((s,i) => (
          <div key={i} style={{ background: '#162846', borderRadius: 14, padding: '16px', marginBottom: 10, border: '1.5px solid #233A5E', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <div style={{ fontWeight: 800, color: '#90CAF9', fontSize: 14, marginBottom: 6 }}>{s.t}</div>
            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>{s.d}</div>
          </div>
        ))}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#64748B', marginTop: 16, fontWeight: 600 }}>MatkaKing use karne se aap in terms se agree karte hain.</p>
      </div>
    </div>
  );
}

// ── PRIVACY ──
export function PrivacyPage({ onBack }) {
  const items = [
    { t:'📱 Kaunsa Data Collect Hota Hai?', d:'Mobile number, naam, device info aur transaction history. Koi bhi card number ya banking password store nahi hota.' },
    { t:'🔐 Data Kaise Safe Hai?',           d:'Aapka data encrypted servers pe store hota hai. JWT tokens se authentication secure hai.' },
    { t:'💳 Payment Information',            d:'UPI ID sirf withdrawal ke liye use hota hai. Bank details encrypted form mein store hoti hain.' },
    { t:'👤 Aapke Rights',                   d:'Aap apna account aur data delete karwa sakte hain. Transaction history download kar sakte hain.' },
    { t:'📞 Contact',                        d:'Privacy se related kisi bhi sawaal ke liye Support page pe humse contact karein.' },
  ];
  return (
    <div style={B.page}>
      <SubHeader title="🔒 Privacy Policy" onBack={onBack} />
      <div style={{ padding: '16px 12px' }}>
        {items.map((s,i) => (
          <div key={i} style={{ background: '#162846', borderRadius: 14, padding: '16px', marginBottom: 10, border: '1.5px solid #233A5E', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <div style={{ fontWeight: 800, color: '#90CAF9', fontSize: 14, marginBottom: 6 }}>{s.t}</div>
            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SUPPORT & PROFILE PAGE ──
export function SupportPage({ apiCall, user }) {
  const [contacts, setContacts] = useState({ phone: '9999999999', telegram: 'matkaking_support' });
  const [profileForm, setProfileForm] = useState({ username: user?.name || '', oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg]     = useState('');

  useEffect(() => {
    if (!apiCall) return;
    apiCall('/api/admin/settings').then(d => {
      if (d?.success && d?.settings) setContacts({ phone: d.settings.phone || '9999999999', telegram: d.settings.telegram || 'matkaking_support' });
    }).catch(() => {});
  }, [apiCall]);

  const updateProfile = async () => {
    setSuccessMsg(''); setErrorMsg('');
    if (!profileForm.username.trim()) { setErrorMsg('❌ Username dalna zaruri hai!'); return; }
    setLoading(true);
    try {
      const profileRes = await apiCall('/api/auth/update-profile', 'PUT', { name: profileForm.username.trim() });
      if (!profileRes?.success) { setErrorMsg(profileRes?.message || '❌ Profile update fail ho gaya'); setLoading(false); return; }
      if (profileForm.newPassword) {
        if (!profileForm.oldPassword) { setErrorMsg('❌ Purana password zaruri hai'); setLoading(false); return; }
        if (profileForm.newPassword !== profileForm.confirmPassword) { setErrorMsg('❌ Passwords match nahi ho rahe'); setLoading(false); return; }
        const passRes = await apiCall('/api/auth/update-password', 'POST', { oldPassword: profileForm.oldPassword, newPassword: profileForm.newPassword });
        if (!passRes?.success) { setErrorMsg(passRes?.message || '❌ Password update fail'); setLoading(false); return; }
      }
      setSuccessMsg('✅ Profile successfully updated!');
      setProfileForm(p => ({ ...p, oldPassword: '', newPassword: '', confirmPassword: '' }));
    } catch { setErrorMsg('❌ Server se connect nahi ho pa raha.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={B.page}>
      <SubHeader title="👤 My Profile" />

      {/* Profile Card */}
      <div style={{ background: 'linear-gradient(135deg,#0D47A1,#1976D2)', margin: '16px 12px', borderRadius: 20, padding: '24px 20px', textAlign: 'center', boxShadow: '0 8px 25px rgba(0,0,0,0.3)' }}>
        <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.1)', border: '3px solid rgba(255,255,255,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 36, color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div style={{ color: '#fff', fontWeight: 900, fontSize: 18, letterSpacing: 0.5 }}>{user?.name || 'User'}</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4, fontWeight: 600 }}>📱 {user?.mobile || '—'}</div>
        <div style={{ display: 'inline-block', marginTop: 12, background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 14px', fontSize: 11, color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>✅ Verified</div>
      </div>

      {/* Form */}
      <div style={B.card}>
        {successMsg && <div style={{ background: 'rgba(46,125,50,0.15)', border: '1px solid rgba(46,125,50,0.4)', borderRadius: 10, padding: '12px', marginBottom: 16, color: '#81C784', fontSize: 13, fontWeight: 700 }}>{successMsg}</div>}
        {errorMsg   && <div style={{ background: 'rgba(198,40,40,0.15)', border: '1px solid rgba(198,40,40,0.4)', borderRadius: 10, padding: '12px', marginBottom: 16, color: '#E57373', fontSize: 13, fontWeight: 700 }}>{errorMsg}</div>}

        <label style={B.label}>Full Name</label>
        <input style={B.input} value={profileForm.username} onChange={e => setProfileForm(p => ({ ...p, username: e.target.value }))} placeholder="Apna naam likhein" />

        <div style={{ borderTop: '1px solid #233A5E', paddingTop: 20, marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#90CAF9', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>🔐 Change Password (Optional)</div>
          <label style={B.label}>Current Password</label>
          <input type="password" style={B.input} placeholder="Purana password" value={profileForm.oldPassword} onChange={e => setProfileForm(p => ({ ...p, oldPassword: e.target.value }))} />
          <label style={B.label}>New Password</label>
          <input type="password" style={B.input} placeholder="Naya password (min 6 characters)" value={profileForm.newPassword} onChange={e => setProfileForm(p => ({ ...p, newPassword: e.target.value }))} />
          <label style={B.label}>Confirm New Password</label>
          <input type="password" style={{ ...B.input, marginBottom: 0 }} placeholder="Dobara naya password" value={profileForm.confirmPassword} onChange={e => setProfileForm(p => ({ ...p, confirmPassword: e.target.value }))} />
        </div>

        <button onClick={updateProfile} disabled={loading} style={{ ...B.btn, marginTop: 20, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '⏳ Updating...' : '💾 UPDATE PROFILE'}
        </button>
      </div>

      {/* Support */}
      <div style={{ margin: '0 12px', background: '#162846', borderRadius: 16, border: '1.5px solid #233A5E', overflow: 'hidden', boxShadow: '0 8px 25px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '14px 16px', background: '#1E3A68', borderBottom: '1px solid #233A5E', fontSize: 12, fontWeight: 800, color: '#90CAF9', textTransform: 'uppercase', letterSpacing: 1.5 }}>🎧 Help & Support</div>
        <div onClick={() => window.open(`https://wa.me/91${contacts.phone}`, '_blank')} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', borderBottom: '1px solid #233A5E', cursor: 'pointer' }}>
          <div style={{ width: 44, height: 44, background: 'rgba(46,125,50,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💬</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: '#fff', fontSize: 15 }}>WhatsApp Support</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>+91 {contacts.phone}</div>
          </div>
          <div style={{ color: '#90CAF9', fontSize: 24 }}>›</div>
        </div>
        <div onClick={() => window.open(`https://t.me/${contacts.telegram}`, '_blank')} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', cursor: 'pointer' }}>
          <div style={{ width: 44, height: 44, background: '#1E3A68', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>✈️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: '#fff', fontSize: 15 }}>Telegram Support</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>Quick reply in 5 mins</div>
          </div>
          <div style={{ color: '#90CAF9', fontSize: 24 }}>›</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '24px 0 16px', fontSize: 11, color: '#64748B', fontWeight: 600 }}>MatkaKing · Version 5.0.0 · 18+ Only</div>
    </div>
  );
}