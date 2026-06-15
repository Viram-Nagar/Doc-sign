const AuditLog = require("../models/AuditLog");
const Document = require("../models/Document");

// ─── GET AUDIT LOGS FOR A DOCUMENT ───────────────────────
const getAuditLogs = async (req, res) => {
  try {
    const { docId } = req.params;

    // Verify ownership
    const document = await Document.findOne({
      _id: docId,
      ownerId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const logs = await AuditLog.find({ documentId: docId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({ logs, document });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ message: "Server error fetching audit logs" });
  }
};

module.exports = { getAuditLogs };
