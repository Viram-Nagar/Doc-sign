import { useState } from "react";

export default function RejectModal({
  title = "Reject Document",
  subtitle = "Please provide a reason for rejection.",
  confirmLabel = "Reject Document",
  onConfirm,
  onCancel,
  loading,
}) {
  const [reason, setReason] = useState("");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,13,13,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "8px 8px 0 #FEE2E2",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.2rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            background: "#FEF2F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#991B1B",
                margin: "0 0 2px",
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#B91C1C",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
              color: "#B91C1C",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "var(--muted)",
              marginBottom: "0.5rem",
            }}
          >
            Reason for Rejection (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Incorrect terms, wrong parties listed, needs revision..."
            rows={4}
            style={{
              width: "100%",
              padding: "0.7rem 0.9rem",
              border: "1.5px solid var(--border)",
              borderRadius: "4px",
              fontSize: "0.875rem",
              fontFamily: "DM Sans, sans-serif",
              color: "var(--ink)",
              background: "var(--surface)",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              lineHeight: 1.5,
            }}
            onFocus={(e) => (e.target.style.borderColor = "#991B1B")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />

          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1rem",
              background: "#FEF3C7",
              border: "1px solid #FDE68A",
              borderRadius: "4px",
              fontSize: "0.8rem",
              color: "#92400E",
              lineHeight: 1.5,
            }}
          >
            ⚠️ This action will mark the document as <strong>Rejected</strong>{" "}
            and notify the other party. Any unsigned fields will be cancelled.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: "0.8rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "0.65rem 1.4rem",
              background: "transparent",
              border: "1.5px solid var(--border)",
              borderRadius: "4px",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--muted)",
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={loading}
            style={{
              padding: "0.65rem 1.8rem",
              background: loading ? "var(--muted)" : "#991B1B",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "DM Sans, sans-serif",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Rejecting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
