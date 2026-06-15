import { useNavigate } from "react-router-dom";

const EMPTY_CONFIG = {
  all: {
    icon: "📭",
    title: "No documents yet",
    desc: "Upload your first PDF above to start managing signatures.",
    action: null,
  },
  pending: {
    icon: "⏳",
    title: "No pending documents",
    desc: "All your documents have been actioned. Upload a new one to get started.",
    action: null,
  },
  signed: {
    icon: "✅",
    title: "No signed documents yet",
    desc: "Documents will appear here once all signature fields have been completed.",
    action: null,
  },
  rejected: {
    icon: "✕",
    title: "No rejected documents",
    desc: "Rejected documents will appear here. You can reopen them from the editor.",
    action: null,
  },
};

export default function EmptyState({ filter, onUploadClick }) {
  const cfg = EMPTY_CONFIG[filter] || EMPTY_CONFIG.all;

  return (
    <div
      style={{
        gridColumn: "1 / -1",
        padding: "4rem 2rem",
        border: "1.5px dashed var(--border)",
        borderRadius: "8px",
        background: "#fff",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.8rem",
      }}
    >
      <div
        style={{
          fontSize: "3rem",
          lineHeight: 1,
          marginBottom: "0.4rem",
          opacity: 0.7,
        }}
      >
        {cfg.icon}
      </div>

      <h3
        style={{
          fontFamily: "Fraunces, serif",
          fontSize: "1.2rem",
          fontWeight: 700,
          color: "var(--ink)",
          margin: 0,
        }}
      >
        {cfg.title}
      </h3>

      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--muted)",
          maxWidth: "380px",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {cfg.desc}
      </p>

      {filter === "all" && (
        <button
          onClick={onUploadClick}
          style={{
            marginTop: "0.5rem",
            padding: "0.65rem 1.8rem",
            background: "var(--ink)",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          ⬆ Upload First Document
        </button>
      )}
    </div>
  );
}
