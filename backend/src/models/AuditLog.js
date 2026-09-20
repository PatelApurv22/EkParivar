const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actorId: String,
  actorType: {
    type: String,
    enum: ["Officer", "Member", "System Automation"],
    required: true
  },
  actorName: String,
  action: {
    type: String,
    required: true
  },
  targetType: String,
  targetId: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
