const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Family = require('../models/Family');

const JWT_SECRET = process.env.JWT_SECRET || 'ekparivar_fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ─────────────────────────────────────────────
// Middleware: verify JWT on protected routes
// ─────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided. Please login.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/login
// Accepts: { role, mobile, otp }
// Returns: { success, token, role, mobile, familyId }
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { role, mobile, otp } = req.body;

    // Demo/Hackathon: Accept any 6-digit OTP
    if (!otp || String(otp).length !== 6) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit mock OTP.' });
    }
    if (!mobile || String(mobile).length < 10) {
      return res.status(400).json({ success: false, message: 'Invalid mobile number.' });
    }

    let payload = { role, mobile };
    let familyId = null;

    if (role === 'family') {
      const family = await Family.findOne({ mobile });
      familyId = family ? family.familyId : null;
      payload.familyId = familyId;
    } else if (role === 'officer') {
      // Officer auth — extend payload as needed
      payload.officerMobile = mobile;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      success: true,
      token,
      role,
      mobile,
      familyId,
      message: `${role === 'officer' ? 'Officer' : 'Family'} login successful`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/auth/verify
// Verifies the JWT sent in Authorization header
// Returns decoded payload or 401
// ─────────────────────────────────────────────
router.get('/verify', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Export middleware so other route files can protect themselves
module.exports = router;
module.exports.requireAuth = requireAuth;
