import { useState } from "react";
import { generateShareLink } from "../../api/share";

export default function SharePanel({ doc }) {
  const [signerEmail, setSignerEmail] = useState(doc?.signerEmail || "");
  const [signerName, setSignerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!signerEmail.trim()) {
      setError("Signer email is required");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data } = await generateShareLink(doc._id, {
        signerEmail: signerEmail.trim(),
        signerName: signerName.trim() || signerEmail.trim(),
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.signingUrl) return;
    navigator.clipboard.writeText(result.signingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (doc?.status === "signed") {
    return (
      <div
        style={{
          padding: "0.9rem",
          background: "#D1FAE5",
          border: "1px solid #6EE7B7",
          borderRadius: "6px",
          fontSize: "0.82rem",
          color: "#065F46",
          textAlign: "center",
          fontWeight: 500,
        }}
      >
        ✅ Document is fully signed — no sharing needed.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
      <p
        style={{
          fontSize: "0.78rem",
          color: "var(--muted)",
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        Generate a secure link and email it to your signer. The link expires in{" "}
        <strong>7 days</strong>.
      </p>

      {/* Signer email */}
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
          Signer Email *
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

      {/* Signer name */}
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
          Signer Name (optional)
        </label>
        <input
          type="text"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          placeholder="Alice Johnson"
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
        <p style={{ fontSize: "0.78rem", color: "var(--seal)", margin: 0 }}>
          ⚠ {error}
        </p>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          width: "100%",
          padding: "0.7rem",
          background: loading ? "var(--muted)" : "var(--ink)",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          fontSize: "0.875rem",
          fontWeight: 600,
          fontFamily: "DM Sans, sans-serif",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s",
        }}
      >
        {loading ? "Generating..." : "🔗 Generate & Send Link"}
      </button>

      {/* Result */}
      {result && (
        <div
          style={{
            background: "var(--cream)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "0.9rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
          }}
        >
          <p
            style={{
              fontSize: "0.78rem",
              color: "#065F46",
              fontWeight: 600,
              margin: 0,
            }}
          >
            ✅ Email sent to {signerEmail}
          </p>

          {/* URL display */}
          <div
            style={{
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "0.5rem 0.7rem",
              fontSize: "0.72rem",
              color: "var(--muted)",
              wordBreak: "break-all",
              lineHeight: 1.4,
            }}
          >
            {result.signingUrl}
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            style={{
              padding: "0.5rem",
              background: copied ? "#D1FAE5" : "var(--surface)",
              color: copied ? "#065F46" : "var(--ink)",
              border: "1.5px solid var(--border)",
              borderRadius: "4px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
              transition: "all 0.2s",
            }}
          >
            {copied ? "✅ Copied!" : "📋 Copy Link"}
          </button>

          <p
            style={{
              fontSize: "0.72rem",
              color: "var(--muted)",
              margin: 0,
            }}
          >
            Expires:{" "}
            {new Date(result.expiresAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
