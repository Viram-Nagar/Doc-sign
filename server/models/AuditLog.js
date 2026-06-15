const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for public/token-based actions
    },
    action: {
      type: String,
      enum: [
        "document_uploaded",
        "document_viewed",
        "document_deleted",
        "signature_placed",
        "signature_moved",
        "signature_signed",
        "signature_deleted",
        "share_link_generated",
        "document_opened_via_link",
        "document_finalized",
        "document_downloaded",
      ],
      required: true,
    },
    actorEmail: {
      type: String,
      default: null, // email of whoever performed the action
    },
    actorType: {
      type: String,
      enum: ["owner", "signer", "system"],
      default: "owner",
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}, // extra context per action
    },
  },
  {
    timestamps: true, // createdAt = the log timestamp
  },
);

// Index for fast lookup by document
auditLogSchema.index({ documentId: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
