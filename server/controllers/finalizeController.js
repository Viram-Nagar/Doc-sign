const Document = require("../models/Document");
const Signature = require("../models/Signature");
const supabase = require("../config/supabase");
const generateSignedPdf = require("../utils/generateSignedPdf");
const { v4: uuidv4 } = require("uuid");
const logAudit = require("../utils/auditLogger");

// ─── FINALIZE — embed signatures & seal PDF ───────────────
const finalizeDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    // 1. Fetch document (must belong to this user)
    const document = await Document.findOne({
      _id: docId,
      ownerId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.status !== "signed") {
      return res.status(400).json({
        message: "Document must be fully signed before finalizing",
      });
    }

    if (document.signedPdfPath) {
      // Already finalized — return existing URL
      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(document.signedPdfPath, 60 * 60 * 2);

      return res.status(200).json({
        message: "Already finalized",
        signedPdfUrl: data?.signedUrl || document.signedPdfUrl,
        document,
      });
    }

    // 2. Get all signed signatures
    const signatures = await Signature.find({
      documentId: docId,
      status: "signed",
    });

    if (signatures.length === 0) {
      return res.status(400).json({ message: "No signed signatures found" });
    }

    // 3. Get fresh URL for the original PDF
    const { data: urlData, error: urlError } = await supabase.storage
      .from("documents")
      .createSignedUrl(document.supabasePath, 60 * 10); // 10 min

    if (urlError || !urlData?.signedUrl) {
      return res.status(500).json({ message: "Failed to access original PDF" });
    }

    // 4. Generate signed PDF bytes via pdf-lib
    console.log("⚙️  Generating signed PDF...");
    const signedPdfBytes = await generateSignedPdf(
      urlData.signedUrl,
      signatures,
    );

    // 5. Upload sealed PDF to Supabase (separate path)
    const signedFileName = `signed_${uuidv4()}.pdf`;
    const signedPath = `signed/${req.user._id}/${signedFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(signedPath, signedPdfBytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase signed PDF upload error:", uploadError);
      return res.status(500).json({ message: "Failed to store signed PDF" });
    }

    // 6. Get signed URL for the finalized PDF
    const { data: signedUrlData } = await supabase.storage
      .from("documents")
      .createSignedUrl(signedPath, 60 * 60 * 24 * 365); // 1 year

    // 7. Update document record
    document.signedPdfPath = signedPath;
    document.signedPdfUrl = signedUrlData?.signedUrl || null;
    document.finalizedAt = new Date();
    await document.save();

    await logAudit({
      documentId: document._id,
      userId: req.user._id,
      action: "document_finalized",
      actorEmail: req.user.email,
      actorType: "owner",
      req,
      metadata: {
        signedPdfPath: document.signedPdfPath,
        finalizedAt: document.finalizedAt,
      },
    });

    console.log("✅ Signed PDF finalized:", signedPath);

    res.status(200).json({
      message: "Document finalized successfully",
      signedPdfUrl: signedUrlData?.signedUrl,
      document,
    });
  } catch (error) {
    console.error("Finalize error:", error);
    res.status(500).json({ message: "Failed to generate signed PDF" });
  }
};

// ─── GET FRESH DOWNLOAD URL ───────────────────────────────
const getSignedPdfUrl = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.docId,
      ownerId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (!document.signedPdfPath) {
      return res.status(404).json({ message: "Signed PDF not yet generated" });
    }

    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(document.signedPdfPath, 60 * 60 * 2); // 2 hours

    if (error) {
      return res
        .status(500)
        .json({ message: "Failed to generate download URL" });
    }

    res.status(200).json({ signedPdfUrl: data.signedUrl });
  } catch (error) {
    console.error("Get signed PDF URL error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { finalizeDocument, getSignedPdfUrl };
