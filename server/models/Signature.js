const mongoose = require("mongoose");

const signatureSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    signerEmail: {
      type: String,
      default: null,
    },
    // Position on PDF page (percentage-based for scale independence)
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    // Dimensions (percentage-based)
    width: {
      type: Number,
      default: 20,
    },
    height: {
      type: Number,
      default: 6,
    },
    page: {
      type: Number,
      required: true,
      default: 1,
    },
    // Signature image/text embedded after signing
    signatureDataUrl: {
      type: String,
      default: null,
    },
    signerName: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["placed", "signed", "rejected"],
      default: "placed",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    signedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Signature", signatureSchema);
