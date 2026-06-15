import { Link } from "react-router-dom";

export default function AuthLayout({
  children,
  title,
  subtitle,
  switchText,
  switchLink,
  switchLabel,
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--paper)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      {/* Background texture lines */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 28px, var(--border) 28px, var(--border) 29px)",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "440px",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <span
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "var(--ink)",
              }}
            >
              Doc<span style={{ color: "var(--seal)" }}>Sign</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "2.5rem",
            boxShadow: "6px 6px 0 var(--cream)",
          }}
        >
          <h2
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "var(--ink)",
              marginBottom: "0.4rem",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--muted)",
              marginBottom: "2rem",
            }}
          >
            {subtitle}
          </p>

          {children}
        </div>

        {/* Switch link */}
        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontSize: "0.875rem",
            color: "var(--muted)",
          }}
        >
          {switchText}{" "}
          <Link
            to={switchLink}
            style={{
              color: "var(--seal)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {switchLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
