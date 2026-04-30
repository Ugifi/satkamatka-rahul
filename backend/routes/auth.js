const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// ─── REGISTER ────────────────────────────────────────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('mobile').isMobilePhone('en-IN').withMessage('Valid 10-digit mobile required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, mobile, password, referred_by } = req.body;

  try {
    // Check existing
    const [existing] = await db.query('SELECT id FROM users WHERE mobile = ?', [mobile]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Mobile already registered' });

    const hashed = await bcrypt.hash(password, 10);

    // Handle referral
    let referrerId = null;
    if (referred_by) {
      const [ref] = await db.query('SELECT id FROM users WHERE mobile = ?', [referred_by]);
      if (ref.length) referrerId = ref[0].id;
    }

    const [result] = await db.query(
      'INSERT INTO users (name, mobile, password, referred_by) VALUES (?, ?, ?, ?)',
      [name, mobile, hashed, referrerId]
    );

    const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: result.insertId, name, mobile, role: 'user' }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post('/login', [
  body('mobile').notEmpty().withMessage('Mobile required'),
  body('password').notEmpty().withMessage('Password required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { mobile, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE mobile = ?', [mobile]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'Invalid mobile or password' });

    const user = rows[0];
    if (user.is_blocked) return res.status(403).json({ success: false, message: 'Account blocked. Contact support.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid mobile or password' });

    // Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        wallet_balance: user.wallet_balance,
        winning_balance: user.winning_balance
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── PROFILE ─────────────────────────────────────────────────────────────────
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, mobile, role, wallet_balance, winning_balance, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
router.post('/change-password', authMiddleware, [
  body('old_password').notEmpty(),
  body('new_password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { old_password, new_password } = req.body;

  try {
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const match = await bcrypt.compare(old_password, rows[0].password);
    if (!match) return res.status(400).json({ success: false, message: 'Old password incorrect' });

    const hashed = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
