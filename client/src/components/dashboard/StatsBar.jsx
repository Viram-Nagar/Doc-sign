import { useEffect, useState } from "react";

function AnimatedNumber({ target }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setVal(0);
      return;
    }
    let start = 0;
    const step = Math.ceil(target / 20);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setVal(target);
        clearInterval(interval);
      } else setVal(start);
    }, 30);
    return () => clearInterval(interval);
  }, [target]);

  return <span>{val}</span>;
}

const STATS = [
  {
    key: "total",
    label: "Total Documents",
    icon: "📁",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  {
    key: "pending",
    label: "Pending",
    icon: "⏳",
    color: "#B45309",
    bg: "#FEF3C7",
    border: "#FDE68A",
  },
  {
    key: "signed",
    label: "Signed",
    icon: "✅",
    color: "#065F46",
    bg: "#D1FAE5",
    border: "#6EE7B7",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: "✕",
    color: "#991B1B",
    bg: "#FEE2E2",
    border: "#FECACA",
  },
];

export default function StatsBar({ docs }) {
  const counts = {
    total: docs.length,
    pending: docs.filter((d) => d.status === "pending").length,
    signed: docs.filter((d) => d.status === "signed").length,
    rejected: docs.filter((d) => d.status === "rejected").length,
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}
    >
      {STATS.map((s) => (
        <div
          key={s.key}
          style={{
            background: "#fff",
            border: `1px solid ${s.border}`,
            borderRadius: "6px",
            padding: "1.2rem 1.4rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            transition: "box-shadow 0.2s, transform 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `4px 4px 0 ${s.border}`;
            e.currentTarget.style.transform = "translate(-2px,-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "none";
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: s.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              flexShrink: 0,
            }}
          >
            {s.icon}
          </div>
          <div>
            <div
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: s.color,
                lineHeight: 1,
                marginBottom: "3px",
              }}
            >
              <AnimatedNumber target={counts[s.key]} />
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--muted)",
              }}
            >
              {s.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
