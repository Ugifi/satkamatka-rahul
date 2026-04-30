import React, { useState, useEffect } from 'react';

// ── MY BIDS PAGE ──
export function BidsPage({ bids }) {
  const won   = bids.filter(b => b.status === 'win').length;
  const lost  = bids.filter(b => b.status === 'loss').length;
  const pend  = bids.filter(b => b.status === 'pending').length;
  const winAmt = bids.reduce((a, b) => a + (b.winAmt || 0), 0);

  return (
    <div className="bids-page screen">
      <div className="stats-section-title">📊 Bid Statistics</div>
      <div className="stats-grid">
        {[
          { icon:'🎯', val: bids.length, label:'TOTAL BIDS',  cls:'',       bar:'#0d3526' },
          { icon:'🏆', val: won,         label:'WON',         cls:'green',   bar:'#22c55e' },
          { icon:'💔', val: lost,        label:'LOST',        cls:'red',     bar:'#ef4444' },
          { icon:'⏳', val: pend,        label:'PENDING',     cls:'orange',  bar:'#f0a500' },
        ].map((s, i) => (
          <div key={i} className="stat-cell">
            <div className="stat-top-bar" style={{background: s.bar}}/>
            <div className="stat-icon">{s.icon}</div>
            <div className={`stat-value${s.cls ? ' '+s.cls : ''}`}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="pnl-row" style={{marginTop:8}}>
        <div className="pnl-left">
          <div className="pnl-ic">💰</div>
          <div className="pnl-label">Total Winnings</div>
        </div>
        <div className="pnl-val">₹{winAmt.toLocaleString('en-IN')}</div>
      </div>

      <div className="stats-section-title" style={{marginTop:8}}>🎮 Recent Bids</div>
      <div className="menu-list">
        {bids.map(b => (
          <div key={b.id} className="ml-item">
            <div className="ml-left">
              <div className="ml-icon">🎯</div>
              <div>
                <div className="ml-title">{b.game} — {b.type}</div>
                <div className="ml-sub">#{b.number} · {b.date}</div>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{
                fontSize:13, fontWeight:700,
                color: b.status==='win'?'#22c55e': b.status==='loss'?'#ef4444':'#f0a500'
              }}>
                {b.status === 'win' ? `+₹${b.winAmt.toLocaleString()}` : `₹${b.amount.toLocaleString()}`}
              </div>
              <div style={{fontSize:10,fontWeight:700, marginTop:2,
                color: b.status==='win'?'#22c55e': b.status==='loss'?'#ef4444':'#f0a500'
              }}>
                {b.status.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TRANSACTIONS PAGE — REAL API SE CONNECTED ──
export function TxnsPage({ apiCall, navigate }) {
  const [txns, setTxns]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('all'); // all | credit | debit

  useEffect(() => {
    fetchTxns();
  }, []);

  const fetchTxns = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiCall('/api/wallet/transactions');
      // Backend se alag alag shape aa sakta hai — dono handle karte hain
      const list = res?.transactions || res?.data || res || [];
      setTxns(Array.isArray(list) ? list : []);
    } catch (e) {
      setError('Transactions load nahi hui. Dobara try karo.');
    } finally {
      setLoading(false);
    }
  };

  // type ko readable label mein convert karo
  const typeLabel = (type) => ({
    deposit:    '💰 Deposit',
    withdrawal: '🏦 Withdrawal',
    withdraw:   '🏦 Withdrawal',
    bid:        '🎯 Bid',
    winning:    '🏆 Winning',
    win:        '🏆 Winning',
    refund:     '↩️ Refund',
    bonus:      '🎁 Bonus',
    credit:     '⬆️ Credit',
    debit:      '⬇️ Debit',
  })[type?.toLowerCase()] || `📋 ${type || 'Transaction'}`;

  // credit ya debit determine karo
  const isCredit = (tx) => {
    if (tx.type === 'credit') return true;
    if (tx.type === 'debit')  return false;
    const creditTypes = ['deposit', 'winning', 'win', 'refund', 'bonus'];
    if (creditTypes.includes(tx.type?.toLowerCase())) return true;
    if (typeof tx.amount === 'number') return tx.amount > 0;
    return false;
  };

  const filtered = filter === 'all' ? txns
    : filter === 'credit' ? txns.filter(t => isCredit(t))
    : txns.filter(t => !isCredit(t));

  const totalCredit = txns.filter(t => isCredit(t)).reduce((a,t) => a + Math.abs(Number(t.amount||t.amt||0)), 0);
  const totalDebit  = txns.filter(t => !isCredit(t)).reduce((a,t) => a + Math.abs(Number(t.amount||t.amt||0)), 0);

  return (
    <div className="screen" style={{paddingBottom:80}}>

      {/* Header */}
      <div style={{
        background:'#0d2a1a', padding:'14px 16px',
        display:'flex', alignItems:'center', gap:12,
        borderBottom:'1px solid #1a4a2a',
        position:'sticky', top:0, zIndex:10
      }}>
        {navigate && (
          <div onClick={() => navigate('wallet')}
            style={{fontSize:26, cursor:'pointer', color:'#f0a500', lineHeight:1}}>‹</div>
        )}
        <div style={{fontSize:16, fontWeight:700, color:'#f0a500', fontFamily:'Rajdhani,sans-serif', flex:1}}>
          💳 Transaction History
        </div>
        <button onClick={fetchTxns} style={{
          background:'rgba(240,165,0,0.15)', border:'1px solid rgba(240,165,0,0.4)',
          color:'#f0a500', padding:'6px 12px', borderRadius:8,
          cursor:'pointer', fontSize:12, fontWeight:700
        }}>🔄 Refresh</button>
      </div>

      {/* Summary cards */}
      {!loading && txns.length > 0 && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'14px 14px 0'}}>
          <div style={{background:'#0d2a1a', borderRadius:10, padding:'12px 14px', borderLeft:'3px solid #22c55e'}}>
            <div style={{fontSize:10, color:'#aaa', textTransform:'uppercase', letterSpacing:1, marginBottom:4}}>Total Credit</div>
            <div style={{fontSize:16, fontWeight:700, color:'#22c55e'}}>+₹{totalCredit.toLocaleString('en-IN')}</div>
          </div>
          <div style={{background:'#0d2a1a', borderRadius:10, padding:'12px 14px', borderLeft:'3px solid #ef4444'}}>
            <div style={{fontSize:10, color:'#aaa', textTransform:'uppercase', letterSpacing:1, marginBottom:4}}>Total Debit</div>
            <div style={{fontSize:16, fontWeight:700, color:'#ef4444'}}>-₹{totalDebit.toLocaleString('en-IN')}</div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{display:'flex', gap:8, padding:'12px 14px'}}>
        {[['all','All'], ['credit','Credit ⬆️'], ['debit','Debit ⬇️']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            flex:1, padding:'8px 0', borderRadius:8, border:'none', cursor:'pointer',
            fontWeight:700, fontSize:12,
            background: filter === val ? '#f0a500' : '#1a3a26',
            color: filter === val ? '#000' : '#aaa',
            transition:'all 0.15s'
          }}>{label}</button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div style={{textAlign:'center', padding:60, color:'#888'}}>
          <div style={{fontSize:32, marginBottom:12}}>⏳</div>
          <div>Transactions load ho rahi hain...</div>
        </div>
      )}
      {!loading && error && (
        <div style={{textAlign:'center', padding:40}}>
          <div style={{fontSize:32, marginBottom:12}}>❌</div>
          <div style={{color:'#ef4444', marginBottom:16}}>{error}</div>
          <button onClick={fetchTxns} style={{
            background:'#f0a500', border:'none', color:'#000',
            padding:'10px 24px', borderRadius:8, cursor:'pointer', fontWeight:700
          }}>Dobara Try Karo</button>
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div style={{textAlign:'center', padding:60, color:'#666'}}>
          <div style={{fontSize:40, marginBottom:12}}>📭</div>
          <div style={{fontSize:14}}>
            {filter === 'all' ? 'Koi transaction nahi mili' : `Koi ${filter} transaction nahi`}
          </div>
        </div>
      )}

      {/* Transaction list */}
      <div style={{padding:'0 14px'}}>
        {filtered.map((tx, i) => {
          const credit = isCredit(tx);
          const amount = Math.abs(Number(tx.amount ?? tx.amt ?? 0));
          const balAfter = tx.balance_after ?? tx.closing_balance ?? null;

          return (
            <div key={tx.id || i} style={{
              background:'#1a2e22', borderRadius:10, padding:'14px 16px',
              marginBottom:10, display:'flex', alignItems:'center', gap:14,
              borderLeft:`3px solid ${credit ? '#22c55e' : '#ef4444'}`
            }}>
              {/* Icon */}
              <div style={{
                width:40, height:40, borderRadius:10, flexShrink:0,
                background: credit ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:18
              }}>
                {credit ? '⬆️' : '⬇️'}
              </div>

              {/* Details */}
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontWeight:700, color:'#fff', fontSize:13, marginBottom:3}}>
                  {typeLabel(tx.type)}
                </div>
                <div style={{fontSize:11, color:'#888', marginBottom:2,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {tx.description || tx.note || tx.name || tx.ref || '—'}
                </div>
                <div style={{fontSize:10, color:'#555'}}>
                  {tx.created_at
                    ? new Date(tx.created_at).toLocaleString('hi-IN', {
                        day:'2-digit', month:'short', year:'numeric',
                        hour:'2-digit', minute:'2-digit'
                      })
                    : tx.date || '—'}
                </div>
              </div>

              {/* Amount */}
              <div style={{textAlign:'right', flexShrink:0}}>
                <div style={{
                  fontWeight:700, fontSize:16,
                  color: credit ? '#22c55e' : '#ef4444'
                }}>
                  {credit ? '+' : '-'}₹{amount.toLocaleString('en-IN', {minimumFractionDigits:2})}
                </div>
                {balAfter !== null && (
                  <div style={{fontSize:10, color:'#555', marginTop:3}}>
                    Bal: ₹{Number(balAfter).toLocaleString('en-IN')}
                  </div>
                )}
                {(tx.statusTxt || tx.status) && (
                  <div style={{
                    fontSize:9, fontWeight:700, marginTop:4, padding:'2px 6px',
                    borderRadius:4, display:'inline-block',
                    background: (tx.statusTxt||tx.status) === 'SUCCESS' || (tx.statusTxt||tx.status) === 'approved'
                      ? 'rgba(34,197,94,0.2)' : 'rgba(240,165,0,0.2)',
                    color: (tx.statusTxt||tx.status) === 'SUCCESS' || (tx.statusTxt||tx.status) === 'approved'
                      ? '#22c55e' : '#f0a500'
                  }}>
                    {(tx.statusTxt || tx.status || '').toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Count */}
      {!loading && filtered.length > 0 && (
        <div style={{textAlign:'center', padding:'10px 0 20px', fontSize:11, color:'#555'}}>
          {filtered.length} transactions dikh rahi hain
        </div>
      )}
    </div>
  );
}

// ── WALLET PAGE ──
// ✅ FIX: Transaction History click ab TxnsPage pe navigate karega
// ✅ FIX: Your Stats ab static data nahi, direct user ke original API data se aayega
export function WalletPage({ wallet, onAdd, onWith, user, navigate, apiCall }) {
  
  // Custom API Call karke real stats laane ka alternative (agar user props me data missing hai)
  const [stats, setStats] = useState({
    highest_win: user?.highest_win || 0,
    total_bids: user?.total_bids || 0,
    games_won: user?.games_won || 0,
    avg_bid: user?.avg_bid || 0
  });

  // Jab page load ho, ek baar api call se real profile data refresh kar lo
  useEffect(() => {
    if (apiCall) {
      apiCall('/api/auth/profile').then(res => {
        if (res?.success && res?.user) {
          setStats({
            highest_win: res.user.highest_win || 0,
            total_bids: res.user.total_bids || 0,
            games_won: res.user.games_won || 0,
            avg_bid: res.user.avg_bid || 0
          });
        }
      }).catch(err => console.log('Stats error:', err));
    }
  }, []);

  return (
    <div className="screen">
      <div className="wallet-hero">
        <div className="wh-label">Total Balance</div>
        <div className="wh-amount">₹{wallet.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
        <div style={{display:'flex',gap:10,justifyContent:'center',marginBottom:16}}>
          <button className="btn-add" style={{flex:1,maxWidth:140}} onClick={onAdd}>💰 Add Money</button>
          <button className="btn-wdr" style={{flex:1,maxWidth:140}} onClick={onWith}>💸 Withdraw</button>
        </div>
        <div className="wh-stats-row">
          {[
            {label:'Total Added', val: '₹' + Number(user?.total_deposited || 0).toLocaleString('en-IN')},
            {label:'Total Won',   val: '₹' + Number(user?.total_won || 0).toLocaleString('en-IN')},
            {label:'Withdrawn',   val: '₹' + Number(user?.total_withdrawn || 0).toLocaleString('en-IN')},
          ].map((s,i,arr) => (
            <React.Fragment key={i}>
              <div className="wh-stat">
                <div className="wh-stat-label">{s.label}</div>
                <div className="wh-stat-val">{s.val}</div>
              </div>
              {i < arr.length-1 && <div className="wh-divider"/>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="wallet-menu">
        {[
          {ic:'💰', l:'Add Fund',        sub:'UPI, Net Banking, Cards',   fn: onAdd},
          {ic:'💸', l:'Withdraw Fund',   sub:'Bank Transfer, UPI',        fn: onWith},
          {ic:'📋', l:'Transaction History', sub:'All credits & debits',  fn: () => navigate && navigate('txns')},
          {ic:'🎁', l:'Refer & Earn',    sub:'Earn ₹100 per referral',    fn: undefined},
        ].map((item,i) => (
          <div key={i} className="wm-item" onClick={item.fn} style={{cursor: item.fn ? 'pointer' : 'default'}}>
            <div className="wm-left">
              <div className="wm-ic">{item.ic}</div>
              <div>
                <div className="wm-label">{item.l}</div>
                <div style={{fontSize:11,color:'#aaa',marginTop:2}}>{item.sub}</div>
              </div>
            </div>
            <div className="wm-arrow">›</div>
          </div>
        ))}
      </div>

      <div className="your-stats-label">📈 Your Stats</div>
      <div className="wallet-stats-grid">
        {[
          {val: '₹'+Number(stats.highest_win).toLocaleString('en-IN'), label:'HIGHEST WIN',  cls:''},
          {val: String(stats.total_bids),                              label:'TOTAL BIDS',   cls:'orange'},
          {val: String(stats.games_won),                               label:'GAMES WON',    cls:''},
          {val: '₹'+Number(stats.avg_bid).toLocaleString('en-IN'),     label:'AVG BID',      cls:'orange'},
        ].map((s,i) => (
          <div key={i} className="ws-cell">
            <div className="ws-left-bar"/>
            <div className={`ws-value${s.cls?' '+s.cls:''}`}>{s.val}</div>
            <div className="ws-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ── SHARED STYLES
// ─────────────────────────────────────────────
const S = {
  container: { padding: '0 16px 80px', color: '#e5e7eb' },
  heading:   { fontSize: 15, fontWeight: 700, color: '#f0a500', marginTop: 20, marginBottom: 8, fontFamily: 'Rajdhani, sans-serif' },
  para:      { fontSize: 13, lineHeight: 1.8, color: '#ccc', marginBottom: 10 },
  box:       { background: '#0d2a1a', border: '1px solid #1a4a2a', borderRadius: 10, padding: '12px 14px', marginBottom: 10 },
  boxTitle:  { fontSize: 14, fontWeight: 700, color: '#f0a500', marginBottom: 4 },
  boxText:   { fontSize: 12, color: '#aaa', lineHeight: 1.7 },
  badge:     { display: 'inline-block', background: '#f0a500', color: '#0d3526', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700, marginRight: 6 },
};

function SubHeader({ title, onBack }) {
  return (
    <div style={{ background: '#0d2a1a', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #1a4a2a', position: 'sticky', top: 0, zIndex: 10 }}>
      <div onClick={onBack} style={{ fontSize: 26, cursor: 'pointer', color: '#f0a500', lineHeight: 1 }}>‹</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#f0a500', fontFamily: 'Rajdhani, sans-serif' }}>{title}</div>
    </div>
  );
}

// ── HOW TO PLAY ──
function HowToPlayPage({ onBack }) {
  return (
    <div className="screen" style={{paddingBottom:0}}>
      <SubHeader title="📖 How to Play" onBack={onBack} />
      <div style={S.container}>

        <div style={S.heading}>🎯 Matka Kya Hota Hai?</div>
        <p style={S.para}>Matka ek number guessing game hai. Aap open aur close numbers pe bet lagate ho. Sahi number aane pe aapko multiplied amount milta hai.</p>

        <div style={S.heading}>📋 Step-by-Step Guide</div>
        {[
          { n:'1', t:'Wallet Mein Paisa Daalo',   d:'Add Money karo. UPI se deposit karo, admin 15–30 min mein approve karega.' },
          { n:'2', t:'Game Chunno',                d:'Home screen se koi bhi open game chunno — Kalyan, Milan Day, etc.' },
          { n:'3', t:'Game Type Chunno',           d:'Single Digit, Jodi, Pana, Sangam — apni marzi ka game type chunno.' },
          { n:'4', t:'Number & Amount Daalo',      d:'Lucky number chunno aur bet amount daalo. Minimum ₹10.' },
          { n:'5', t:'Bid Place Karo',             d:'Place Bid dabao. Amount wallet se turant cut ho jaayega.' },
          { n:'6', t:'Result Ka Intezaar Karo',    d:'Result aane ke baad winning amount winning wallet mein credit ho jaayegi.' },
        ].map((s,i) => (
          <div key={i} style={S.box}>
            <div style={S.boxTitle}><span style={S.badge}>{s.n}</span>{s.t}</div>
            <div style={S.boxText}>{s.d}</div>
          </div>
        ))}

        <div style={S.heading}>🎮 Game Types & Multipliers</div>
        {[
          { type:'Single Digit',  mult:'9x',     desc:'0–9 mein se ek digit' },
          { type:'Jodi',          mult:'90x',    desc:'00–99 mein se ek jodi' },
          { type:'Single Pana',   mult:'150x',   desc:'3 digit ka single pana' },
          { type:'Double Pana',   mult:'300x',   desc:'3 digit ka double pana' },
          { type:'Triple Pana',   mult:'600x',   desc:'3 digit ka triple pana' },
          { type:'Half Sangam',   mult:'1500x',  desc:'Digit + Pana combination' },
          { type:'Full Sangam',   mult:'10000x', desc:'Pana + Pana combination' },
        ].map((g,i) => (
          <div key={i} style={{...S.box, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <div style={S.boxTitle}>{g.type}</div>
              <div style={S.boxText}>{g.desc}</div>
            </div>
            <div style={{color:'#22c55e', fontWeight:700, fontSize:16}}>{g.mult}</div>
          </div>
        ))}

        <div style={S.heading}>💰 Wallet Rules</div>
        <p style={S.para}>
          • <strong style={{color:'#f0a500'}}>Wallet Balance</strong> — Deposit se aata hai. Bid lagane mein use hota hai.<br/>
          • <strong style={{color:'#22c55e'}}>Winning Balance</strong> — Game jeeto toh yahan aata hai. Sirf yahan se withdrawal hogi.<br/>
          • Minimum withdrawal: <strong style={{color:'#f0a500'}}>₹500</strong><br/>
          • Withdrawal admin approve karega.
        </p>
      </div>
    </div>
  );
}

// ── FAQ ──
function FAQPage({ onBack }) {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q:'Account kaise banayein?',               a:'App ke login page pe "Register" dabao. Mobile number aur password se account bana sakte ho.' },
    { q:'Paisa kaise add karein?',               a:'Wallet → Add Money → UPI se payment → UTR number submit karo → Admin 15–30 min mein approve karega.' },
    { q:'Minimum deposit kitna hai?',            a:'Minimum deposit ₹100 hai. Maximum ₹1,00,000 tak kar sakte hain.' },
    { q:'Winning kaise withdraw karein?',        a:'Winning Balance mein jaao → Withdraw → UPI ID ya Bank details daalo → Admin approve karega. Min ₹500 chahiye.' },
    { q:'Result kab aata hai?',                  a:'Har game ka alag result time hota hai. Game card pe time dikh jaata hai. Result aane ke baad winning balance turant update hota hai.' },
    { q:'Bid cancel ho sakti hai?',              a:'Nahi. Ek baar bid place hone ke baad cancel nahi hogi. Dhyan se number aur amount check karke bid lagao.' },
    { q:'Ek se zyada account ban sakta hai?',    a:'Nahi. Ek mobile number pe sirf ek account allowed hai. Multiple accounts pe permanent ban milega.' },
    { q:'Koi problem ho toh kya karein?',        a:'Support page pe jaao. Call ya Telegram se contact karo. Mon–Sat 10AM–8PM available hain.' },
  ];

  return (
    <div className="screen" style={{paddingBottom:0}}>
      <SubHeader title="❓ FAQ" onBack={onBack} />
      <div style={S.container}>
        <p style={{...S.para, marginTop:16}}>Aksar pooche jaane wale sawaal:</p>
        {faqs.map((f,i) => (
          <div key={i} style={{...S.box, cursor:'pointer'}} onClick={() => setOpen(open===i?null:i)}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{...S.boxTitle, marginBottom:0, flex:1, paddingRight:8}}>{f.q}</div>
              <div style={{color:'#f0a500', fontSize:20, fontWeight:700}}>{open===i ? '−' : '+'}</div>
            </div>
            {open===i && (
              <div style={{...S.boxText, marginTop:10, paddingTop:10, borderTop:'1px solid #1a4a2a'}}>{f.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TERMS & CONDITIONS ──
function TermsPage({ onBack }) {
  return (
    <div className="screen" style={{paddingBottom:0}}>
      <SubHeader title="📜 Terms & Conditions" onBack={onBack} />
      <div style={S.container}>
        <p style={{...S.para, marginTop:16, color:'#f0a500'}}>Last updated: January 2024</p>
        {[
          { t:'1. Eligibility',           d:'Sirf 18+ log hi MatkaKing use kar sakte hain. Minor hone pe account turant band kar diya jaayega aur remaining balance refund hoga.' },
          { t:'2. Account Rules',         d:'Ek user sirf ek account rakh sakta hai. Fake information dene pe permanent ban ho sakta hai. Apna password safe rakhen.' },
          { t:'3. Deposits',              d:'Sirf UPI aur Bank Transfer se deposit hoga. Admin verification ke baad hi wallet credit hoga. Minimum deposit ₹100 hai.' },
          { t:'4. Withdrawals',           d:'Sirf winning balance se withdrawal hogi. Minimum ₹500 chahiye. Admin approve karega. Processing 24–48 ghante le sakta hai.' },
          { t:'5. Gameplay Rules',        d:'Bid lagane ke baad cancel nahi hogi. Result declare hone ke baad winning automatic credit hogi. Cheating ya manipulation pe permanent ban milega.' },
          { t:'6. Responsible Gaming',    d:'Apni financial limit ke andar khelo. MatkaKing responsible gaming ko encourage karta hai. Agar gambling addiction feel ho toh support se contact karein.' },
          { t:'7. Limitation of Liability', d:'MatkaKing technical issues ya server downtime ke liye zimmedaar nahi hai. Emergency mein bids cancel ho sakti hain aur amount refund kiya jaayega.' },
          { t:'8. Account Termination',   d:'MatkaKing kisi bhi account ko rules violation pe band kar sakta hai. Remaining balance refund kiya jaayega.' },
        ].map((s,i) => (
          <div key={i} style={S.box}>
            <div style={S.boxTitle}>{s.t}</div>
            <div style={S.boxText}>{s.d}</div>
          </div>
        ))}
        <p style={{...S.para, textAlign:'center', color:'#555', marginTop:16}}>
          MatkaKing use karne se aap in terms se agree karte hain.
        </p>
      </div>
    </div>
  );
}

// ── PRIVACY POLICY ──
function PrivacyPage({ onBack }) {
  return (
    <div className="screen" style={{paddingBottom:0}}>
      <SubHeader title="🔒 Privacy Policy" onBack={onBack} />
      <div style={S.container}>
        <p style={{...S.para, marginTop:16, color:'#f0a500'}}>Last updated: January 2024</p>
        {[
          { t:'📱 Kaunsa Data Collect Hota Hai?',     d:'Mobile number, naam, device info aur transaction history collect hoti hai. Koi bhi card number ya banking password store nahi hota.' },
          { t:'🔐 Data Kaise Safe Hai?',               d:'Aapka data encrypted servers pe store hota hai. JWT tokens se authentication secure hai. Kisi third party ke saath data share nahi hota.' },
          { t:'💳 Payment Information',                d:'UPI ID sirf withdrawal ke liye use hota hai. Bank details encrypted form mein store hoti hain. Processing ke baad sensitive details delete ho jaati hain.' },
          { t:'🍪 Local Storage',                      d:'App smoothly kaam kare isliye login token local storage mein save hota hai. Logout karne pe automatically delete ho jaata hai.' },
          { t:'👤 Aapke Rights',                       d:'Aap apna account aur data delete karwa sakte hain. Transaction history download kar sakte hain. Personal information update kar sakte hain.' },
          { t:'📞 Contact',                            d:'Privacy se related kisi bhi sawaal ke liye Support page pe humse contact karein. Hum 48 ghante mein jawab dete hain.' },
        ].map((s,i) => (
          <div key={i} style={S.box}>
            <div style={S.boxTitle}>{s.t}</div>
            <div style={S.boxText}>{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SUPPORT PAGE ──
// ✅ Ab PHONE_NUMBER, TELEGRAM_USER, WHATSAPP — ye teeno Admin Panel se
//    /api/admin/settings ke zariye change ho sakenge.
//    Fallback ke liye default values yahan hain.
export function SupportPage({ apiCall }) {
  const [subPage, setSubPage]     = useState(null);
  const [contacts, setContacts]   = useState({
    phone:    '9999999999',
    telegram: 'matkaking_support',
    whatsapp: '',
  });

  // Admin settings se live contacts fetch karo
  useEffect(() => {
    if (!apiCall) return;
    apiCall('/api/admin/settings')
      .then(d => {
        if (d?.success && d?.settings) {
          setContacts(prev => ({
            phone:    d.settings.phone    || d.settings.support_phone    || prev.phone,
            telegram: d.settings.telegram || d.settings.telegram_user    || prev.telegram,
            whatsapp: d.settings.whatsapp || d.settings.whatsapp_number  || prev.whatsapp,
          }));
        }
      })
      .catch(() => {}); // silently fail — defaults rahenge
  }, []);

  if (subPage === 'howtoplay') return <HowToPlayPage onBack={() => setSubPage(null)} />;
  if (subPage === 'faq')       return <FAQPage       onBack={() => setSubPage(null)} />;
  if (subPage === 'terms')     return <TermsPage     onBack={() => setSubPage(null)} />;
  if (subPage === 'privacy')   return <PrivacyPage   onBack={() => setSubPage(null)} />;

  const items = [
    {
      ic:'📞', title:'Call Support', sub:'Mon–Sat 10AM–8PM',
      fn: () => window.open(`tel:+91${contacts.phone}`, '_self')
    },
    ...(contacts.whatsapp ? [{
      ic:'💬', title:'WhatsApp Support', sub:'Quick reply in 10 mins',
      fn: () => window.open(`https://wa.me/${contacts.whatsapp}`, '_blank')
    }] : []),
    {
      ic:'✈️', title:'Telegram Support', sub:'Quick reply in 5 mins',
      fn: () => window.open(`https://t.me/${contacts.telegram}`, '_blank')
    },
    { ic:'📖', title:'How to Play',        sub:'Rules & game guide',  fn: () => setSubPage('howtoplay') },
    { ic:'❓', title:'FAQ',               sub:'Common questions',     fn: () => setSubPage('faq') },
    { ic:'📜', title:'Terms & Conditions', sub:'Rules & policies',    fn: () => setSubPage('terms') },
    { ic:'🔒', title:'Privacy Policy',     sub:'Data protection',     fn: () => setSubPage('privacy') },
  ];

  return (
    <div className="screen">
      <div className="sec-hdr"><span className="sec-t">💬 Support</span></div>
      {items.map((item, i) => (
        <div key={i} className="sup-item" onClick={item.fn} style={{cursor:'pointer'}}>
          <div className="sup-ic">{item.ic}</div>
          <div style={{flex:1}}>
            <div className="sup-title">{item.title}</div>
            <div className="sup-sub">{item.sub}</div>
          </div>
          <div style={{color:'#f0a500', fontSize:18}}>›</div>
        </div>
      ))}
      <div style={{padding:'20px 16px', fontSize:11, color:'#aaa', textAlign:'center', lineHeight:1.8}}>
        <strong>MatkaKing</strong><br/>
        Version 5.0.0<br/>
        18+ Only. Play Responsibly.
      </div>
    </div>
  );
}