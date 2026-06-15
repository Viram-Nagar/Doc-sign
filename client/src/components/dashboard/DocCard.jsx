import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { deleteDocument } from "../../api/docs";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "#B45309",
    bg: "#FEF3C7",
    border: "#FDE68A",
    dot: "#F59E0B",
  },
  signed: {
    label: "Signed",
    color: "#065F46",
    bg: "#D1FAE5",
    border: "#6EE7B7",
    dot: "#10B981",
  },
  rejected: {
    label: "Rejected",
    color: "#991B1B",
    bg: "#FEE2E2",
    border: "#FECACA",
    dot: "#EF4444",
  },
};

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function truncate(str, max = 32) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export default function DocCard({ doc, onDelete }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const s = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteDocument(doc._id);
      onDelete(doc._id);
    } catch {
      alert("Failed to delete. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/editor/${doc._id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `1px solid ${hovered ? s.border : "var(--border)"}`,
        borderRadius: "8px",
        padding: "0",
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
        boxShadow: hovered ? `4px 4px 0 ${s.border}` : "none",
        transform: hovered ? "translate(-2px,-2px)" : "none",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Card top colour band */}
      <div
        style={{
          height: "4px",
          background: s.dot,
          transition: "opacity 0.2s",
          opacity: hovered ? 1 : 0.6,
        }}
      />

      {/* Card body */}
      <div
        style={{
          padding: "1.2rem",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.9rem",
        }}
      >
        {/* Icon + name row */}
        <div
          style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem" }}
        >
          {/* PDF thumbnail */}
          <div
            style={{
              width: "40px",
              height: "48px",
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              flexShrink: 0,
              transition: "transform 0.2s",
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
          >
            📄
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontWeight: 700,
                fontSize: "0.88rem",
                color: "var(--ink)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginBottom: "0.25rem",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {truncate(doc.originalName, 28)}
            </p>
            <p
              style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0 }}
            >
              {formatSize(doc.fileSize)} · {formatDate(doc.createdAt)}
            </p>
          </div>
        </div>

        {/* Status + signer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: s.dot,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: s.color,
              }}
            >
              {s.label}
            </span>
          </div>
          {doc.signerEmail && (
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--muted)",
                background: "var(--cream)",
                border: "1px solid var(--border)",
                padding: "0.15rem 0.45rem",
                borderRadius: "99px",
                maxWidth: "130px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {doc.signerEmail}
            </span>
          )}
        </div>

        {/* Rejection reason snippet */}
        {doc.status === "rejected" && doc.rejectionReason && (
          <div
            style={{
              fontSize: "0.72rem",
              color: "#B91C1C",
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "4px",
              padding: "0.4rem 0.6rem",
              lineHeight: 1.4,
              fontStyle: "italic",
            }}
          >
            "{truncate(doc.rejectionReason, 70)}"
          </div>
        )}

        {/* Finalized badge */}
        {doc.signedPdfPath && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "#065F46",
            }}
          >
            <span>🔏</span> Sealed PDF ready
          </div>
        )}
      </div>

      {/* Card footer */}
      <div
        style={{
          padding: "0.7rem 1.2rem",
          borderTop: "1px solid var(--border)",
          background: hovered ? "var(--cream)" : "var(--surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "background 0.2s",
        }}
      >
        <div style={{ display: "flex", gap: "0.8rem" }}>
          <span
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/editor/${doc._id}`);
            }}
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--muted)",
              cursor: "pointer",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            ✍ Open
          </span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/audit/${doc._id}`);
            }}
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--muted)",
              cursor: "pointer",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            📋 Audit
          </span>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            background: "none",
            border: "none",
            cursor: deleting ? "not-allowed" : "pointer",
            fontSize: "0.75rem",
            color: "var(--muted)",
            padding: "0.2rem 0.4rem",
            borderRadius: "3px",
            transition: "color 0.15s",
            fontFamily: "DM Sans, sans-serif",
          }}
          onMouseEnter={(e) => (e.target.style.color = "var(--seal)")}
          onMouseLeave={(e) => (e.target.style.color = "var(--muted)")}
          title="Delete document"
        >
          {deleting ? "…" : "🗑"}
        </button>
      </div>
    </div>
  );
}

// import { useNavigate } from "react-router-dom";
// import { deleteDocument } from "../../api/docs";
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
//   if (bytes < 1024) return `${bytes} B`;
//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// }

// function formatDate(dateStr) {
//   return new Date(dateStr).toLocaleDateString("en-IN", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//   });
// }

// export default function DocCard({ doc, onDelete }) {
//   const navigate = useNavigate();
//   const [deleting, setDeleting] = useState(false);
//   const s = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;

//   const handleDelete = async (e) => {
//     e.stopPropagation();
//     if (!window.confirm("Delete this document? This cannot be undone.")) return;
//     setDeleting(true);
//     try {
//       await deleteDocument(doc._id);
//       onDelete(doc._id);
//     } catch {
//       alert("Failed to delete. Try again.");
//     } finally {
//       setDeleting(false);
//     }
//   };

//   return (
//     <div
//       onClick={() => navigate(`/editor/${doc._id}`)}
//       style={{
//         background: "#fff",
//         border: "1px solid var(--border)",
//         borderRadius: "6px",
//         padding: "1.4rem",
//         cursor: "pointer",
//         transition: "box-shadow 0.2s, transform 0.2s",
//         display: "flex",
//         flexDirection: "column",
//         gap: "0.8rem",
//         position: "relative",
//       }}
//       onMouseEnter={(e) => {
//         e.currentTarget.style.boxShadow = "4px 4px 0 var(--border)";
//         e.currentTarget.style.transform = "translate(-2px,-2px)";
//       }}
//       onMouseLeave={(e) => {
//         e.currentTarget.style.boxShadow = "none";
//         e.currentTarget.style.transform = "none";
//       }}
//     >
//       {/* PDF Icon + Name */}
//       <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem" }}>
//         <div
//           style={{
//             width: "40px",
//             height: "48px",
//             background: "var(--cream)",
//             border: "1px solid var(--border)",
//             borderRadius: "4px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             fontSize: "1.2rem",
//             flexShrink: 0,
//           }}
//         >
//           📄
//         </div>
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <p
//             style={{
//               fontWeight: 600,
//               fontSize: "0.9rem",
//               color: "var(--ink)",
//               whiteSpace: "nowrap",
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//               marginBottom: "0.2rem",
//             }}
//           >
//             {doc.originalName}
//           </p>
//           <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
//             {formatSize(doc.fileSize)} · {formatDate(doc.createdAt)}
//           </p>
//         </div>
//       </div>
//       {/* Status Badge */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <span
//           style={{
//             fontSize: "0.72rem",
//             fontWeight: 700,
//             letterSpacing: "0.06em",
//             textTransform: "uppercase",
//             color: s.color,
//             background: s.bg,
//             border: `1px solid ${s.border}`,
//             padding: "0.25rem 0.6rem",
//             borderRadius: "2px",
//           }}
//         >
//           {s.label}
//         </span>

//         <button
//           onClick={handleDelete}
//           disabled={deleting}
//           style={{
//             background: "none",
//             border: "none",
//             cursor: deleting ? "not-allowed" : "pointer",
//             fontSize: "0.8rem",
//             color: "var(--muted)",
//             padding: "0.2rem 0.4rem",
//             borderRadius: "3px",
//             transition: "color 0.15s",
//           }}
//           onMouseEnter={(e) => (e.target.style.color = "var(--seal)")}
//           onMouseLeave={(e) => (e.target.style.color = "var(--muted)")}
//           title="Delete document"
//         >
//           {deleting ? "..." : "🗑"}
//         </button>
//       </div>
//       // Add this inside the DocCard, below the status badge:
//       {doc.status === "rejected" && doc.rejectionReason && (
//         <div
//           style={{
//             fontSize: "0.72rem",
//             color: "#B91C1C",
//             background: "#FEF2F2",
//             border: "1px solid #FECACA",
//             borderRadius: "3px",
//             padding: "0.3rem 0.5rem",
//             lineHeight: 1.4,
//             fontStyle: "italic",
//           }}
//         >
//           "
//           {doc.rejectionReason.length > 60
//             ? doc.rejectionReason.slice(0, 60) + "..."
//             : doc.rejectionReason}
//           "
//         </div>
//       )}
//       {doc.status === "rejected" && doc.rejectedBy && (
//         <p
//           style={{
//             fontSize: "0.7rem",
//             color: "var(--muted)",
//             margin: 0,
//           }}
//         >
//           Rejected by: {doc.rejectedBy}
//           {doc.rejectedByType && (
//             <span
//               style={{
//                 marginLeft: "0.3rem",
//                 fontSize: "0.65rem",
//                 fontWeight: 700,
//                 textTransform: "uppercase",
//                 letterSpacing: "0.06em",
//                 color: "#991B1B",
//                 background: "#FEE2E2",
//                 padding: "0.1rem 0.35rem",
//                 borderRadius: "2px",
//               }}
//             >
//               {doc.rejectedByType}
//             </span>
//           )}
//         </p>
//       )}
//       <div
//         onClick={(e) => {
//           e.stopPropagation();
//           navigate(`/audit/${doc._id}`);
//         }}
//         style={{
//           fontSize: "0.72rem",
//           color: "var(--muted)",
//           fontWeight: 500,
//           cursor: "pointer",
//           display: "flex",
//           alignItems: "center",
//           gap: "0.25rem",
//           marginTop: "0.2rem",
//           transition: "color 0.15s",
//         }}
//         onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
//         onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
//       >
//         📋 View Audit Trail
//       </div>
//     </div>
//   );
// }
