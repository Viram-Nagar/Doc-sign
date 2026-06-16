import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuditLogs } from "../api/audit";
import DashboardNav from "../components/dashboard/DashboardNav";

// ── Action config ─────────────────────────────────────────
const ACTION_CONFIG = {
  document_uploaded: {
    label: "Document Uploaded",
    icon: "⬆",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  document_viewed: {
    label: "Document Viewed",
    icon: "👁",
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#E5E7EB",
  },
  document_deleted: {
    label: "Document Deleted",
    icon: "🗑",
    color: "#991B1B",
    bg: "#FEE2E2",
    border: "#FECACA",
  },
  signature_placed: {
    label: "Signature Field Placed",
    icon: "📍",
    color: "#B45309",
    bg: "#FEF3C7",
    border: "#FDE68A",
  },
  signature_moved: {
    label: "Signature Field Moved",
    icon: "↔",
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#E5E7EB",
  },
  signature_signed: {
    label: "Document Signed",
    icon: "✍",
    color: "#065F46",
    bg: "#D1FAE5",
    border: "#6EE7B7",
  },
  signature_deleted: {
    label: "Signature Field Removed",
    icon: "✕",
    color: "#991B1B",
    bg: "#FEE2E2",
    border: "#FECACA",
  },
  share_link_generated: {
    label: "Share Link Generated",
    icon: "🔗",
    color: "#6D28D9",
    bg: "#EDE9FE",
    border: "#DDD6FE",
  },
  document_opened_via_link: {
    label: "Opened via Share Link",
    icon: "🔓",
    color: "#0369A1",
    bg: "#E0F2FE",
    border: "#BAE6FD",
  },
  document_finalized: {
    label: "Document Finalized & Sealed",
    icon: "🔏",
    color: "#065F46",
    bg: "#D1FAE5",
    border: "#6EE7B7",
  },
  document_downloaded: {
    label: "Signed PDF Downloaded",
    icon: "⬇",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
};

// ── Helpers ───────────────────────────────────────────────
function formatTs(dateStr) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function ActorBadge({ actorType }) {
  const config = {
    owner: { label: "Owner", color: "#1D4ED8", bg: "#EFF6FF" },
    signer: { label: "Signer", color: "#065F46", bg: "#D1FAE5" },
    system: { label: "System", color: "#6B7280", bg: "#F3F4F6" },
  };
  const c = config[actorType] || config.system;
  return (
    <span
      style={{
        fontSize: "0.65rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        color: c.color,
        background: c.bg,
        padding: "0.15rem 0.45rem",
        borderRadius: "2px",
      }}
    >
      {c.label}
    </span>
  );
}

function MetadataBlock({ metadata }) {
  if (!metadata || Object.keys(metadata).length === 0) return null;
  return (
    <div
      style={{
        marginTop: "0.5rem",
        background: "var(--cream)",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        padding: "0.5rem 0.7rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
      }}
    >
      {Object.entries(metadata).map(([key, val]) => {
        if (val === null || val === undefined) return null;
        return (
          <span
            key={key}
            style={{
              fontSize: "0.72rem",
              color: "var(--muted)",
              fontFamily: "monospace",
            }}
          >
            <strong style={{ color: "var(--ink)" }}>{key}:</strong>{" "}
            {typeof val === "object" ? JSON.stringify(val) : String(val)}
          </span>
        );
      })}
    </div>
  );
}

// ── Log Row ───────────────────────────────────────────────
function LogRow({ log, index, total }) {
  const cfg = ACTION_CONFIG[log.action] || {
    label: log.action,
    icon: "•",
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#E5E7EB",
  };
  const isLast = index === total - 1;

  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      {/* Timeline line + icon */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
          width: "36px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: cfg.bg,
            border: `1.5px solid ${cfg.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          {cfg.icon}
        </div>
        {!isLast && (
          <div
            style={{
              width: "2px",
              flex: 1,
              background: "var(--border)",
              marginTop: "4px",
              minHeight: "24px",
            }}
          />
        )}
      </div>

      {/* Log content */}
      <div
        style={{
          flex: 1,
          paddingBottom: isLast ? 0 : "1.4rem",
        }}
      >
        {/* Action label + actor badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "0.3rem",
          }}
        >
          <span
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: cfg.color,
            }}
          >
            {cfg.label}
          </span>
          <ActorBadge actorType={log.actorType} />
        </div>

        {/* Actor email + timestamp */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            alignItems: "center",
            marginBottom: "0.3rem",
          }}
        >
          {log.actorEmail && (
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--muted)",
                fontWeight: 500,
              }}
            >
              {log.actorEmail}
            </span>
          )}
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--border)",
            }}
          >
            ·
          </span>
          <span
            title={formatTs(log.createdAt)}
            style={{
              fontSize: "0.78rem",
              color: "var(--muted)",
              cursor: "help",
            }}
          >
            {formatTs(log.createdAt)}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--border)" }}>·</span>
          <span
            style={{
              fontSize: "0.72rem",
              color: "var(--muted)",
              background: "var(--cream)",
              padding: "0.1rem 0.4rem",
              borderRadius: "2px",
              fontStyle: "italic",
            }}
          >
            {formatRelative(log.createdAt)}
          </span>
        </div>

        {/* IP address */}
        {log.ipAddress && (
          <span
            style={{
              fontSize: "0.72rem",
              color: "var(--muted)",
              fontFamily: "monospace",
              background: "var(--cream)",
              padding: "0.1rem 0.4rem",
              borderRadius: "2px",
              display: "inline-block",
              marginBottom: "0.3rem",
            }}
          >
            IP: {log.ipAddress}
          </span>
        )}

        {/* Metadata */}
        <MetadataBlock metadata={log.metadata} />
      </div>
    </div>
  );
}

// ── Filter bar ────────────────────────────────────────────
const FILTER_OPTIONS = [
  { value: "all", label: "All Events" },
  { value: "owner", label: "Owner Actions" },
  { value: "signer", label: "Signer Actions" },
  { value: "signature", label: "Signatures" },
  { value: "share", label: "Sharing" },
];

// ── Main Page ─────────────────────────────────────────────
export default function Audit() {
  const { docId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [doc, setDoc] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    getAuditLogs(docId)
      .then(({ data }) => {
        setLogs(data.logs);
        setDoc(data.document);
      })
      .catch((err) => {
        if (err.response?.status === 404) setError("Document not found.");
        else setError("Failed to load audit trail.");
      })
      .finally(() => setFetching(false));
  }, [user, docId]);

  // ── Filtering ────────────────────────────────────────────
  const filtered = logs.filter((log) => {
    const matchFilter = (() => {
      if (filter === "all") return true;
      if (filter === "owner") return log.actorType === "owner";
      if (filter === "signer") return log.actorType === "signer";
      if (filter === "signature") return log.action.includes("signature");
      if (filter === "share")
        return log.action.includes("share") || log.action.includes("link");
      return true;
    })();

    const matchSearch =
      search.trim() === ""
        ? true
        : log.action.toLowerCase().includes(search.toLowerCase()) ||
          (log.actorEmail || "").toLowerCase().includes(search.toLowerCase()) ||
          (log.ipAddress || "").includes(search);

    return matchFilter && matchSearch;
  });

  if (authLoading || fetching) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--paper)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid var(--border)",
            borderTopColor: "var(--ink)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Loading audit trail...
        </p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
        <DashboardNav />
        <div
          style={{
            maxWidth: "600px",
            margin: "6rem auto",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h2
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "1.4rem",
              color: "var(--ink)",
              marginBottom: "0.5rem",
            }}
          >
            {error}
          </h2>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              marginTop: "1.5rem",
              padding: "0.7rem 1.8rem",
              background: "var(--ink)",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <DashboardNav />

      <div
        style={{ maxWidth: "860px", margin: "0 auto", padding: "2.5rem 2rem" }}
      >
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <button
              onClick={() => navigate(`/editor/${docId}`)}
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
                marginBottom: "0.6rem",
              }}
            >
              ← Back to Editor
            </button>
            <h1
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "var(--ink)",
                marginBottom: "0.3rem",
              }}
            >
              Audit Trail
            </h1>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--muted)",
                wordBreak: "break-all",
              }}
            >
              {doc?.originalName}
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            {[
              { label: "Total Events", value: logs.length },
              {
                label: "Owner Actions",
                value: logs.filter((l) => l.actorType === "owner").length,
              },
              {
                label: "Signer Actions",
                value: logs.filter((l) => l.actorType === "signer").length,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "0.8rem 1.2rem",
                  textAlign: "center",
                  minWidth: "100px",
                }}
              >
                <div
                  style={{
                    fontFamily: "Fraunces, serif",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                    lineHeight: 1,
                    marginBottom: "0.3rem",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--muted)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter + Search bar */}
        <div
          style={{
            display: "flex",
            gap: "0.8rem",
            marginBottom: "1.8rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, email, IP..."
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "0.55rem 0.9rem",
              border: "1.5px solid var(--border)",
              borderRadius: "4px",
              fontSize: "0.875rem",
              fontFamily: "DM Sans, sans-serif",
              background: "#fff",
              color: "var(--ink)",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />

          {/* Filter pills */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: "0.4rem 0.9rem",
                  borderRadius: "99px",
                  border: "1.5px solid",
                  borderColor:
                    filter === f.value ? "var(--ink)" : "var(--border)",
                  background: filter === f.value ? "var(--ink)" : "transparent",
                  color: filter === f.value ? "#fff" : "var(--muted)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "DM Sans, sans-serif",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "2rem",
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "var(--muted)",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.8rem" }}>
                📋
              </div>
              <p
                style={{
                  fontWeight: 600,
                  color: "var(--ink)",
                  marginBottom: "0.3rem",
                }}
              >
                No events found
              </p>
              <p style={{ fontSize: "0.85rem" }}>
                {search
                  ? "Try a different search term."
                  : "No audit events logged yet."}
              </p>
            </div>
          ) : (
            <div>
              {/* Timeline header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--muted)",
                  }}
                >
                  {filtered.length} event{filtered.length !== 1 ? "s" : ""} ·
                  Most recent first
                </span>
                <button
                  onClick={() => {
                    setFilter("all");
                    setSearch("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    color: "var(--seal)",
                    fontWeight: 600,
                    fontFamily: "DM Sans, sans-serif",
                    display: filter !== "all" || search ? "block" : "none",
                  }}
                >
                  Clear filters
                </button>
              </div>

              {/* Log rows */}
              {filtered.map((log, index) => (
                <LogRow
                  key={log._id}
                  log={log}
                  index={index}
                  total={filtered.length}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
