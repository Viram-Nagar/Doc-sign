const express = require("express");
const router = express.Router();
const {
  finalizeDocument,
  getSignedPdfUrl,
} = require("../controllers/finalizeController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/:docId/finalize", finalizeDocument);
router.get("/:docId/signed-url", getSignedPdfUrl);

module.exports = router;
