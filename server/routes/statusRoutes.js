const express = require("express");
const router = express.Router();
const {
  ownerRejectDocument,
  ownerReopenDocument,
  signerRejectViaToken,
  getDocumentStatus,
} = require("../controllers/statusController");
const { protect } = require("../middleware/authMiddleware");

// Protected — owner actions
router.patch("/:docId/reject", protect, ownerRejectDocument);
router.patch("/:docId/reopen", protect, ownerReopenDocument);
router.get("/:docId/status", protect, getDocumentStatus);

// Public — signer action via token
router.patch("/sign/:token/reject", signerRejectViaToken);

module.exports = router;
