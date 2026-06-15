const express = require("express");
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  getFreshUrl,
} = require("../controllers/docController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(protect);

router.post("/upload", upload.single("document"), uploadDocument);
router.get("/", getDocuments);
router.get("/:id/fresh-url", getFreshUrl); // ← must be before /:id
router.get("/:id", getDocument);
router.delete("/:id", deleteDocument);

module.exports = router;
