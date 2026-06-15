import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { rejectDocument, reopenDocument } from "../../api/status";
import RejectModal from "./RejectModal";

export default function StatusPanel({ doc, onDocUpdated }) {
  const navigate = useNavigate();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [error, setError] = useState("");

  if (!doc) return null;

  const { status } = doc;

  // ── Reject ────────────────────────────────────────────────
  const handleReject = async (reason) => {
    setRejecting(true);
    setError("");
    try {
      const { data } = await rejectDocument(doc._id, { reason });
      onDocUpdated(data.document);
      setRejectOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject document");
    } finally {
      setRejecting(false);
    }
  };

  // ── Reopen ────────────────────────────────────────────────
  const handleReopen = async () => {
    if (
      !window.confirm(
        "Reopen this document? All signature fields will be reset to pending.",
      )
    )
      return;
    setReopening(true);
    setError("");
    try {
      const { data } = await reopenDocument(doc._id);
      onDocUpdated(data.document);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reopen document");
    } finally {
      setReopening(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
      {error && (
        <p style={{ fontSize: "0.78rem", color: "var(--seal)", margin: 0 }}>
          ⚠ {error}
        </p>
      )}

      {/* ── PENDING status ──────────────────────────────── */}
      {status === "pending" && (
        <>
          <div
            style={{
              padding: "0.8rem",
              background: "#FEF3C7",
              border: "1px solid #FDE68A",
              borderRadius: "6px",
              fontSize: "0.8rem",
              color: "#92400E",
              lineHeight: 1.5,
            }}
          >
            <strong>Awaiting signatures.</strong> Place fields, share the link,
            or reject this document.
          </div>

          <button
            onClick={() => setRejectOpen(true)}
            style={{
              width: "100%",
              padding: "0.65rem",
              background: "transparent",
              border: "1.5px solid #FECACA",
              borderRadius: "4px",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#991B1B",
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FEE2E2";
              e.currentTarget.style.borderColor = "#991B1B";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "#FECACA";
            }}
          >
            ✕ Reject Document
          </button>
        </>
      )}

      {/* ── SIGNED status ───────────────────────────────── */}
      {status === "signed" && (
        <div
          style={{
            padding: "0.8rem",
            background: "#D1FAE5",
            border: "1px solid #6EE7B7",
            borderRadius: "6px",
            fontSize: "0.82rem",
            color: "#065F46",
            lineHeight: 1.5,
          }}
        >
          ✅ <strong>All fields signed.</strong> Finalize and download the
          sealed PDF above.
        </div>
      )}

      {/* ── REJECTED status ─────────────────────────────── */}
      {status === "rejected" && (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
        >
          {/* Rejection banner */}
          <div
            style={{
              padding: "0.9rem",
              background: "#FEE2E2",
              border: "1px solid #FECACA",
              borderRadius: "6px",
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#991B1B",
                margin: "0 0 4px",
              }}
            >
              ✕ Document Rejected
            </p>
            {doc.rejectedBy && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#B91C1C",
                  margin: "0 0 4px",
                }}
              >
                By: {doc.rejectedBy}
                {doc.rejectedByType && (
                  <span
                    style={{
                      marginLeft: "0.4rem",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      background: "#FECACA",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "2px",
                    }}
                  >
                    {doc.rejectedByType}
                  </span>
                )}
              </p>
            )}
            {doc.rejectedAt && (
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#B91C1C",
                  margin: "0 0 6px",
                }}
              >
                {new Date(doc.rejectedAt).toLocaleString("en-IN")}
              </p>
            )}
            {doc.rejectionReason && (
              <div
                style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem 0.7rem",
                  background: "#fff",
                  border: "1px solid #FECACA",
                  borderRadius: "4px",
                  fontSize: "0.78rem",
                  color: "#7F1D1D",
                  fontStyle: "italic",
                  lineHeight: 1.5,
                }}
              >
                "{doc.rejectionReason}"
              </div>
            )}
          </div>

          {/* Reopen button */}
          <button
            onClick={handleReopen}
            disabled={reopening}
            style={{
              width: "100%",
              padding: "0.7rem",
              background: reopening ? "var(--muted)" : "var(--ink)",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: reopening ? "not-allowed" : "pointer",
              fontFamily: "DM Sans, sans-serif",
              transition: "background 0.2s",
            }}
          >
            {reopening ? "Reopening..." : "↺ Reopen Document"}
          </button>

          <p
            style={{
              fontSize: "0.72rem",
              color: "var(--muted)",
              margin: 0,
              lineHeight: 1.4,
              textAlign: "center",
            }}
          >
            Reopening resets all fields to pending so you can share again.
          </p>
        </div>
      )}

      {/* Reject modal */}
      {rejectOpen && (
        <RejectModal
          title="Reject Document"
          subtitle="The signer will be notified and the signing link will be invalidated."
          confirmLabel="Reject Document"
          onConfirm={handleReject}
          onCancel={() => setRejectOpen(false)}
          loading={rejecting}
        />
      )}
    </div>
  );
}
