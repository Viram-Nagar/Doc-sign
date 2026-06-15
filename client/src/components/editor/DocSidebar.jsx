import { useNavigate } from "react-router-dom";
import AddSignaturePanel from "./AddSignaturePanel";
import FinalizePanel from "./FinalizePanel";
import SharePanel from "./SharePanel";
import StatusPanel from "./StatusPanel";

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.2rem",
        padding: "0.8rem 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "0.875rem",
          color: "var(--ink)",
          fontWeight: 500,
          wordBreak: "break-all",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "#B45309",
    bg: "#FEF3C7",
    border: "#FDE68A",
  },
  signed: {
    label: "Signed",
    color: "#065F46",
    bg: "#D1FAE5",
    border: "#6EE7B7",
  },
  rejected: {
    label: "Rejected",
    color: "#991B1B",
    bg: "#FEE2E2",
    border: "#FECACA",
  },
};

export default function DocSidebar({
  doc,
  totalPages,
  currentPage,
  onSignatureAdded,
  onDocUpdated,
}) {
  const navigate = useNavigate();
  const s = STATUS_CONFIG[doc?.status] || STATUS_CONFIG.pending;

  return (
    <div
      style={{
        width: "280px",
        flexShrink: 0,
        background: "#fff",
        borderLeft: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1rem 1.2rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "0.82rem",
            color: "var(--muted)",
            padding: 0,
            fontFamily: "DM Sans, sans-serif",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            marginBottom: "0.8rem",
          }}
        >
          ← Back to Dashboard
        </button>
        <h2
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--ink)",
            wordBreak: "break-word",
            lineHeight: 1.3,
          }}
        >
          {doc?.originalName || "Loading..."}
        </h2>
      </div>

      {/* Body — scrollable */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 1.2rem" }}>
        {/* Status badge */}
        <div
          style={{ padding: "1rem 0", borderBottom: "1px solid var(--border)" }}
        >
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--muted)",
              display: "block",
              marginBottom: "0.4rem",
            }}
          >
            Status
          </span>
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: s.color,
              background: s.bg,
              border: `1px solid ${s.border}`,
              padding: "0.25rem 0.7rem",
              borderRadius: "2px",
            }}
          >
            {s.label}
          </span>
        </div>

        <InfoRow label="File Size" value={formatSize(doc?.fileSize)} />
        <InfoRow label="Uploaded" value={formatDate(doc?.createdAt)} />
        <InfoRow
          label="Signer Email"
          value={doc?.signerEmail || "Not assigned"}
        />
        <InfoRow
          label="Pages"
          value={totalPages ? `${currentPage} of ${totalPages}` : "—"}
        />
        {doc?.finalizedAt && (
          <InfoRow label="Sealed On" value={formatDate(doc.finalizedAt)} />
        )}
      </div>

      <div>
        <p
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--muted)",
            marginBottom: "0.5rem",
            marginTop: "0.2rem",
          }}
        >
          Document Actions
        </p>
        <StatusPanel doc={doc} onDocUpdated={onDocUpdated} />
      </div>

      {/* Divider */}
      {doc?.status === "pending" && (
        <div
          style={{ borderTop: "1px solid var(--border)", paddingTop: "0.8rem" }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "var(--muted)",
              marginBottom: "0.5rem",
            }}
          >
            Signature Fields
          </p>
          <AddSignaturePanel
            documentId={doc._id}
            currentPage={currentPage}
            onSignatureAdded={onSignatureAdded}
          />
        </div>
      )}

      {/* Footer — actions */}
      <div
        style={{
          padding: "1.2rem",
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          overflowY: "auto",
          maxHeight: "340px",
        }}
      >
        {/* Placement panel — only for pending docs */}
        {doc?.status === "pending" && (
          <AddSignaturePanel
            documentId={doc._id}
            currentPage={currentPage}
            onSignatureAdded={onSignatureAdded}
          />
        )}
        {/* Finalize panel — for signed docs */}
        {doc?.status === "signed" && (
          <FinalizePanel doc={doc} onFinalized={onDocUpdated} />
        )}
        {/* Rejected state */}
        {doc?.status === "rejected" && (
          <div
            style={{
              padding: "0.8rem",
              background: "#FEE2E2",
              border: "1px solid #FECACA",
              borderRadius: "4px",
              fontSize: "0.82rem",
              color: "#991B1B",
              textAlign: "center",
            }}
          >
            This document was rejected.
          </div>
        )}
        {/* Share link placeholder */}
        {doc?.status === "pending" && (
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "1rem",
            }}
          >
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--muted)",
                marginBottom: "0.6rem",
              }}
            >
              Share for Signing
            </p>
            <SharePanel doc={doc} />
          </div>
        )}
        // Add useNavigate is already imported // Add this at the bottom of the
        footer div, below the share section:
        <button
          onClick={() => navigate(`/audit/${doc?._id}`)}
          disabled={!doc?._id}
          style={{
            width: "100%",
            padding: "0.6rem",
            background: "transparent",
            color: "var(--muted)",
            border: "1.5px solid var(--border)",
            borderRadius: "4px",
            fontSize: "0.82rem",
            fontWeight: 600,
            fontFamily: "DM Sans, sans-serif",
            cursor: "pointer",
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--ink)";
            e.currentTarget.style.color = "var(--ink)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--muted)";
          }}
        >
          📋 View Audit Trail
        </button>
      </div>
    </div>
  );
}

// import { useNavigate } from "react-router-dom";
// import AddSignaturePanel from "./AddSignaturePanel";
// import { useState } from "react";

// const STATUS_CONFIG = {
//   pending: {
//     label: "Pending",
//     color: "#B45309",
//     bg: "#FEF3C7",
//     border: "#FDE68A",
//   },
//   signed: {
//     label: "Signed",
//     color: "#065F46",
//     bg: "#D1FAE5",
//     border: "#6EE7B7",
//   },
//   rejected: {
//     label: "Rejected",
//     color: "#991B1B",
//     bg: "#FEE2E2",
//     border: "#FECACA",
//   },
// };

// function formatSize(bytes) {
//   if (!bytes) return "—";
//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// }

// function formatDate(dateStr) {
//   if (!dateStr) return "—";
//   return new Date(dateStr).toLocaleDateString("en-IN", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// function InfoRow({ label, value }) {
//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         gap: "0.2rem",
//         padding: "0.8rem 0",
//         borderBottom: "1px solid var(--border)",
//       }}
//     >
//       <span
//         style={{
//           fontSize: "0.7rem",
//           fontWeight: 700,
//           letterSpacing: "0.08em",
//           textTransform: "uppercase",
//           color: "var(--muted)",
//         }}
//       >
//         {label}
//       </span>
//       <span
//         style={{
//           fontSize: "0.875rem",
//           color: "var(--ink)",
//           fontWeight: 500,
//           wordBreak: "break-all",
//         }}
//       >
//         {value}
//       </span>
//     </div>
//   );
// }

// // Update function signature
// export default function DocSidebar({
//   doc,
//   totalPages,
//   currentPage,
//   onSignatureAdded,
// }) {
//   const navigate = useNavigate();
//   const s = STATUS_CONFIG[doc?.status] || STATUS_CONFIG.pending;

//   return (
//     <div
//       style={{
//         width: "280px",
//         flexShrink: 0,
//         background: "#fff",
//         borderLeft: "1px solid var(--border)",
//         display: "flex",
//         flexDirection: "column",
//         overflow: "hidden",
//       }}
//     >
//       {/* Sidebar Header */}
//       <div
//         style={{
//           padding: "1rem 1.2rem",
//           borderBottom: "1px solid var(--border)",
//           background: "var(--surface)",
//         }}
//       >
//         <button
//           onClick={() => navigate("/dashboard")}
//           style={{
//             background: "none",
//             border: "none",
//             cursor: "pointer",
//             fontSize: "0.82rem",
//             color: "var(--muted)",
//             padding: 0,
//             fontFamily: "DM Sans, sans-serif",
//             display: "flex",
//             alignItems: "center",
//             gap: "0.3rem",
//             marginBottom: "0.8rem",
//           }}
//         >
//           ← Back to Dashboard
//         </button>
//         <h2
//           style={{
//             fontFamily: "Fraunces, serif",
//             fontSize: "1rem",
//             fontWeight: 700,
//             color: "var(--ink)",
//             wordBreak: "break-word",
//             lineHeight: 1.3,
//           }}
//         >
//           {doc?.originalName || "Loading..."}
//         </h2>
//       </div>

//       {/* Sidebar Body */}
//       <div style={{ flex: 1, overflowY: "auto", padding: "0 1.2rem" }}>
//         {/* Status */}
//         <div
//           style={{ padding: "1rem 0", borderBottom: "1px solid var(--border)" }}
//         >
//           <span
//             style={{
//               fontSize: "0.7rem",
//               fontWeight: 700,
//               letterSpacing: "0.08em",
//               textTransform: "uppercase",
//               color: "var(--muted)",
//               display: "block",
//               marginBottom: "0.4rem",
//             }}
//           >
//             Status
//           </span>
//           <span
//             style={{
//               fontSize: "0.78rem",
//               fontWeight: 700,
//               letterSpacing: "0.06em",
//               textTransform: "uppercase",
//               color: s.color,
//               background: s.bg,
//               border: `1px solid ${s.border}`,
//               padding: "0.25rem 0.7rem",
//               borderRadius: "2px",
//             }}
//           >
//             {s.label}
//           </span>
//         </div>

//         <InfoRow label="File Size" value={formatSize(doc?.fileSize)} />
//         <InfoRow label="Uploaded" value={formatDate(doc?.createdAt)} />
//         <InfoRow
//           label="Signer Email"
//           value={doc?.signerEmail || "Not assigned"}
//         />
//         <InfoRow
//           label="Pages"
//           value={totalPages ? `${currentPage} of ${totalPages}` : "—"}
//         />
//       </div>

//       {/* Sidebar Footer — Actions (Day 6+ will fill these) */}
//       <div
//         style={{
//           padding: "1.2rem",
//           borderTop: "1px solid var(--border)",
//           display: "flex",
//           flexDirection: "column",
//           gap: "1rem",
//         }}
//       >
//         {/* Only show placement panel if doc is still pending */}
//         {doc?.status === "pending" ? (
//           <AddSignaturePanel
//             documentId={doc._id}
//             currentPage={currentPage}
//             onSignatureAdded={onSignatureAdded}
//           />
//         ) : (
//           <div
//             style={{
//               padding: "0.8rem",
//               background: "var(--cream)",
//               border: "1px solid var(--border)",
//               borderRadius: "4px",
//               fontSize: "0.82rem",
//               color: "var(--muted)",
//               textAlign: "center",
//             }}
//           >
//             Document is <strong>{doc?.status}</strong> — no new fields can be
//             added.
//           </div>
//         )}

//         <button
//           disabled
//           style={{
//             width: "100%",
//             padding: "0.7rem",
//             background: "transparent",
//             color: "var(--muted)",
//             border: "1.5px solid var(--border)",
//             borderRadius: "4px",
//             fontSize: "0.875rem",
//             fontWeight: 600,
//             fontFamily: "DM Sans, sans-serif",
//             cursor: "not-allowed",
//             opacity: 0.6,
//           }}
//         >
//           🔗 Share Link — Day 9
//         </button>
//       </div>
//     </div>
//   );
// }
