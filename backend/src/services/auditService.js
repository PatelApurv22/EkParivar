const AuditLog = require('../models/AuditLog');

async function logAudit({ actorId, actorType, actorName, action, targetType, targetId, details }) {
  try {
    const audit = new AuditLog({
      actorId: actorId || "sys",
      actorType: actorType || "Member",
      actorName: actorName || "User",
      action,
      targetType,
      targetId,
      timestamp: new Date(),
      details
    });
    await audit.save();
    return audit;
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

module.exports = {
  logAudit
};
