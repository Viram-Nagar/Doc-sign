const Document = require("../models/Document");
const Signature = require("../models/Signature");
const supabase = require("../config/supabase");
const generateShareToken = require("../utils/generateToken");
const { sendSigningEmail } = require("../utils/sendEmail");
const logAudit = require("../utils/auditLogger");

// ─── GENERATE SHARE LINK ─────────────────────────────────
const generateShareLink = async (req, res) => {
  try {
    const { signerEmail, signerName } = req.body;
    const docId = req.params.id;

    if (!signerEmail) {
      return res.status(400).json({ message: "Signer email is required" });
    }

    const document = await Document.findOne({
      _id: docId,
      ownerId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.status === "signed") {
      return res
        .status(400)
        .json({ message: "Document is already fully signed" });
    }

    // Generate token + expiry (7 days)
    const token = generateShareToken();
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    document.shareToken = token;
    document.shareTokenExpiry = expiry;
    document.signerEmail = signerEmail;
    await document.save();

    await logAudit({
      documentId: document._id,
      userId: req.user._id,
      action: "share_link_generated",
      actorEmail: req.user.email,
      actorType: "owner",
      req,
      metadata: {
        signerEmail,
        expiresAt: expiry,
      },
    });

    const signingUrl = `${process.env.CLIENT_URL}/sign/${token}`;

    // Send email (non-blocking — don't fail if email errors)
    try {
      await sendSigningEmail({
        toEmail: signerEmail,
        signerName: signerName || signerEmail,
        documentName: document.originalName,
        signingUrl,
        ownerName: req.user.name,
      });
    } catch (emailErr) {
      console.error("Email send failed (non-fatal):", emailErr.message);
    }

    res.status(200).json({
      message: "Signing link generated and email sent",
      signingUrl,
      token,
      expiresAt: expiry,
    });
  } catch (error) {
    console.error("Generate share link error:", error);
    res.status(500).json({ message: "Server error generating share link" });
  }
};

// ─── VALIDATE TOKEN & RETURN DOC (public route) ──────────
const getDocByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const document = await Document.findOne({ shareToken: token });

    if (!document) {
      return res
        .status(404)
        .json({ message: "Invalid or expired signing link" });
    }

    // Check expiry
    if (document.shareTokenExpiry && new Date() > document.shareTokenExpiry) {
      return res.status(410).json({ message: "This signing link has expired" });
    }

    if (document.status === "signed") {
      return res
        .status(400)
        .json({ message: "This document has already been signed" });
    }

    // Get fresh signed URL for the PDF
    const { data: urlData, error: urlError } = await supabase.storage
      .from("documents")
      .createSignedUrl(document.supabasePath, 60 * 60 * 2); // 2 hours

    if (urlError) {
      return res
        .status(500)
        .json({ message: "Failed to access document file" });
    }

    // Get signature fields for this document
    const signatures = await Signature.find({
      documentId: document._id,
      status: "placed",
    });

    await logAudit({
      documentId: document._id,
      userId: null,
      action: "document_opened_via_link",
      actorEmail: document.signerEmail,
      actorType: "signer",
      req,
      metadata: { token: token.slice(0, 8) + "…" },
    });

    res.status(200).json({
      document: {
        _id: document._id,
        originalName: document.originalName,
        status: document.status,
        signerEmail: document.signerEmail,
        fileUrl: urlData.signedUrl,
      },
      signatures,
    });
  } catch (error) {
    console.error("Get doc by token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── SIGN VIA TOKEN (public route) ───────────────────────
const signViaToken = async (req, res) => {
  try {
    console.log("SIGN CONTROLLER HIT");
    console.log("TOKEN:", req.params.token);
    const { token } = req.params;
    const { signatureId, signatureDataUrl, signerName } = req.body;

    const document = await Document.findOne({ shareToken: token });

    if (!document) {
      return res.status(404).json({ message: "Invalid signing link" });
    }

    if (document.shareTokenExpiry && new Date() > document.shareTokenExpiry) {
      return res.status(410).json({ message: "This signing link has expired" });
    }

    if (document.status === "signed") {
      return res.status(400).json({ message: "Document already fully signed" });
    }

    // Verify signature field belongs to this document
    console.log("signatureId:", signatureId);
    console.log("document._id:", document._id);
    // const signature = await Signature.findOne({
    //   _id: signatureId,
    //   documentId: document._id,
    //   status: "placed",
    // });
    const signature = await Signature.findOne({
      _id: signatureId,
      documentId: document._id,
    });

    console.log(signature);

    console.log("FOUND SIGNATURE:", signature);

    if (!signature) {
      return res.status(404).json({ message: "Signature field not found" });
    }

    // Apply the signature
    signature.signatureDataUrl = signatureDataUrl || null;
    signature.signerName = signerName || document.signerEmail || "Signer";
    signature.status = "signed";
    signature.signedAt = new Date();
    signature.ipAddress = req.ip || req.headers["x-forwarded-for"] || null;
    signature.signerEmail = document.signerEmail;
    await signature.save();

    // Check if ALL fields on doc are now signed
    const allFields = await Signature.find({ documentId: document._id });
    const allSigned = allFields.every((f) => f.status === "signed");

    if (allSigned) {
      document.status = "signed";
      await document.save();
    }

    await logAudit({
      documentId: document._id,
      userId: null,
      action: "signature_signed",
      actorEmail: document.signerEmail,
      actorType: "signer",
      req,
      metadata: {
        signerName: signature.signerName,
        page: signature.page,
        documentFullySigned: allSigned,
      },
    });

    res.status(200).json({
      message: "Signature applied successfully",
      signature,
      documentFullySigned: allSigned,
    });
  } catch (error) {
    console.error("Sign via token error:", error);
    res.status(500).json({ message: "Server error during signing" });
  }
};

module.exports = { generateShareLink, getDocByToken, signViaToken };
