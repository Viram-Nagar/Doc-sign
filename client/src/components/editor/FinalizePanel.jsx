import { useState } from "react";
import { finalizeDocument, getSignedPdfUrl } from "../../api/finalize";

export default function FinalizePanel({ doc, onFinalized }) {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [signedUrl, setSignedUrl] = useState(
    doc?.signedPdfPath ? "__exists__" : null,
  );

  const isFinalized = !!doc?.signedPdfPath;
  const isSigned = doc?.status === "signed";

  // ── Finalize ─────────────────────────────────────────────
  const handleFinalize = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await finalizeDocument(doc._id);
      setSignedUrl(data.signedPdfUrl);
      if (onFinalized) onFinalized(data.document);
    } catch (err) {
      setError(
        err.response?.data?.message || "Finalization failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Download ──────────────────────────────────────────────
  const handleDownload = async () => {
    setDownloading(true);
    setError("");
    try {
      let url = signedUrl;

      // If we only know it exists, fetch fresh URL
      if (url === "__exists__") {
        const { data } = await getSignedPdfUrl(doc._id);
        url = data.signedPdfUrl;
        setSignedUrl(url);
      }

      // Trigger browser download
      const link = document.createElement("a");
      link.href = url;
      link.download = `signed_${doc.originalName || "document.pdf"}`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError("Failed to get download link. Try again.");
    } finally {
      setDownloading(false);
    }
  };

  // ── Not signed yet ────────────────────────────────────────
  if (!isSigned) {
    return (
      <div
        style={{
          padding: "1rem",
          background: "var(--cream)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          fontSize: "0.82rem",
          color: "var(--muted)",
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "1.4rem", marginBottom: "0.4rem" }}>🔒</div>
        All signature fields must be signed before you can finalize.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
      {/* Status banner */}
      <div
        style={{
          padding: "0.8rem 1rem",
          background: isFinalized ? "#D1FAE5" : "#FEF3C7",
          border: `1px solid ${isFinalized ? "#6EE7B7" : "#FDE68A"}`,
          borderRadius: "6px",
          fontSize: "0.82rem",
          color: isFinalized ? "#065F46" : "#92400E",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontWeight: 500,
        }}
      >
        <span>{isFinalized ? "✅" : "⚠️"}</span>
        {isFinalized
          ? "Signed PDF is ready to download."
          : "All fields signed. Ready to finalize and seal the PDF."}
      </div>

      {error && (
        <p style={{ fontSize: "0.8rem", color: "var(--seal)" }}>⚠ {error}</p>
      )}

      {/* Finalize button — only show if not yet finalized */}
      {!isFinalized && (
        <button
          onClick={handleFinalize}
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: loading ? "var(--muted)" : "var(--seal)",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "0.875rem",
            fontWeight: 600,
            fontFamily: "DM Sans, sans-serif",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
          }}
        >
          {loading ? (
            <>
              <Spinner /> Generating PDF...
            </>
          ) : (
            "🔏 Finalize & Seal PDF"
          )}
        </button>
      )}

      {/* Download button */}
      {(isFinalized || signedUrl) && signedUrl !== "__exists__" && (
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: downloading ? "var(--muted)" : "var(--ink)",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "0.875rem",
            fontWeight: 600,
            fontFamily: "DM Sans, sans-serif",
            cursor: downloading ? "not-allowed" : "pointer",
            transition: "background 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
          }}
        >
          {downloading ? (
            <>
              <Spinner /> Preparing...
            </>
          ) : (
            "⬇ Download Signed PDF"
          )}
        </button>
      )}

      {/* Download button when finalized but URL needs fetching */}
      {isFinalized && signedUrl === "__exists__" && (
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: downloading ? "var(--muted)" : "var(--ink)",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "0.875rem",
            fontWeight: 600,
            fontFamily: "DM Sans, sans-serif",
            cursor: downloading ? "not-allowed" : "pointer",
            transition: "background 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
          }}
        >
          {downloading ? (
            <>
              <Spinner /> Preparing...
            </>
          ) : (
            "⬇ Download Signed PDF"
          )}
        </button>
      )}

      {/* Finalized timestamp */}
      {doc?.finalizedAt && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--muted)",
            textAlign: "center",
          }}
        >
          Sealed on {new Date(doc.finalizedAt).toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: "12px",
        height: "12px",
        border: "2px solid rgba(255,255,255,0.4)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}
