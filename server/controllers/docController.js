const Document = require("../models/Document");
const supabase = require("../config/supabase");
const { v4: uuidv4 } = require("uuid");
const logAudit = require("../utils/auditLogger");

// ─── UPLOAD DOCUMENT ────────────────────────────────────
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file;
    const fileExt = "pdf";
    const uniqueName = `${uuidv4()}.${fileExt}`;
    const supabasePath = `uploads/${req.user._id}/${uniqueName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(supabasePath, file.buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return res
        .status(500)
        .json({ message: "Failed to upload file to storage" });
    }

    // Get signed URL (valid 1 year for viewing)
    const { data: urlData } = await supabase.storage
      .from("documents")
      .createSignedUrl(supabasePath, 60 * 60 * 24 * 365);

    const document = await Document.create({
      ownerId: req.user._id,
      fileName: uniqueName,
      originalName: file.originalname,
      fileUrl: urlData.signedUrl,
      supabasePath,
      fileSize: file.size,
    });

    await logAudit({
      documentId: document._id,
      userId: req.user._id,
      action: "document_uploaded",
      actorEmail: req.user.email,
      actorType: "owner",
      req,
      metadata: {
        fileName: document.originalName,
        fileSize: document.fileSize,
      },
    });

    res.status(201).json({
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
};

// ─── GET ALL USER DOCUMENTS ──────────────────────────────
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ ownerId: req.user._id }).sort({
      createdAt: -1,
    });

    // Refresh signed URLs
    const docsWithFreshUrls = await Promise.all(
      documents.map(async (doc) => {
        const { data } = await supabase.storage
          .from("documents")
          .createSignedUrl(doc.supabasePath, 60 * 60 * 2); // 2 hours

        return {
          ...doc.toObject(),
          fileUrl: data?.signedUrl || doc.fileUrl,
        };
      }),
    );

    res.status(200).json({ documents: docsWithFreshUrls });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ message: "Server error fetching documents" });
  }
};

// ─── GET SINGLE DOCUMENT ─────────────────────────────────
const getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    await logAudit({
      documentId: document._id,
      userId: req.user._id,
      action: "document_viewed",
      actorEmail: req.user.email,
      actorType: "owner",
      req,
    });

    // Fresh signed URL
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(document.supabasePath, 60 * 60 * 2);

    res.status(200).json({
      document: {
        ...document.toObject(),
        fileUrl: data?.signedUrl || document.fileUrl,
      },
    });
  } catch (error) {
    console.error("Get document error:", error);
    res.status(500).json({ message: "Server error fetching document" });
  }
};

// ─── DELETE DOCUMENT ─────────────────────────────────────
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from("documents")
      .remove([document.supabasePath]);

    if (error) {
      console.error("Supabase delete error:", error);
    }

    await logAudit({
      documentId: document._id,
      userId: req.user._id,
      action: "document_deleted",
      actorEmail: req.user.email,
      actorType: "owner",
      req,
      metadata: { fileName: document.originalName },
    });

    await Document.findByIdAndDelete(document._id);

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error deleting document" });
  }
};

// ─── GET FRESH SIGNED URL ────────────────────────────────
const getFreshUrl = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(document.supabasePath, 60 * 60 * 2); // 2 hours

    if (error) {
      return res.status(500).json({ message: "Failed to generate URL" });
    }

    res.status(200).json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error("Fresh URL error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  getFreshUrl, // ← add this
};
