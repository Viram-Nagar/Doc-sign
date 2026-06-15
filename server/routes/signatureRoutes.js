const express = require("express");
const router = express.Router();
const {
  saveSignature,
  getSignatures,
  deleteSignature,
  updateSignaturePosition,
  applySignature,
} = require("../controllers/signatureController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", saveSignature);
router.get("/:docId", getSignatures);
router.delete("/:id", deleteSignature);
router.patch("/:id/position", updateSignaturePosition);
router.patch("/:id/sign", applySignature);

module.exports = router;
