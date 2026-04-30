import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

import AuthScreen from './components/AuthScreen';
import Drawer from './components/Drawer';
import Toast from './components/Toast';
import { AddModal, WithdrawModal } from './components/Modals';

import HomeScreen from './pages/HomeScreen';
import GameTypePage from './pages/GameTypePage';
import BetForm from './pages/BetForm';
import { BidsPage, TxnsPage, WalletPage, SupportPage } from './pages/OtherPages';
import AdminPanel, { AdminLogin } from './pages/AdminPanel';

import { INIT_BIDS, INIT_TXNS } from './data/gameData';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function apiCall(path, method = 'GET', body = null) {
  const token = localStorage.getItem('mk_token');
  return fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  }).then(r => r.json());
}

export default function App() {
  const isAdmin = window.location.pathname === '/admin' || window.location.search.includes('admin=1');

  const [user, setUser]                   = useState(null);
  const [tab, setTab]                     = useState('home');
  const [wallet, setWallet]               = useState(0);
  const [bids, setBids]                   = useState(INIT_BIDS);
  const [txns, setTxns]                   = useState(INIT_TXNS);
  const [modal, setModal]                 = useState(null);
  const [drawer, setDrawer]               = useState(false);
  const [toast, setToast]                 = useState(null);
  const [selectedGame, setSelectedGame]   = useState(null);
  const [selectedType, setSelectedType]   = useState(null);
  const [page, setPage]                   = useState('home');
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  // walletRef — stale closure se bachata hai
  const walletRef = useRef(0);

  // ✅ FIX: bidSubmittingRef — double/triple click se multiple API calls rokta hai
  // Pehle yeh flag tha hi nahi — isliye 3 baar click = 3 baar balance deduct
  const bidSubmittingRef = useRef(false);

  const showToast = (msg, type = 'ok') => setToast({ msg, type });

  const fetchWallet = useCallback(() => {
    if (!localStorage.getItem('mk_token')) return;
    return apiCall('/api/wallet/balance')
      .then(d => {
        if (d.success) {
          const walletBal  = Number(d.wallet_balance  || 0);
          const winningBal = Number(d.winning_balance || 0);
          const total = walletBal + winningBal;
          walletRef.current = total;
          setWallet(total);
          return { walletBal, winningBal, total };
        }
        return null;
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchWallet();
  }, [user, fetchWallet]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchWallet, 30000);
    return () => clearInterval(interval);
  }, [user, fetchWallet]);

  const handleLogin = (u) => {
    setUser(u);
    setWallet(0);
    walletRef.current = 0;
  };

  const handleAdd = amt => {
    fetchWallet();
    setTxns(t => [{
      id: Date.now(), type: 'credit', name: 'Add Funds',
      date: new Date().toLocaleString('en-IN'),
      ref: '#MK' + Math.random().toString(36).slice(2, 10).toUpperCase(),
      amt, statusTxt: 'PENDING'
    }, ...t]);
    showToast(`₹${amt.toLocaleString()} added!`);
  };

  const handleWith = amt => {
    fetchWallet();
    setTxns(t => [{
      id: Date.now(), type: 'debit', name: 'Withdrawal',
      date: new Date().toLocaleString('en-IN'),
      ref: '#WD' + Date.now().toString().slice(-10),
      amt, statusTxt: 'PENDING'
    }, ...t]);
    showToast(`Withdrawal ₹${amt.toLocaleString()} sent`);
  };

 const handleBidSubmit = async (data) => {
    // ✅ FIX 1: Double/triple click protection
    if (bidSubmittingRef.current) {
      showToast('Bid processing ho rahi hai... ruko!', 'err');
      return;
    }
    bidSubmittingRef.current = true;

    const amount = data.totalAmt || data.amount || 0;

    try {
      // ✅ FIX 2: Fresh balance fetch karo
      const fresh = await fetchWallet();

      // ✅ FIX 3: Total balance check — wallet + winning dono
      const currentBalance = fresh ? fresh.total : walletRef.current;

      if (amount > currentBalance) {
        showToast(`Insufficient balance! Available: ₹${currentBalance.toLocaleString()}`, 'err');
        bidSubmittingRef.current = false;
        return;
      }

      if (data.numbers) {
        // ✅ FIX 4: Bulk bids parallel — Promise.all se fast
        const results = await Promise.all(
          data.numbers.map(bet =>
            apiCall('/api/games/bid', 'POST', {
              game_id:   selectedGame.id,
              game_type: selectedType.id,
              number:    bet.num,
              amount:    bet.amt,
              // 👇 YAHAN CHANGE KIYA HAI: Hardcoded 'open' hata kar form data se session liya
              session:   data.session || 'open' 
            })
          )
        );

        const failed = results.find(r => !r.success);
        if (failed) {
          showToast(failed.message || 'Bid failed!', 'err');
          await fetchWallet();
          bidSubmittingRef.current = false;
          return;
        }

      } else {
        // Single bid
        const res = await apiCall('/api/games/bid', 'POST', {
          game_id:   selectedGame.id,
          game_type: selectedType.id,
          number:    data.number,
          amount:    data.amount,
          // 👇 YAHAN BHI CHANGE KIYA HAI
          session:   data.session || 'open' 
        });
        if (!res.success) {
          showToast(res.message || 'Bid failed!', 'err');
          await fetchWallet();
          bidSubmittingRef.current = false;
          return;
        }
      }

      // Success
      await fetchWallet();
      showToast(`Bid ₹${amount.toLocaleString()} placed! 🎯`);
      setPage('home');
      setSelectedGame(null);
      setSelectedType(null);

    } catch (err) {
      await fetchWallet();
      showToast('Network error! Dobara try karo.', 'err');
    } finally {
      // ✅ Hamesha flag release karo — success ya error dono pe
      bidSubmittingRef.current = false;
    }
  };
  const navigate = (id) => {
    setPage(id);
    setTab(id);
  };

  const handleNav = (id) => {
    fetchWallet();
    if (id === 'add') setModal('add');
    else if (id === 'with') setModal('with');
    else { setPage(id); setSelectedGame(null); setSelectedType(null); setTab(id); }
  };

  const goBack = () => {
    if (page === 'bet-form') { setPage('game-types'); setSelectedType(null); }
    else if (page === 'game-types') { setPage('home'); setSelectedGame(null); setTab('home'); }
    else { setPage('home'); setTab('home'); }
  };

  // ── ADMIN MODE ──
  if (isAdmin) {
    if (!adminLoggedIn) return <AdminLogin onLogin={() => setAdminLoggedIn(true)} />;
    return <AdminPanel onLogout={() => setAdminLoggedIn(false)} />;
  }

  // ── AUTH ──
  if (!user) return <AuthScreen onLogin={handleLogin} />;

  const isTxnTab  = page === 'txns';
  const isSubPage = page === 'game-types' || page === 'bet-form';
  const navTitle  = page === 'game-types' ? selectedGame?.name : page === 'bet-form' ? selectedType?.label : null;

  return (
    <>
      {/* TOP NAV */}
      <div className="topnav">
        <div className="tn-left">
          {isSubPage
            ? <div className="back-btn" onClick={goBack}>‹</div>
            : <div className="hamburger" onClick={() => setDrawer(true)}><span/><span/><span/></div>
          }
          <span className="brand">
            {isSubPage ? (navTitle || 'KHAJANA') : <>SATKA MATKA <em></em></>}
          </span>
        </div>
        <div className="tn-right">
          {isTxnTab && <div className="tn-filter show">⚙ Filter</div>}
          {!isTxnTab && (
            <div className="tn-wallet" onClick={() => { fetchWallet(); setPage('wallet'); setTab('wallet'); }}>
              <span>💼</span>
              <span>₹{wallet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="tn-bell">🔔<div className="bell-dot"/></div>
        </div>
      </div>

      {/* PAGES */}
      {page === 'home'       && <HomeScreen wallet={wallet} onAdd={() => setModal('add')} onWith={() => setModal('with')} onPlay={g => { setSelectedGame(g); setPage('game-types'); setTab('home'); }}/>}
      {page === 'game-types' && <GameTypePage game={selectedGame} onSelect={gt => { setSelectedType(gt); setPage('bet-form'); }}/>}
      {page === 'bet-form'   && <BetForm game={selectedGame} gameType={selectedType} wallet={wallet} onSubmit={handleBidSubmit}/>}
      {page === 'bids'       && <BidsPage bids={bids}/>}
      {page === 'txns'       && <TxnsPage apiCall={apiCall} navigate={navigate}/>}
      {page === 'wallet'     && <WalletPage wallet={wallet} onAdd={() => setModal('add')} onWith={() => setModal('with')} user={user} navigate={navigate}/>}
      {page === 'support'    && <SupportPage apiCall={apiCall}/>}

      {/* BOTTOM NAV */}
      {!isSubPage && (
        <div className="botnav">
          <div className={`bn-item${tab==='bids'?' active':''}`} onClick={() => { setPage('bids'); setTab('bids'); }}>
            <span className="ni">🔨</span><span>My Bids</span>
          </div>
          <div className={`bn-item${tab==='txns'?' active':''}`} onClick={() => { setPage('txns'); setTab('txns'); }}>
            <span className="ni">💳</span><span>Transaction</span>
          </div>
          <div className="bn-center" onClick={() => { setPage('home'); setTab('home'); setSelectedGame(null); setSelectedType(null); }}>
            <div className="home-circle"><span className="ni">🏠</span></div>
            <span style={{ color: tab==='home' ? '#f0a500' : '#9ca3af' }}>Home</span>
          </div>
          <div className={`bn-item${tab==='wallet'?' active':''}`} onClick={() => { fetchWallet(); setPage('wallet'); setTab('wallet'); }}>
            <span className="ni">🏦</span><span>Wallet</span>
          </div>
          <div className={`bn-item${tab==='support'?' active':''}`} onClick={() => { setPage('support'); setTab('support'); }}>
            <span className="ni">💬</span><span>Support</span>
          </div>
        </div>
      )}

      {/* OVERLAYS */}
      {drawer   && <Drawer user={user} onClose={() => setDrawer(false)} onNav={handleNav} onLogout={() => { setUser(null); setWallet(0); walletRef.current = 0; setDrawer(false); }}/>}
      {modal === 'add'  && <AddModal onClose={() => setModal(null)} onSuccess={handleAdd}/>}
      {modal === 'with' && <WithdrawModal wallet={wallet} onClose={() => setModal(null)} onSuccess={handleWith}/>}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
    </>
  );
}