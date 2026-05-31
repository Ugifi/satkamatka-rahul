import React, { useState, useEffect } from 'react';

// ── Shared blue/white styles ──
const B = {
  page:      { background: '#f0f4ff', minHeight: '100vh', paddingBottom: 80 },
  header:    { background: 'linear-gradient(135deg,#1565C0,#1E88E5)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '3px solid #0D47A1', position: 'sticky', top: 0, zIndex: 10 },
  headerTxt: { fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: 1 },
  card:      { background: '#fff', borderRadius: 14, border: '1.5px solid #E3EAFF', boxShadow: '0 2px 10px rgba(30,136,229,0.08)', margin: '12px', padding: '16px' },
  label:     { fontSize: 10, color: '#1565C0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, display: 'block' },
  input:     { width: '100%', background: '#F8FBFF', border: '2px solid #BBDEFB', borderRadius: 10, padding: '11px 14px', color: '#1A237E', fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box', fontFamily: 'inherit' },
  btn:       { width: '100%', background: 'linear-gradient(135deg,#1565C0,#1E88E5)', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', letterSpacing: 2, textTransform: 'uppercase', boxShadow: '0 4px 14px rgba(30,136,229,0.3)' },
  badge:     (color) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: color === 'green' ? '#E8F5E9' : color === 'red' ? '#FFEBEE' : '#FFF3E0', color: color === 'green' ? '#2E7D32' : color === 'red' ? '#C62828' : '#E65100' }),
};

function SubHeader({ title, onBack, rightBtn }) {
  return (
    <div style={B.header}>
      {onBack && <div onClick={onBack} style={{ fontSize: 26, cursor: 'pointer', color: '#fff', lineHeight: 1, fontWeight: 300 }}>‹</div>}
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
            if (res.summary) setSummary(res.summary); // Backend wali real summary save karo
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [apiCall]);

  const winAmt = Number(summary.total_win_amount || 0);

  const statCards = [
    { icon: '🎯', val: summary.total_bids || 0,    label: 'Total Bids',  color: '#1565C0' },
    { icon: '🏆', val: summary.won_bids || 0,      label: 'Won',         color: '#2E7D32' },
    { icon: '💔', val: summary.lost_bids || 0,     label: 'Lost',        color: '#C62828' },
    { icon: '⏳', val: summary.pending_bids || 0,  label: 'Pending',     color: '#E65100' },
  ];

  return (
    <div style={B.page}>
      <SubHeader title="🎯 My Bids" />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 12px 0' }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '14px', border: '1.5px solid #E3EAFF', borderTop: `3px solid ${s.color}`, boxShadow: '0 2px 8px rgba(30,136,229,0.07)', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Total winnings */}
      <div style={{ margin: '10px 12px 0', background: '#E8F5E9', border: '1.5px solid #A5D6A7', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#2E7D32', fontWeight: 700, fontSize: 14 }}>💰 Total Winnings</span>
        <span style={{ color: '#1B5E20', fontWeight: 900, fontSize: 18 }}>₹{winAmt.toLocaleString('en-IN')}</span>
      </div>

      {/* Bids list */}
      <div style={{ padding: '12px 12px 0', fontSize: 12, fontWeight: 800, color: '#1565C0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 0 }}>🎮 Recent Bids</div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 50, color: '#90CAF9' }}>⏳ Loading bids...</div>
      ) : bids.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50, color: '#aaa' }}>📭 No bids yet</div>
      ) : (
        <div style={{ padding: '8px 12px' }}>
          {bids.map(b => {
            const amount = Number(b.amount || 0);
            const winning = Number(b.win_amount || b.potential_winning || 0);
            const clr = b.status === 'win' ? '#2E7D32' : b.status === 'loss' ? '#C62828' : '#E65100';
            return (
              <div key={b.id} style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', marginBottom: 8, border: '1.5px solid #E3EAFF', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 6px rgba(30,136,229,0.06)', borderLeft: `3px solid ${clr}` }}>
                <div style={{ width: 36, height: 36, background: '#E3F2FD', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🎯</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1A237E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.game_name} — {b.game_type}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>#{b.number} · {new Date(b.created_at).toLocaleString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: clr }}>
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
          <button onClick={fetchTxns} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>🔄</button>
        }
      />

      {/* Summary */}
      {!loading && txns.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 12px 0' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', borderLeft: '3px solid #2E7D32', border: '1.5px solid #E3EAFF', borderLeftWidth: 3, boxShadow: '0 1px 6px rgba(30,136,229,0.07)' }}>
            <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Total Credit</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#2E7D32' }}>+₹{totalCredit.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', borderLeft: '3px solid #C62828', border: '1.5px solid #E3EAFF', borderLeftWidth: 3, boxShadow: '0 1px 6px rgba(30,136,229,0.07)' }}>
            <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Total Debit</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#C62828' }}>-₹{totalDebit.toLocaleString('en-IN')}</div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 12px' }}>
        {[['all','All'], ['credit','Credit ⬆️'], ['debit','Debit ⬇️']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, background: filter === val ? 'linear-gradient(135deg,#1565C0,#1E88E5)' : '#fff', color: filter === val ? '#fff' : '#90CAF9', border: filter === val ? 'none' : '1.5px solid #E3EAFF', transition: 'all 0.15s' }}>{label}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 60, color: '#90CAF9' }}>⏳ Loading...</div>}
      {!loading && error && <div style={{ textAlign: 'center', padding: 40, color: '#C62828' }}>{error}</div>}
      {!loading && !error && filtered.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>📭 No transactions found</div>}

      <div style={{ padding: '0 12px' }}>
        {filtered.map((tx, i) => {
          const credit = isCredit(tx);
          const amount = Math.abs(Number(tx.amount ?? tx.amt ?? 0));
          const balAfter = tx.balance_after ?? tx.closing_balance ?? null;
          return (
            <div key={tx.id || i} style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid #E3EAFF', borderLeft: `3px solid ${credit ? '#2E7D32' : '#C62828'}`, boxShadow: '0 1px 6px rgba(30,136,229,0.06)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: credit ? '#E8F5E9' : '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{credit ? '⬆️' : '⬇️'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#1A237E', fontSize: 13, marginBottom: 2 }}>{typeLabel(tx.type)}</div>
                <div style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || tx.note || '—'}</div>
                <div style={{ fontSize: 10, color: '#bbb', marginTop: 2 }}>{tx.created_at ? new Date(tx.created_at).toLocaleString('en-IN') : '—'}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: credit ? '#2E7D32' : '#C62828' }}>{credit ? '+' : '-'}₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                {balAfter !== null && <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>Bal: ₹{Number(balAfter).toLocaleString('en-IN')}</div>}
              </div>
            </div>
          );
        })}
      </div>
      {!loading && filtered.length > 0 && <div style={{ textAlign: 'center', padding: '8px 0 16px', fontSize: 11, color: '#bbb' }}>{filtered.length} transactions</div>}
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
      <div style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)', padding: '24px 20px', textAlign: 'center', borderBottom: '3px solid #0D47A1' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>Total Balance</div>
        <div style={{ fontSize: 38, fontWeight: 900, color: '#fff', marginBottom: 16, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>₹{wallet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onAdd} style={{ flex: 1, maxWidth: 140, background: '#fff', color: '#1565C0', border: 'none', borderRadius: 30, padding: '12px 0', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>💰 Add Money</button>
          <button onClick={onWith} style={{ flex: 1, maxWidth: 140, background: 'rgba(255,255,255,0.2)', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 30, padding: '12px 0', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>💸 Withdraw</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: 16, paddingTop: 12 }}>
          {[
            { label: 'Total Added', val: '₹' + Number(user?.total_deposited || 0).toLocaleString('en-IN') },
            { label: 'Total Won',   val: '₹' + Number(user?.total_won || 0).toLocaleString('en-IN') },
            { label: 'Withdrawn',   val: '₹' + Number(user?.total_withdrawn || 0).toLocaleString('en-IN') },
          ].map((s, i, arr) => (
            <React.Fragment key={i}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{s.val}</div>
              </div>
              {i < arr.length-1 && <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div style={{ background: '#fff', margin: '12px', borderRadius: 14, border: '1.5px solid #E3EAFF', overflow: 'hidden', boxShadow: '0 2px 10px rgba(30,136,229,0.08)' }}>
        {[
          { ic: '💰', l: 'Add Fund',            sub: 'UPI, Net Banking, Cards',    fn: onAdd },
          { ic: '💸', l: 'Withdraw Fund',        sub: 'Bank Transfer, UPI',         fn: onWith },
          { ic: '📋', l: 'Transaction History',  sub: 'All credits & debits',       fn: () => navigate && navigate('txns') },
          { ic: '🎁', l: 'Refer & Earn',         sub: 'Earn ₹100 per referral',     fn: undefined },
        ].map((item, i) => (
          <div key={i} onClick={item.fn} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < 3 ? '1px solid #F0F4FF' : 'none', cursor: item.fn ? 'pointer' : 'default', transition: 'background 0.15s' }}
            onMouseEnter={e => { if (item.fn) e.currentTarget.style.background = '#F0F4FF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            <div style={{ width: 38, height: 38, background: '#E3F2FD', border: '1.5px solid #BBDEFB', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{item.ic}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#1A237E', fontSize: 15 }}>{item.l}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>{item.sub}</div>
            </div>
            <div style={{ color: '#90CAF9', fontSize: 20 }}>›</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ padding: '0 12px', fontSize: 12, fontWeight: 800, color: '#1565C0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>📈 Your Stats</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 12px' }}>
        {[
          { val: '₹' + Number(stats.highest_win).toLocaleString('en-IN'), label: 'HIGHEST WIN',  color: '#2E7D32' },
          { val: String(stats.total_bids),                                 label: 'TOTAL BIDS',   color: '#1565C0' },
          { val: String(stats.games_won),                                  label: 'GAMES WON',    color: '#2E7D32' },
          { val: '₹' + Number(stats.avg_bid).toLocaleString('en-IN'),      label: 'AVG BID',      color: '#1565C0' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '14px', border: '1.5px solid #E3EAFF', borderTop: `3px solid ${s.color}`, boxShadow: '0 1px 6px rgba(30,136,229,0.07)', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
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
        <div style={{ fontSize: 13, color: '#666', padding: '12px 0 8px', lineHeight: 1.7 }}>Matka ek number guessing game hai. Open aur close numbers pe bet lagao aur jeeto!</div>
        {[
          { n:'1', t:'Wallet Mein Paisa Daalo',   d:'UPI se deposit karo, admin 15–30 min mein approve karega.' },
          { n:'2', t:'Game Chunno',                d:'Home screen se koi bhi open game chunno — Kalyan, Milan Day, etc.' },
          { n:'3', t:'Game Type Chunno',           d:'Single Digit, Jodi, Pana, Sangam — apni marzi ka game type.' },
          { n:'4', t:'Number & Amount Daalo',      d:'Lucky number chunno aur bet amount daalo. Minimum ₹10.' },
          { n:'5', t:'Bid Place Karo',             d:'Place Bid dabao. Amount wallet se turant cut ho jaayega.' },
          { n:'6', t:'Result Ka Intezaar Karo',    d:'Result aane ke baad winning amount winning wallet mein credit hogi.' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '14px', marginBottom: 8, border: '1.5px solid #E3EAFF', display: 'flex', gap: 12, boxShadow: '0 1px 6px rgba(30,136,229,0.06)' }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#1565C0,#1E88E5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 15, flexShrink: 0 }}>{s.n}</div>
            <div>
              <div style={{ fontWeight: 800, color: '#1A237E', fontSize: 14, marginBottom: 3 }}>{s.t}</div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{s.d}</div>
            </div>
          </div>
        ))}

        <div style={{ fontSize: 12, fontWeight: 800, color: '#1565C0', textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 10px' }}>🎮 Multipliers</div>
        {[
          { type:'Single Digit', mult:'9x' }, { type:'Jodi', mult:'90x' },
          { type:'Single Pana', mult:'150x' }, { type:'Double Pana', mult:'300x' },
          { type:'Triple Pana', mult:'600x' }, { type:'Half Sangam', mult:'1500x' },
          { type:'Full Sangam', mult:'10000x' },
        ].map((g, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '11px 14px', marginBottom: 7, border: '1.5px solid #E3EAFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, color: '#1A237E', fontSize: 14 }}>{g.type}</div>
            <div style={{ fontWeight: 900, fontSize: 16, color: '#2E7D32' }}>{g.mult}</div>
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
      <div style={{ padding: '12px' }}>
        {faqs.map((f, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '14px', marginBottom: 8, border: '1.5px solid #E3EAFF', cursor: 'pointer', boxShadow: '0 1px 6px rgba(30,136,229,0.06)', borderLeft: open === i ? '3px solid #1E88E5' : '1.5px solid #E3EAFF' }} onClick={() => setOpen(open===i?null:i)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: '#1A237E', flex: 1, paddingRight: 8, fontSize: 14 }}>{f.q}</div>
              <div style={{ color: '#1E88E5', fontSize: 22, fontWeight: 700, width: 24, textAlign: 'center' }}>{open===i?'−':'+'}</div>
            </div>
            {open===i && <div style={{ fontSize: 13, color: '#555', marginTop: 10, paddingTop: 10, borderTop: '1px solid #F0F4FF', lineHeight: 1.7 }}>{f.a}</div>}
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
      <div style={{ padding: 12 }}>
        {items.map((s,i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '13px 14px', marginBottom: 8, border: '1.5px solid #E3EAFF', boxShadow: '0 1px 5px rgba(30,136,229,0.06)' }}>
            <div style={{ fontWeight: 800, color: '#1565C0', fontSize: 13, marginBottom: 4 }}>{s.t}</div>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.7 }}>{s.d}</div>
          </div>
        ))}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 12 }}>MatkaKing use karne se aap in terms se agree karte hain.</p>
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
      <div style={{ padding: 12 }}>
        {items.map((s,i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '13px 14px', marginBottom: 8, border: '1.5px solid #E3EAFF', boxShadow: '0 1px 5px rgba(30,136,229,0.06)' }}>
            <div style={{ fontWeight: 800, color: '#1565C0', fontSize: 13, marginBottom: 4 }}>{s.t}</div>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.7 }}>{s.d}</div>
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
      <div style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)', margin: 12, borderRadius: 16, padding: '20px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 32 }}>
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{user?.name || 'User'}</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>📱 {user?.mobile || '—'}</div>
        <div style={{ display: 'inline-block', marginTop: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 12px', fontSize: 11, color: '#fff', fontWeight: 700 }}>✅ Verified</div>
      </div>

      {/* Form */}
      <div style={{ background: '#fff', margin: '0 12px 12px', borderRadius: 14, padding: '16px', border: '1.5px solid #E3EAFF', boxShadow: '0 2px 10px rgba(30,136,229,0.08)' }}>
        {successMsg && <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 8, padding: '9px 12px', marginBottom: 12, color: '#2E7D32', fontSize: 13, fontWeight: 600 }}>{successMsg}</div>}
        {errorMsg   && <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 8, padding: '9px 12px', marginBottom: 12, color: '#C62828', fontSize: 13, fontWeight: 600 }}>{errorMsg}</div>}

        <label style={B.label}>Full Name</label>
        <input style={B.input} value={profileForm.username} onChange={e => setProfileForm(p => ({ ...p, username: e.target.value }))} placeholder="Apna naam likhein" />

        <div style={{ borderTop: '1px solid #F0F4FF', paddingTop: 14, marginTop: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#1565C0', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>🔐 Change Password (Optional)</div>
          <label style={B.label}>Current Password</label>
          <input type="password" style={B.input} placeholder="Purana password" value={profileForm.oldPassword} onChange={e => setProfileForm(p => ({ ...p, oldPassword: e.target.value }))} />
          <label style={B.label}>New Password</label>
          <input type="password" style={B.input} placeholder="Naya password (min 6 characters)" value={profileForm.newPassword} onChange={e => setProfileForm(p => ({ ...p, newPassword: e.target.value }))} />
          <label style={B.label}>Confirm New Password</label>
          <input type="password" style={{ ...B.input, marginBottom: 0 }} placeholder="Dobara naya password" value={profileForm.confirmPassword} onChange={e => setProfileForm(p => ({ ...p, confirmPassword: e.target.value }))} />
        </div>

        <button onClick={updateProfile} disabled={loading} style={{ ...B.btn, marginTop: 14, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '⏳ Updating...' : '💾 UPDATE PROFILE'}
        </button>
      </div>

      {/* Support */}
      <div style={{ margin: '0 12px', background: '#fff', borderRadius: 14, border: '1.5px solid #E3EAFF', overflow: 'hidden', boxShadow: '0 2px 10px rgba(30,136,229,0.08)' }}>
        <div style={{ padding: '12px 16px', background: '#E3F2FD', borderBottom: '1px solid #BBDEFB', fontSize: 12, fontWeight: 800, color: '#1565C0', textTransform: 'uppercase', letterSpacing: 1 }}>🎧 Help & Support</div>
        <div onClick={() => window.open(`https://wa.me/91${contacts.phone}`, '_blank')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: '1px solid #F0F4FF', cursor: 'pointer' }}>
          <div style={{ width: 40, height: 40, background: '#E8F5E9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>💬</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#1A237E', fontSize: 14 }}>WhatsApp Support</div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>+91 {contacts.phone}</div>
          </div>
          <div style={{ color: '#90CAF9', fontSize: 20 }}>›</div>
        </div>
        <div onClick={() => window.open(`https://t.me/${contacts.telegram}`, '_blank')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'pointer' }}>
          <div style={{ width: 40, height: 40, background: '#E3F2FD', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>✈️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#1A237E', fontSize: 14 }}>Telegram Support</div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>Quick reply in 5 mins</div>
          </div>
          <div style={{ color: '#90CAF9', fontSize: 20 }}>›</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '20px 0 10px', fontSize: 11, color: '#bbb' }}>MatkaKing · Version 5.0.0 · 18+ Only</div>
    </div>
  );
}