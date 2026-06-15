const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    supabasePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "signed", "rejected"],
      default: "pending",
    },
    shareToken: {
      type: String,
      default: null,
    },
    shareTokenExpiry: {
      type: Date,
      default: null,
    },
    signerEmail: {
      type: String,
      default: null,
    },
    // Finalized signed PDF
    signedPdfPath: {
      type: String,
      default: null,
    },
    signedPdfUrl: {
      type: String,
      default: null,
    },
    finalizedAt: {
      type: Date,
      default: null,
    },
    // ── NEW: Rejection fields ──────────────────────────────
    rejectionReason: {
      type: String,
      default: null,
    },
    rejectedBy: {
      type: String, // email of whoever rejected
      default: null,
    },
    rejectedByType: {
      type: String,
      enum: ["owner", "signer", null],
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Document", documentSchema);

// const mongoose = require("mongoose");

// const documentSchema = new mongoose.Schema(
//   {
//     ownerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     fileName: {
//       type: String,
//       required: true,
//     },
//     originalName: {
//       type: String,
//       required: true,
//     },
//     fileUrl: {
//       type: String,
//       required: true,
//     },
//     supabasePath: {
//       type: String,
//       required: true,
//     },
//     fileSize: {
//       type: Number,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "signed", "rejected"],
//       default: "pending",
//     },
//     shareToken: {
//       type: String,
//       default: null,
//     },
//     shareTokenExpiry: {
//       type: Date,
//       default: null,
//     },
//     signerEmail: {
//       type: String,
//       default: null,
//     },
//     // ── NEW: Finalized signed PDF ──────────────────────────
//     signedPdfPath: {
//       type: String,
//       default: null,
//     },
//     signedPdfUrl: {
//       type: String,
//       default: null,
//     },
//     finalizedAt: {
//       type: Date,
//       default: null,
//     },
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model("Document", documentSchema);

// const mongoose = require("mongoose");

// const documentSchema = new mongoose.Schema(
//   {
//     ownerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     fileName: {
//       type: String,
//       required: true,
//     },
//     originalName: {
//       type: String,
//       required: true,
//     },
//     fileUrl: {
//       type: String,
//       required: true,
//     },
//     supabasePath: {
//       type: String,
//       required: true,
//     },
//     fileSize: {
//       type: Number,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "signed", "rejected"],
//       default: "pending",
//     },
//     shareToken: {
//       type: String,
//       default: null,
//     },
//     shareTokenExpiry: {
//       type: Date,
//       default: null,
//     },
//     signerEmail: {
//       type: String,
//       default: null,
//     },
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model("Document", documentSchema);
