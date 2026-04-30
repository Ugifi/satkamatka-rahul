import React, { useState, useEffect } from 'react';
import { api } from '../api'; // API file ko import karein
import { QUICK_GAMES, MARQUEE_TEXT } from '../data/gameData';

const API = 'https://satta-matka-qoyn.onrender.com';
export default function HomeScreen({ wallet, onAdd, onWith, onPlay }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = () => {
      // Direct aapke api.js se fetch karega!
      api.getGames()
        .then(d => {
          if (d.success && d.games) {
            setGames(d.games);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchGames();
    const interval = setInterval(fetchGames, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="screen">
      <div className="bubbles">
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
      </div>

      {/* Marquee */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          <span className="mtxt">{MARQUEE_TEXT} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {MARQUEE_TEXT}</span>
        </div>
      </div>

      {/* Quick Play Buttons — QUICK_GAMES static reh sakte hain */}
      <div className="quick-btns">
        {QUICK_GAMES.map(g => (
          <div key={g.id} className="qb" onClick={() => onPlay(g)}>
            <div className="qb-play">
              <svg viewBox="0 0 10 10"><polygon points="2,1 9,5 2,9"/></svg>
            </div>
            <span className="qb-name">{g.name}</span>
          </div>
        ))}
      </div>

      {/* Add/Withdraw */}
      <div className="action-row">
        <button className="btn-add" onClick={onAdd}>
          <span className="ic">💰</span> Add Money
        </button>
        <button className="btn-wdr" onClick={onWith}>
          <span className="ic">💸</span> Withdraw
        </button>
      </div>

      {/* Games Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>
          ⏳ Loading games...
        </div>
      ) : (
        <div className="games-grid">
          {games.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)', gridColumn: '1/-1' }}>
              Koi game available nahi hai
            </div>
          ) : (
            games.map(g => {
              // ✅ Backend se real open/close status
              const isOpen = g.status === 'open';
              // Result display — jodi_result ya open+close
              const resultDisplay = g.jodi_result
                ? g.jodi_result
                : (g.open_result || g.close_result)
                  ? `${g.open_result || '?'}-${g.close_result || '?'}`
                  : '***-***';

              // Backend game object ko HomeScreen ke format mein convert karo
              const gameObj = {
                id:         g.id,
                name:       g.name,
                icon:       '🎯',
                time:       `${g.open_time || ''} – ${g.close_time || ''}`,
                result:     resultDisplay,
                open:       isOpen,
                status:     g.status,
                open_time:  g.open_time,
                close_time: g.close_time,
                min_bid:    g.min_bid,
                max_bid:    g.max_bid,
              };

              return (
                <div key={g.id} className="gc">
                  <div className="gc-time-row">
                    <span className="gc-time">{g.open_time || ''}</span>
                    <div className="gc-info">i</div>
                  </div>
                  <div className="gc-name">🎯 {g.name}</div>
                  <div className="gc-result">{resultDisplay}</div>
                  <div className={`gc-status ${isOpen ? 'open' : 'closed'}`}>
                    {isOpen ? '● Open' : '● Closed'}
                  </div>
                  <button
                    className={`gc-btn ${isOpen ? 'open' : 'closed'}`}
                    onClick={() => isOpen && onPlay(gameObj)}
                    disabled={!isOpen}
                  >
                    {isOpen ? <><span className="play-icon">▶</span> Play Now</> : '🔒 Closed'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}