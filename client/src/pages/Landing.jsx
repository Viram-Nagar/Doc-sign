import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const features = [
  {
    icon: "⬆",
    title: "Upload Any PDF",
    desc: "Drag and drop your contracts, agreements, and forms securely.",
  },
  {
    icon: "✍",
    title: "Place Signatures",
    desc: "Drag signature fields precisely anywhere on the document.",
  },
  {
    icon: "🔗",
    title: "Share Signing Links",
    desc: "Generate tokenized links and email signers instantly.",
  },
  {
    icon: "📋",
    title: "Full Audit Trail",
    desc: "Every action logged with timestamps, IP, and signer identity.",
  },
  {
    icon: "🔒",
    title: "Immutable Signed PDFs",
    desc: "Finalized documents are sealed and stored permanently.",
  },
  {
    icon: "⚡",
    title: "Status Tracking",
    desc: "Real-time Pending → Signed → Rejected lifecycle visibility.",
  },
];

const usecases = [
  { label: "Business Contracts", icon: "💼" },
  { label: "HR & Onboarding", icon: "🧑‍💼" },
  { label: "Freelancer Agreements", icon: "🤝" },
  { label: "Legal & Compliance", icon: "⚖️" },
  { label: "Education & Institutions", icon: "🎓" },
];

export default function Landing() {
  const stampRef = useRef(null);

  useEffect(() => {
    const el = stampRef.current;
    if (!el) return;
    let angle = -12;
    const tick = () => {
      angle = -12 + Math.sin(Date.now() / 2000) * 3;
      el.style.transform = `rotate(${angle}deg)`;
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      {/* NAV */}
      <nav
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "0 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            Doc<span style={{ color: "var(--seal)" }}>Sign</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link
            to="/login"
            style={{
              color: "var(--muted)",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            style={{
              background: "var(--ink)",
              color: "#fff",
              padding: "0.5rem 1.2rem",
              borderRadius: "4px",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "5rem 2rem 4rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-block",
              background: "var(--cream)",
              border: "1px solid var(--border)",
              padding: "0.3rem 0.8rem",
              borderRadius: "2px",
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "1.5rem",
              fontWeight: 600,
            }}
          >
            Enterprise-Grade Document Signing
          </div>

          <h1
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "clamp(2.4rem, 5vw, 3.5rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "var(--ink)",
              marginBottom: "1.5rem",
              letterSpacing: "-0.02em",
            }}
          >
            Sign documents
            <br />
            <em style={{ color: "var(--seal)", fontStyle: "italic" }}>
              without the paperwork.
            </em>
          </h1>

          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--muted)",
              lineHeight: 1.7,
              marginBottom: "2.5rem",
              maxWidth: "420px",
            }}
          >
            Upload PDFs, place signatures, share secure signing links, and
            generate legally traceable signed documents — all in one place.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link
              to="/register"
              style={{
                background: "var(--seal)",
                color: "#fff",
                padding: "0.8rem 2rem",
                borderRadius: "4px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                display: "inline-block",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = "var(--seal-dark)")
              }
              onMouseLeave={(e) => (e.target.style.background = "var(--seal)")}
            >
              Start Signing Free
            </Link>
            <Link
              to="/login"
              style={{
                border: "1.5px solid var(--border)",
                color: "var(--ink)",
                padding: "0.8rem 2rem",
                borderRadius: "4px",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: "0.95rem",
                background: "transparent",
              }}
            >
              Sign In →
            </Link>
          </div>
        </div>

        {/* DOCUMENT MOCKUP */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/* Shadow doc behind */}
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "24px",
              width: "300px",
              height: "380px",
              background: "var(--cream)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              boxShadow: "4px 4px 0 var(--border)",
            }}
          />

          {/* Main doc */}
          <div
            style={{
              position: "relative",
              width: "300px",
              height: "380px",
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "2rem",
              boxShadow: "8px 8px 0 #C9C3B5",
            }}
          >
            {/* Doc lines */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: "10px",
                  background: i === 0 ? "var(--ink)" : "var(--cream)",
                  borderRadius: "2px",
                  marginBottom: "12px",
                  width: i === 0 ? "60%" : i % 3 === 0 ? "75%" : "90%",
                }}
              />
            ))}

            {/* Signature line */}
            <div
              style={{
                marginTop: "2rem",
                borderTop: "1px solid var(--border)",
                paddingTop: "0.8rem",
              }}
            >
              <div
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: "1.1rem",
                  fontStyle: "italic",
                  color: "var(--seal)",
                  marginBottom: "4px",
                }}
              >
                Alice Johnson
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--muted)",
                  letterSpacing: "0.05em",
                }}
              >
                SIGNED · JUN 2026
              </div>
            </div>

            {/* Stamp */}
            <div
              ref={stampRef}
              style={{
                position: "absolute",
                bottom: "1.5rem",
                right: "1.5rem",
                width: "72px",
                height: "72px",
                border: "3px solid var(--seal)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--seal)",
                fontSize: "0.55rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textAlign: "center",
                lineHeight: 1.3,
                textTransform: "uppercase",
                opacity: 0.85,
                transformOrigin: "center",
              }}
            >
              SIGNED
              <br />& SEALED
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES TICKER */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          background: "var(--cream)",
          padding: "0.8rem 2rem",
          display: "flex",
          gap: "2.5rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {usecases.map((u) => (
          <span
            key={u.label}
            style={{
              fontSize: "0.85rem",
              color: "var(--muted)",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <span>{u.icon}</span> {u.label}
          </span>
        ))}
      </div>

      {/* FEATURES */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "5rem 2rem",
        }}
      >
        <h2
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: "2rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "0.75rem",
            color: "var(--ink)",
          }}
        >
          Everything you need for digital signing
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "var(--muted)",
            marginBottom: "3.5rem",
            fontSize: "1rem",
          }}
        >
          Built to mirror real enterprise SaaS workflows.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "1.8rem",
                transition: "box-shadow 0.2s, transform 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "4px 4px 0 var(--border)";
                e.currentTarget.style.transform = "translate(-2px,-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ fontSize: "1.6rem", marginBottom: "0.8rem" }}>
                {f.icon}
              </div>
              <h3
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "var(--ink)",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section
        style={{
          background: "var(--ink)",
          padding: "4rem 2rem",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: "2rem",
            color: "#fff",
            marginBottom: "1rem",
            fontWeight: 700,
          }}
        >
          Ready to go paperless?
        </h2>
        <p style={{ color: "#9E9890", marginBottom: "2rem", fontSize: "1rem" }}>
          Create your free account and start signing in minutes.
        </p>
        <Link
          to="/register"
          style={{
            background: "var(--seal)",
            color: "#fff",
            padding: "0.9rem 2.5rem",
            borderRadius: "4px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "1rem",
            display: "inline-block",
          }}
        >
          Create Free Account
        </Link>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "1.5rem 2rem",
          textAlign: "center",
          fontSize: "0.8rem",
          color: "var(--muted)",
          background: "var(--surface)",
        }}
      >
        © 2026 DocSign · Built with MERN Stack
      </footer>
    </div>
  );
}
