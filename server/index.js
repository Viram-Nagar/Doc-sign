require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

// ── Connect DB ───────────────────────────────────────────
connectDB();

// ── CORS ─────────────────────────────────────────────────
const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"].filter(
  Boolean,
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Body parsers ─────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Health check ─────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "✅ DocSign API is running",
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ───────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/docs", require("./routes/docRoutes"));
app.use("/api/signatures", require("./routes/signatureRoutes"));
app.use("/api/finalize", require("./routes/finalizeRoutes"));
app.use("/api", require("./routes/shareRoutes"));
app.use("/api/audit", require("./routes/auditRoutes"));
app.use("/api/docs", require("./routes/statusRoutes"));

// ── Global error handler ─────────────────────────────────
app.use((err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large. Max 10MB." });
  }
  if (err.message === "Only PDF files are allowed") {
    return res.status(400).json({ message: err.message });
  }
  if (err.message?.startsWith("CORS blocked")) {
    return res.status(403).json({ message: err.message });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// ── Start ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const connectDB = require("./config/db");

// const app = express();

// // Connect Database
// connectDB();

// // Middleware
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL,
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   }),
// );
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Health check
// app.get("/", (req, res) => {
//   res.json({ message: "✅ DocSign API is running" });
// });

// // Routes (we'll add these Day 2 onwards)
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/docs", require("./routes/docRoutes"));
// app.use("/api/signatures", require("./routes/signatureRoutes"));
// app.use("/api/finalize", require("./routes/finalizeRoutes"));
// app.use("/api", require("./routes/shareRoutes"));
// app.use("/api/audit", require("./routes/auditRoutes"));
// app.use("/api/docs", require("./routes/statusRoutes"));
// // Multer error handler — add AFTER all routes, BEFORE generic error handler
// app.use((err, req, res, next) => {
//   if (err.code === "LIMIT_FILE_SIZE") {
//     return res
//       .status(400)
//       .json({ message: "File too large. Max size is 10MB." });
//   }
//   if (err.message === "Only PDF files are allowed") {
//     return res.status(400).json({ message: err.message });
//   }
//   console.error("Unhandled error:", err);
//   res.status(500).json({ message: "Internal server error" });
// });

// app.use((err, req, res, next) => {
//   if (err.name === "CastError") {
//     return res.status(400).json({ message: "Invalid ID format" });
//   }
//   if (err.code === "LIMIT_FILE_SIZE") {
//     return res
//       .status(400)
//       .json({ message: "File too large. Max size is 10MB." });
//   }
//   if (err.message === "Only PDF files are allowed") {
//     return res.status(400).json({ message: err.message });
//   }
//   console.error("Unhandled error:", err);
//   res.status(500).json({ message: "Internal server error" });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });
