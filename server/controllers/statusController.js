const Document = require("../models/Document");
const Signature = require("../models/Signature");
const logAudit = require("../utils/auditLogger");

// ─── OWNER REJECTS DOCUMENT ───────────────────────────────
const ownerRejectDocument = async (req, res) => {
  try {
    const { reason } = req.body;
    const { docId } = req.params;

    const document = await Document.findOne({
      _id: docId,
      ownerId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.status === "rejected") {
      return res.status(400).json({ message: "Document is already rejected" });
    }

    if (document.status === "signed" && document.signedPdfPath) {
      return res.status(400).json({
        message: "Cannot reject a finalized document",
      });
    }

    // Mark all placed/signed signature fields as rejected
    await Signature.updateMany(
      { documentId: docId, status: { $in: ["placed", "signed"] } },
      {
        status: "rejected",
        rejectionReason: reason || "Rejected by document owner",
      },
    );

    // Update document
    document.status = "rejected";
    document.rejectionReason = reason || null;
    document.rejectedBy = req.user.email;
    document.rejectedByType = "owner";
    document.rejectedAt = new Date();

    // Invalidate share token so signer can no longer access
    document.shareToken = null;
    document.shareTokenExpiry = null;

    await document.save();

    await logAudit({
      documentId: document._id,
      userId: req.user._id,
      action: "document_deleted", // closest enum — Day 12 we add rejected
      actorEmail: req.user.email,
      actorType: "owner",
      req,
      metadata: {
        reason: reason || "No reason provided",
        rejectedBy: req.user.email,
      },
    });

    res.status(200).json({
      message: "Document rejected",
      document,
    });
  } catch (error) {
    console.error("Owner reject error:", error);
    res.status(500).json({ message: "Server error rejecting document" });
  }
};

// ─── OWNER REOPENS (resets to pending) ───────────────────
const ownerReopenDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    const document = await Document.findOne({
      _id: docId,
      ownerId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.status !== "rejected") {
      return res
        .status(400)
        .json({ message: "Only rejected documents can be reopened" });
    }

    // Reset document status
    document.status = "pending";
    document.rejectionReason = null;
    document.rejectedBy = null;
    document.rejectedByType = null;
    document.rejectedAt = null;
    await document.save();

    // Reset all rejected signature fields back to placed
    await Signature.updateMany(
      { documentId: docId, status: "rejected" },
      { status: "placed", rejectionReason: null },
    );

    await logAudit({
      documentId: document._id,
      userId: req.user._id,
      action: "document_viewed", // used as generic action
      actorEmail: req.user.email,
      actorType: "owner",
      req,
      metadata: { action: "document_reopened" },
    });

    res.status(200).json({
      message: "Document reopened successfully",
      document,
    });
  } catch (error) {
    console.error("Reopen error:", error);
    res.status(500).json({ message: "Server error reopening document" });
  }
};

// ─── SIGNER REJECTS VIA TOKEN ────────────────────────────
const signerRejectViaToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { reason } = req.body;

    const document = await Document.findOne({ shareToken: token });

    if (!document) {
      return res.status(404).json({ message: "Invalid signing link" });
    }

    if (document.shareTokenExpiry && new Date() > document.shareTokenExpiry) {
      return res.status(410).json({ message: "This signing link has expired" });
    }

    if (document.status !== "pending") {
      return res.status(400).json({
        message: `Document is already ${document.status}`,
      });
    }

    // Mark all placed signature fields as rejected
    await Signature.updateMany(
      { documentId: document._id, status: "placed" },
      {
        status: "rejected",
        rejectionReason: reason || "Rejected by signer",
      },
    );

    document.status = "rejected";
    document.rejectionReason = reason || null;
    document.rejectedBy = document.signerEmail;
    document.rejectedByType = "signer";
    document.rejectedAt = new Date();
    document.shareToken = null;
    document.shareTokenExpiry = null;
    await document.save();

    await logAudit({
      documentId: document._id,
      userId: null,
      action: "document_deleted",
      actorEmail: document.signerEmail,
      actorType: "signer",
      req,
      metadata: {
        reason: reason || "No reason provided",
        rejectedBy: document.signerEmail,
      },
    });

    res.status(200).json({
      message: "Document rejected by signer",
      document,
    });
  } catch (error) {
    console.error("Signer reject error:", error);
    res.status(500).json({ message: "Server error during rejection" });
  }
};

// ─── GET STATUS SUMMARY ───────────────────────────────────
const getDocumentStatus = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.docId,
      ownerId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const signatures = await Signature.find({ documentId: document._id });

    const summary = {
      status: document.status,
      totalFields: signatures.length,
      signedFields: signatures.filter((s) => s.status === "signed").length,
      placedFields: signatures.filter((s) => s.status === "placed").length,
      rejectedFields: signatures.filter((s) => s.status === "rejected").length,
      rejectionReason: document.rejectionReason,
      rejectedBy: document.rejectedBy,
      rejectedByType: document.rejectedByType,
      rejectedAt: document.rejectedAt,
      finalizedAt: document.finalizedAt,
      isFinalized: !!document.signedPdfPath,
    };

    res.status(200).json({ summary, document });
  } catch (error) {
    console.error("Get status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  ownerRejectDocument,
  ownerReopenDocument,
  signerRejectViaToken,
  getDocumentStatus,
};
