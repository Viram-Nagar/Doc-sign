import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function DashboardNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav
      style={{
        borderBottom: "1px solid var(--border)",
        background: "#fff",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "60px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <Link to="/dashboard" style={{ textDecoration: "none" }}>
        <span
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "var(--ink)",
          }}
        >
          Doc<span style={{ color: "var(--seal)" }}>Sign</span>
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
        <span
          style={{
            fontSize: "0.85rem",
            color: "var(--muted)",
            fontWeight: 500,
          }}
        >
          {user?.name}
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "1.5px solid var(--border)",
            padding: "0.4rem 1rem",
            borderRadius: "4px",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--ink)",
            cursor: "pointer",
            fontFamily: "DM Sans, sans-serif",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.borderColor = "var(--ink)")}
          onMouseLeave={(e) => (e.target.style.borderColor = "var(--border)")}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
