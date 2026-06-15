import { useState } from "react";
import { saveSignature } from "../../api/signatures";

export default function AddSignaturePanel({
  documentId,
  currentPage,
  onSignatureAdded,
}) {
  const [signerEmail, setSignerEmail] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const handlePlace = async () => {
    setError("");
    setPlacing(true);
    try {
      // Default position: centre of page
      const { data } = await saveSignature({
        documentId,
        x: 35,
        y: 70,
        width: 30,
        height: 8,
        page: currentPage,
        signerEmail: signerEmail.trim() || null,
      });
      onSignatureAdded(data.signature);
      setSignerEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to place signature field",
      );
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
      {/* Signer email (optional) */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--muted)",
            marginBottom: "0.35rem",
          }}
        >
          Signer Email (optional)
        </label>
        <input
          type="email"
          value={signerEmail}
          onChange={(e) => setSignerEmail(e.target.value)}
          placeholder="signer@company.com"
          style={{
            width: "100%",
            padding: "0.55rem 0.75rem",
            border: "1.5px solid var(--border)",
            borderRadius: "4px",
            fontSize: "0.82rem",
            fontFamily: "DM Sans, sans-serif",
            background: "var(--surface)",
            color: "var(--ink)",
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>

      {error && (
        <p style={{ fontSize: "0.78rem", color: "var(--seal)" }}>⚠ {error}</p>
      )}

      {/* Current page indicator */}
      <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
        Field will be placed on <strong>page {currentPage}</strong>. Drag to
        reposition after placing.
      </p>

      {/* Place button */}
      <button
        onClick={handlePlace}
        disabled={placing}
        style={{
          width: "100%",
          padding: "0.7rem",
          background: placing ? "var(--muted)" : "var(--ink)",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          fontSize: "0.875rem",
          fontWeight: 600,
          fontFamily: "DM Sans, sans-serif",
          cursor: placing ? "not-allowed" : "pointer",
          transition: "background 0.2s",
        }}
      >
        {placing ? "Placing..." : "✍ Place Signature Field"}
      </button>
    </div>
  );
}
