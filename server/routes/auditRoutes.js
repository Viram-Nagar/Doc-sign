const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("../controllers/auditController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/:docId", getAuditLogs);

module.exports = router;
