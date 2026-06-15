export default function FormField({ label, error, children }) {
  return (
    <div style={{ marginBottom: "1.2rem" }}>
      <label
        style={{
          display: "block",
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "var(--ink)",
          marginBottom: "0.4rem",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--seal)",
            marginTop: "0.3rem",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ error, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "0.65rem 0.9rem",
        border: `1.5px solid ${error ? "var(--seal)" : "var(--border)"}`,
        borderRadius: "4px",
        fontSize: "0.95rem",
        fontFamily: "DM Sans, sans-serif",
        background: "var(--surface)",
        color: "var(--ink)",
        outline: "none",
        transition: "border-color 0.2s",
        boxSizing: "border-box",
      }}
      onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
      onBlur={(e) =>
        (e.target.style.borderColor = error ? "var(--seal)" : "var(--border)")
      }
    />
  );
}
