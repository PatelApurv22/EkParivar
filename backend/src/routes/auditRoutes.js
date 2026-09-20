const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

// GET /api/audit - Get all audit logs
router.get('/', async (req, res) => {
  try {
    const auditLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({
      success: true,
      auditLogs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
