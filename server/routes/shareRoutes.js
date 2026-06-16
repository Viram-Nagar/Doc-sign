const express = require("express");
const router = express.Router();
const {
  generateShareLink,
  getDocByToken,
  signViaToken,
} = require("../controllers/shareController");
const { protect } = require("../middleware/authMiddleware");

console.log("shareRoutes loaded");

// Protected — doc owner generates the link
router.post("/docs/:id/share", protect, generateShareLink);

// Public — no auth needed (token-based access)
router.get("/sign/:token", getDocByToken);
router.post("/sign/:token", signViaToken);

module.exports = router;
