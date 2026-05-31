import React, { useState, useEffect, useRef } from 'react';

export default function HomeScreen({ wallet, onAdd, onWith, onPlay, navigate }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    { bg: '#1565C0', text: 'DAILY JACKPOT', sub: 'Win Big Every Day!', emoji: '🏆' },
    { bg: '#0D47A1', text: '100% TRUSTED', sub: 'Safe & Secure Platform', emoji: '🔒' },
    { bg: '#1976D2', text: 'FAST WITHDRAWAL', sub: 'Instant Money Transfer', emoji: '⚡' },
    { bg: '#0288D1', text: 'NEW GAMES ADDED', sub: 'Play & Win Now!', emoji: '🎯' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % banners.length), 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const token = localStorage.getItem('mk_token');
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/games`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) setGames(data);
        else if (data?.games) setGames(data.games);
        else if (data?.data) setGames(data.data);
      } catch (err) {
        setGames([
          { id: 1, name: 'SUPREME DAY',   open_time: '3:35 pm', close_time: '5:35 pm',   status: 'open',   result: null },
          { id: 2, name: 'SRIDEVI NIGHT', open_time: '7:10 pm', close_time: '8:15 pm',   status: 'open',   result: null },
          { id: 3, name: 'SUPREME NIGHT', open_time: '8:43 pm', close_time: '10:43 pm',  status: 'open',   result: null },
          { id: 4, name: 'MILAN DAY',     open_time: '1:00 pm', close_time: '2:00 pm',   status: 'closed', result: '456-15-789' },
          { id: 5, name: 'KALYAN',        open_time: '3:45 pm', close_time: '5:45 pm',   status: 'closed', result: '123-69-340' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const formatResult = (res) => {
    if (!res) return '***_**_***';
    return res;
  };

  const isRunning = (g) => g.status === 'open';

  return (
    <div style={{ background: '#f2f4f7', minHeight: '100vh', paddingBottom: 80, fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@700;800&display=swap');
        * { box-sizing: border-box; }

        /* TICKER */
        .hs-ticker {
          background: #1565C0;
          padding: 7px 0;
          overflow: hidden;
          white-space: nowrap;
        }
        .hs-ticker-inner {
          display: inline-block;
          animation: tickerScroll 18s linear infinite;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        @keyframes tickerScroll {
          0%   { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }

        /* BANNER */
        .hs-banner {
          margin: 12px;
          border-radius: 16px;
          overflow: hidden;
          height: 110px;
          position: relative;
          box-shadow: 0 4px 20px rgba(21,101,192,0.3);
        }
        .hs-banner-slide {
          position: absolute; inset: 0;
          display: flex; align-items: center;
          padding: 0 24px;
          transition: opacity 0.5s ease;
        }
        .hs-banner-dots {
          position: absolute; bottom: 10px; left: 50%;
          transform: translateX(-50%);
          display: flex; gap: 5px;
        }
        .hs-banner-dot {
          width: 7px; height: 7px;
          border-radius: 4px;
          background: rgba(255,255,255,0.4);
          transition: all 0.3s; cursor: pointer;
        }
        .hs-banner-dot.active { background: #fff; width: 18px; }

        /* ACTION BUTTONS */
        .hs-action-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; padding: 0 12px; margin-bottom: 14px;
        }
        .hs-btn {
          border: none; border-radius: 40px;
          padding: 14px 10px;
          font-family: 'Nunito', sans-serif;
          font-size: 15px; font-weight: 800;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: transform 0.15s, box-shadow 0.15s;
          letter-spacing: 0.5px;
        }
        .hs-btn:active { transform: scale(0.96); }
        .hs-btn-add {
          background: linear-gradient(135deg, #1565C0, #0D47A1);
          color: #fff;
          box-shadow: 0 4px 16px rgba(21,101,192,0.4);
        }
        .hs-btn-wdr {
          background: linear-gradient(135deg, #1565C0, #0D47A1);
          color: #fff;
          box-shadow: 0 4px 16px rgba(21,101,192,0.4);
        }

        /* QUICK BUTTONS */
        .hs-quick-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; padding: 0 12px; margin-bottom: 16px;
        }
        .hs-quick-btn {
          background: #fff;
          border: 2px solid #1565C0;
          border-radius: 40px; padding: 11px 14px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(21,101,192,0.10);
          transition: all 0.2s; text-decoration: none;
        }
        .hs-quick-btn:hover { background: #1565C0; transform: translateY(-2px); }
        .hs-quick-btn:hover .hs-qb-icon { background: rgba(255,255,255,0.2); color: #fff; }
        .hs-quick-btn:hover .hs-qb-label { color: #fff; }
        .hs-qb-icon {
          width: 30px; height: 30px; border-radius: 50%;
          background: #E3F2FD;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; flex-shrink: 0;
          transition: background 0.2s;
        }
        .hs-qb-label {
          font-size: 13px; font-weight: 800;
          color: #1565C0; letter-spacing: 0.5px;
          font-family: 'Nunito', sans-serif;
          transition: color 0.2s;
        }

        /* SECTION LABEL */
        .hs-section-label {
          padding: 4px 12px 8px;
          font-size: 13px; font-weight: 800;
          color: #1565C0; letter-spacing: 2px;
          text-transform: uppercase;
          display: flex; align-items: center; gap: 6px;
        }
        .hs-section-label::after {
          content: ''; flex: 1;
          height: 1px; background: linear-gradient(90deg, rgba(21,101,192,0.3), transparent);
        }

        /* GAME CARD */
        .hs-card {
          background: #fff;
          border-radius: 16px;
          margin: 0 12px 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.07);
          transition: transform 0.2s, box-shadow 0.2s;
          border: 1px solid #e8eaf0;
          padding: 14px 16px;
        }
        .hs-card:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(0,0,0,0.11); }

        /* top row: name + calendar icon */
        .hs-card-top {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .hs-card-name {
          font-family: 'Nunito', sans-serif;
          font-size: 18px; font-weight: 900;
          color: #111; letter-spacing: 0.5px;
          text-transform: uppercase; line-height: 1.2;
        }
        .hs-cal-icon {
          width: 38px; height: 38px;
          flex-shrink: 0;
        }

        /* result */
        .hs-result {
          font-size: 14px; font-weight: 700;
          color: #1565C0; letter-spacing: 2px;
          margin-bottom: 6px;
        }

        /* status badge */
        .hs-status-running {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 13px; font-weight: 700;
          color: #2E7D32; margin-bottom: 8px;
        }
        .hs-status-closed {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 13px; font-weight: 700;
          color: #C62828; margin-bottom: 8px;
        }
        .hs-pulse-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #2E7D32;
          animation: pulseDot 1.4s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes pulseDot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(0.65); }
        }

        /* time + play row */
        .hs-bottom-row {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-top: 2px;
        }
        .hs-time-wrap {
          display: flex; align-items: center; gap: 16px;
        }
        .hs-time-block {}
        .hs-time-lbl {
          font-size: 12px; color: #666; font-weight: 600;
          margin-bottom: 1px;
        }
        .hs-time-val {
          font-size: 14px; font-weight: 700; color: #1565C0;
        }
        .hs-divider-v {
          width: 1px; height: 32px; background: #dde3f0;
          flex-shrink: 0;
        }

        /* Green circle play button — moved up via negative margin */
        .hs-play-circle {
          width: 48px; height: 48px; border-radius: 50%; border: none;
          background: linear-gradient(135deg, #43A047, #1B5E20);
          color: #fff; font-size: 17px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(46,125,50,0.45);
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: -28px;
        }
        .hs-play-circle:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(46,125,50,0.55); }
        .hs-play-circle:active { transform: scale(0.95); }
        .hs-play-circle:disabled {
          background: #E0E0E0; color: #bbb;
          cursor: not-allowed; box-shadow: none;
          margin-top: -28px;
        }
        .hs-play-circle:disabled:hover { transform: none; }

        /* Loader */
        .hs-loader { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:14px; }
        .hs-loader-ring { width:44px; height:44px; border:4px solid #E3F2FD; border-top-color:#1565C0; border-radius:50%; animation:loaderSpin 0.8s linear infinite; }
        @keyframes loaderSpin { to { transform:rotate(360deg); } }
      `}</style>

      {/* TICKER */}
      <div className="hs-ticker">
        <span className="hs-ticker-inner">
          🎯 Welcome To MatkaKing — World's Most Trusted Online Matka Platform &nbsp;&nbsp;&nbsp; ⭐ Play Responsibly, Win Smartly! &nbsp;&nbsp;&nbsp; 💰 Instant Withdrawal | 100% Safe &nbsp;&nbsp;&nbsp; 🔔 New Games Added Daily! &nbsp;&nbsp;&nbsp; 🎯 Welcome To MatkaKing — World's Most Trusted Online Matka Platform &nbsp;&nbsp;&nbsp; ⭐ Play Responsibly, Win Smartly!
        </span>
      </div>

      <div style={{ padding: '12px 12px 0' }}>

        {/* BANNER SLIDER */}
        <div className="hs-banner" style={{ marginLeft: 0, marginRight: 0, marginBottom: 14 }}>
          {banners.map((b, i) => (
            <div key={i} className="hs-banner-slide"
              style={{
                background: `linear-gradient(135deg, ${b.bg}, #0D47A1)`,
                opacity: currentSlide === i ? 1 : 0,
                pointerEvents: currentSlide === i ? 'auto' : 'none',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>MATKAKING PRESENTS</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: "'Baloo 2', cursive", lineHeight: 1.1, marginBottom: 4 }}>{b.text}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{b.sub}</div>
              </div>
              <div style={{ fontSize: 44, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>{b.emoji}</div>
            </div>
          ))}
          <div className="hs-banner-dots">
            {banners.map((_, i) => (
              <div key={i} className={`hs-banner-dot ${currentSlide === i ? 'active' : ''}`} onClick={() => setCurrentSlide(i)} />
            ))}
          </div>
        </div>

        {/* ADD / WITHDRAW */}
        <div className="hs-action-row">
          <button onClick={onAdd} className="hs-btn hs-btn-add">
            <span style={{ fontSize: 20 }}>🎒</span> ADD MONEY
          </button>
          <button onClick={onWith} className="hs-btn hs-btn-wdr">
            <span style={{ fontSize: 20 }}>💳</span> WITHDRAW
          </button>
        </div>

        {/* QUICK BUTTONS */}
        <div className="hs-quick-row">
          <div className="hs-quick-btn" onClick={() => navigate && navigate('disawar')}>
            <div className="hs-qb-icon">▶</div>
            <span className="hs-qb-label">GALI DISAWER</span>
          </div>
          <a href="https://wa.me/911234567890" className="hs-quick-btn">
            <div className="hs-qb-icon">💬</div>
            <span className="hs-qb-label">WHATSAPP</span>
          </a>
        </div>

      </div>

      {/* SECTION LABEL */}
      <div className="hs-section-label">🎮 Live Markets</div>

      {/* GAMES */}
      {loading ? (
        <div className="hs-loader">
          <div className="hs-loader-ring" />
          <span style={{ color: '#1565C0', fontWeight: 700, fontSize: 14 }}>Loading Games...</span>
        </div>
      ) : games.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#90A4AE', fontWeight: 700 }}>No games available</div>
      ) : (
        games.map((g) => {
          const open = isRunning(g);
          return (
            <div key={g.id} className="hs-card">

              {/* TOP ROW: name + calendar icon */}
              <div className="hs-card-top">
                <div className="hs-card-name">{g.name}</div>
                {/* Blue calendar SVG icon */}
                <svg className="hs-cal-icon" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="7" width="34" height="31" rx="4" stroke="#1565C0" strokeWidth="2.2" fill="#EEF4FF"/>
                  <path d="M4 15H38" stroke="#1565C0" strokeWidth="2.2"/>
                  <path d="M14 4V10M28 4V10" stroke="#1565C0" strokeWidth="2.5" strokeLinecap="round"/>
                  <rect x="10" y="20" width="5" height="4" rx="1" fill="#1565C0"/>
                  <rect x="19" y="20" width="5" height="4" rx="1" fill="#1565C0"/>
                  <rect x="28" y="20" width="4" height="4" rx="1" fill="#1565C0"/>
                  <rect x="10" y="28" width="5" height="4" rx="1" fill="#1565C0"/>
                  <rect x="19" y="28" width="5" height="4" rx="1" fill="#1565C0"/>
                </svg>
              </div>

              {/* RESULT */}
              <div className="hs-result">{formatResult(g.result)}</div>

              {/* STATUS */}
              {open ? (
                <div className="hs-status-running">
                  <span className="hs-pulse-dot" />
                  Betting is Running for today
                </div>
              ) : (
                <div className="hs-status-closed">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C62828', display: 'inline-block', flexShrink: 0 }} />
                  Market Closed
                </div>
              )}

              {/* BOTTOM: time + green play circle */}
              <div className="hs-bottom-row">
                <div className="hs-time-wrap">
                  <div className="hs-time-block">
                    <div className="hs-time-lbl">Time Open :</div>
                    <div className="hs-time-val">{g.open_time || '--:--'}</div>
                  </div>
                  <div className="hs-divider-v" />
                  <div className="hs-time-block">
                    <div className="hs-time-lbl">Time Close :</div>
                    <div className="hs-time-val">{g.close_time || '--:--'}</div>
                  </div>
                </div>

                {/* Green circle play button */}
                <button
                  className="hs-play-circle"
                  onClick={() => open && onPlay(g)}
                  disabled={!open}
                  style={!open ? { background: '#E0E0E0', color: '#bbb', cursor: 'not-allowed', boxShadow: 'none', marginTop: '-28px' } : {}}
                >
                  {open
                    ? <span style={{ marginLeft: 3 }}>▶</span>
                    : <span>▷</span>
                  }
                </button>
              </div>

            </div>
          );
        })
      )}
    </div>
  );
}