const AuditLog = require("../models/AuditLog");

/**
 * Log an audit event
 *
 * @param {Object} params
 * @param {string}  params.documentId
 * @param {string}  [params.userId]       - null for public actions
 * @param {string}  params.action         - from AuditLog enum
 * @param {string}  [params.actorEmail]
 * @param {string}  [params.actorType]    - 'owner' | 'signer' | 'system'
 * @param {Object}  [params.req]          - Express req object for IP/UA
 * @param {Object}  [params.metadata]     - extra data
 */
const logAudit = async ({
  documentId,
  userId = null,
  action,
  actorEmail = null,
  actorType = "owner",
  req = null,
  metadata = {},
}) => {
  try {
    const ipAddress = req
      ? req.headers["x-forwarded-for"] || req.ip || null
      : null;

    const userAgent = req ? req.headers["user-agent"] || null : null;

    await AuditLog.create({
      documentId,
      userId,
      action,
      actorEmail,
      actorType,
      ipAddress,
      userAgent,
      metadata,
    });
  } catch (err) {
    // Never let audit logging crash the main request
    console.error("Audit log error (non-fatal):", err.message);
  }
};

module.exports = logAudit;
