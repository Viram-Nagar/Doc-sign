const Signature = require("../models/Signature");
const Document = require("../models/Document");
const logAudit = require("../utils/auditLogger");

// ─── SAVE SIGNATURE POSITION ─────────────────────────────
const saveSignature = async (req, res) => {
  try {
    const { documentId, x, y, width, height, page, signerEmail } = req.body;

    if (!documentId || x === undefined || y === undefined || !page) {
      return res
        .status(400)
        .json({ message: "documentId, x, y, page are required" });
    }

    // Verify document belongs to this user
    const document = await Document.findOne({
      _id: documentId,
      ownerId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const signature = await Signature.create({
      documentId,
      ownerId: req.user._id,
      signerEmail: signerEmail || null,
      x,
      y,
      width: width || 20,
      height: height || 6,
      page,
    });

    await logAudit({
      documentId: documentId,
      userId: req.user._id,
      action: "signature_placed",
      actorEmail: req.user.email,
      actorType: "owner",
      req,
      metadata: {
        page: page,
        signerEmail: signerEmail || null,
        x,
        y,
      },
    });
    // Update document signerEmail if provided
    if (signerEmail && !document.signerEmail) {
      document.signerEmail = signerEmail;
      await document.save();
    }

    res.status(201).json({
      message: "Signature position saved",
      signature,
    });
  } catch (error) {
    console.error("Save signature error:", error);
    res.status(500).json({ message: "Server error saving signature" });
  }
};

// ─── GET SIGNATURES FOR A DOCUMENT ──────────────────────
const getSignatures = async (req, res) => {
  try {
    const { docId } = req.params;

    // Verify document ownership
    const document = await Document.findOne({
      _id: docId,
      ownerId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const signatures = await Signature.find({ documentId: docId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ signatures });
  } catch (error) {
    console.error("Get signatures error:", error);
    res.status(500).json({ message: "Server error fetching signatures" });
  }
};

// ─── DELETE A SIGNATURE FIELD ────────────────────────────
const deleteSignature = async (req, res) => {
  try {
    const signature = await Signature.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!signature) {
      return res.status(404).json({ message: "Signature not found" });
    }

    if (signature.status === "signed") {
      return res
        .status(400)
        .json({ message: "Cannot delete a signed signature field" });
    }

    await Signature.findByIdAndDelete(signature._id);

    await logAudit({
      documentId: signature.documentId,
      userId: req.user._id,
      action: "signature_deleted",
      actorEmail: req.user.email,
      actorType: "owner",
      req,
    });

    res.status(200).json({ message: "Signature field removed" });
  } catch (error) {
    console.error("Delete signature error:", error);
    res.status(500).json({ message: "Server error deleting signature" });
  }
};

// ─── UPDATE SIGNATURE POSITION (drag reposition) ─────────
const updateSignaturePosition = async (req, res) => {
  try {
    const { x, y, width, height, page } = req.body;

    const signature = await Signature.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!signature) {
      return res.status(404).json({ message: "Signature not found" });
    }

    if (signature.status === "signed") {
      return res
        .status(400)
        .json({ message: "Cannot move a signed signature" });
    }

    if (x !== undefined) signature.x = x;
    if (y !== undefined) signature.y = y;
    if (width !== undefined) signature.width = width;
    if (height !== undefined) signature.height = height;
    if (page !== undefined) signature.page = page;

    await signature.save();

    await logAudit({
      documentId: signature.documentId,
      userId: req.user._id,
      action: "signature_moved",
      actorEmail: req.user.email,
      actorType: "owner",
      req,
      metadata: { newX: signature.x, newY: signature.y },
    });

    res.status(200).json({ message: "Position updated", signature });
  } catch (error) {
    console.error("Update signature error:", error);
    res.status(500).json({ message: "Server error updating signature" });
  }
};

// ─── APPLY DRAWN SIGNATURE ───────────────────────────────
const applySignature = async (req, res) => {
  try {
    const { signatureDataUrl, signerName } = req.body;

    const signature = await Signature.findById(req.params.id);

    if (!signature) {
      return res.status(404).json({ message: "Signature field not found" });
    }

    if (signature.status === "signed") {
      return res.status(400).json({ message: "Already signed" });
    }

    signature.signatureDataUrl = signatureDataUrl || null;
    signature.signerName = signerName || "Signed";
    signature.status = "signed";
    signature.signedAt = new Date();
    signature.ipAddress = req.ip || req.headers["x-forwarded-for"] || null;

    await signature.save();

    await logAudit({
      documentId: signature.documentId,
      userId: req.user._id,
      action: "signature_signed",
      actorEmail: req.user.email,
      actorType: "owner",
      req,
      metadata: {
        signerName: signature.signerName,
        page: signature.page,
        signedAt: signature.signedAt,
      },
    });

    // Check if ALL fields on this document are signed
    const allFields = await Signature.find({
      documentId: signature.documentId,
    });
    const allSigned = allFields.every((f) => f.status === "signed");

    if (allSigned) {
      await Document.findByIdAndUpdate(signature.documentId, {
        status: "signed",
      });
    }

    res.status(200).json({
      message: "Signature applied",
      signature,
    });
  } catch (error) {
    console.error("Apply signature error:", error);
    res.status(500).json({ message: "Server error applying signature" });
  }
};

module.exports = {
  saveSignature,
  getSignatures,
  deleteSignature,
  updateSignaturePosition,
  applySignature,
};
