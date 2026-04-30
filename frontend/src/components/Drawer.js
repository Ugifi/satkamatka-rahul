import React from 'react';

const MENU_SECTIONS = [
  { label: 'ACCOUNT', items: [
    { id:'wallet',   ic:'💼', l:'My Wallet'       },
    { id:'bids',     ic:'🎯', l:'My Bids'         },
    { id:'txns',     ic:'📋', l:'Transaction History'},
  ]},
  { label: 'GAMES', items: [
    { id:'home',     ic:'🎮', l:'All Games'       },
    { id:'support',  ic:'🏆', l:'Win History'     },
  ]},
  { label: 'MORE', items: [
    { id:'support',  ic:'💬', l:'Support'         },
    { id:'support',  ic:'📖', l:'How to Play'     },
    { id:'support',  ic:'📜', l:'Terms & Conditions'},
  ]},
];

export default function Drawer({ user, onClose, onNav, onLogout }) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose}/>
      <div className="drawer">
        <div className="drawer-header">
          <div className="drawer-user">
            <div className="drawer-avatar">👤</div>
            <div>
              <div className="drawer-name">{user.name}</div>
              <div className="drawer-mobile">{user.mobile}</div>
            
<div className="drawer-since">
  Member since {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
</div>
            </div>
          </div>
          <div className="drawer-close" onClick={onClose}>✕</div>
        </div>
        <div className="drawer-actions">
          {[
            { id:'add',  ic:'💰', l:'Add Fund'  },
            { id:'with', ic:'💸', l:'Withdraw'  },
            { id:'bids', ic:'🎯', l:'My Bids'   },
          ].map(a => (
            <div key={a.id} className="da-btn" onClick={() => { onNav(a.id); onClose(); }}>
              <div className="da-icon">{a.ic}</div>
              <span className="da-label">{a.l}</span>
            </div>
          ))}
        </div>
        {MENU_SECTIONS.map(sec => (
          <div key={sec.label}>
            <div className="drawer-section-label">{sec.label}</div>
            {sec.items.map((item, i) => (
              <div key={i} className="drawer-item" onClick={() => { onNav(item.id); onClose(); }}>
                <div className="di-icon"><span>{item.ic}</span></div>
                <span className="di-label">{item.l}</span>
              </div>
            ))}
          </div>
        ))}
        <div className="drawer-item" onClick={onLogout} style={{ borderTop: '2px solid #f0f0f0', marginTop: 4 }}>
          <div className="di-icon" style={{ background: '#fee2e2' }}><span>🔴</span></div>
          <span className="di-label" style={{ color: '#ef4444', fontWeight: 600 }}>Logout</span>
        </div>
      </div>
    </>
  );
}
