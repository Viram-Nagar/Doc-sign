const FILTERS = [
  { value: "all", label: "All", dot: null },
  { value: "pending", label: "Pending", dot: "#F59E0B" },
  { value: "signed", label: "Signed", dot: "#10B981" },
  { value: "rejected", label: "Rejected", dot: "#EF4444" },
];

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "size", label: "Largest first" },
];

export default function FilterBar({
  filter,
  setFilter,
  sort,
  setSort,
  counts,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
      }}
    >
      {/* Filter pills */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "99px",
                border: "1.5px solid",
                borderColor: active ? "var(--ink)" : "var(--border)",
                background: active ? "var(--ink)" : "transparent",
                color: active ? "#fff" : "var(--muted)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {f.dot && (
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: active ? "#fff" : f.dot,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
              )}
              {f.label}
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  background: active ? "rgba(255,255,255,0.2)" : "var(--cream)",
                  color: active ? "#fff" : "var(--muted)",
                  padding: "0.05rem 0.4rem",
                  borderRadius: "99px",
                  minWidth: "18px",
                  textAlign: "center",
                }}
              >
                {counts[f.value]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort select */}
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        style={{
          padding: "0.42rem 0.8rem",
          border: "1.5px solid var(--border)",
          borderRadius: "4px",
          fontSize: "0.8rem",
          fontFamily: "DM Sans, sans-serif",
          color: "var(--muted)",
          background: "#fff",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
