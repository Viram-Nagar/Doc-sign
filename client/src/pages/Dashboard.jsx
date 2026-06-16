import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDocuments } from "../api/docs";
import DashboardNav from "../components/dashboard/DashboardNav";
import UploadZone from "../components/dashboard/UploadZone";
import DocCard from "../components/dashboard/DocCard";
import StatsBar from "../components/dashboard/StatsBar";
import FilterBar from "../components/dashboard/FilterBar";
import EmptyState from "../components/dashboard/EmptyState";

function sortDocs(docs, sort) {
  const d = [...docs];
  switch (sort) {
    case "oldest":
      return d.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case "name":
      return d.sort((a, b) => a.originalName.localeCompare(b.originalName));
    case "size":
      return d.sort((a, b) => b.fileSize - a.fileSize);
    default:
      return d.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const uploadRef = useRef(null);

  const [docs, setDocs] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate("/login");
  }, [user, authLoading, navigate]);

  const fetchDocs = () => {
    if (!user) return;
    setFetching(true);
    getDocuments()
      .then(({ data }) => setDocs(data.documents))
      .catch(console.error)
      .finally(() => setFetching(false));
  };

  useEffect(() => {
    fetchDocs();
  }, [user]);

  const handleUploadSuccess = (newDoc) => {
    setDocs((prev) => [newDoc, ...prev]);
  };

  const handleDelete = (id) => {
    setDocs((prev) => prev.filter((d) => d._id !== id));
  };

  // ── Filter + sort + search ─────────────────────────────
  const counts = {
    all: docs.length,
    pending: docs.filter((d) => d.status === "pending").length,
    signed: docs.filter((d) => d.status === "signed").length,
    rejected: docs.filter((d) => d.status === "rejected").length,
  };

  const filtered = sortDocs(
    docs.filter((d) => {
      const matchFilter = filter === "all" || d.status === filter;
      const matchSearch =
        search.trim() === ""
          ? true
          : d.originalName.toLowerCase().includes(search.toLowerCase()) ||
            (d.signerEmail || "").toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    }),
    sort,
  );

  if (authLoading) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <DashboardNav />

      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2rem" }}
      >
        {/* Header row */}
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
            <h1
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--ink)",
                marginBottom: "0.3rem",
                letterSpacing: "-0.02em",
              }}
            >
              My Documents
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
              {user?.name} · {docs.length} document
              {docs.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "0.7rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.85rem",
                  color: "var(--muted)",
                  pointerEvents: "none",
                }}
              >
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents..."
                style={{
                  paddingLeft: "2rem",
                  paddingRight: "0.9rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                  border: "1.5px solid var(--border)",
                  borderRadius: "4px",
                  fontSize: "0.82rem",
                  fontFamily: "DM Sans, sans-serif",
                  background: "#fff",
                  color: "var(--ink)",
                  outline: "none",
                  width: "200px",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Refresh */}
            <button
              onClick={fetchDocs}
              style={{
                padding: "0.5rem 1rem",
                background: "transparent",
                border: "1.5px solid var(--border)",
                borderRadius: "4px",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--muted)",
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--ink)";
                e.currentTarget.style.color = "var(--ink)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--muted)";
              }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {!fetching && docs.length > 0 && <StatsBar docs={docs} />}

        {/* Upload zone */}
        <div ref={uploadRef}>
          <UploadZone onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Filter bar */}
        <FilterBar
          filter={filter}
          setFilter={setFilter}
          sort={sort}
          setSort={setSort}
          counts={counts}
        />

        {/* Content */}
        {fetching ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.2rem",
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  height: "180px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.04) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.4s infinite",
                  }}
                />
                <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            }}
          >
            <EmptyState
              filter={filter}
              onUploadClick={() =>
                uploadRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            />
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.2rem",
            }}
          >
            {filtered.map((doc) => (
              <DocCard key={doc._id} doc={doc} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Result count when searching */}
        {search.trim() && !fetching && (
          <p
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              fontSize: "0.82rem",
              color: "var(--muted)",
            }}
          >
            {filtered.length === 0
              ? `No results for "${search}"`
              : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`}
          </p>
        )}
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { getDocuments } from "../api/docs";
// import DashboardNav from "../components/dashboard/DashboardNav";
// import UploadZone from "../components/dashboard/UploadZone";
// import DocCard from "../components/dashboard/DocCard";

// const FILTERS = ["all", "pending", "signed", "rejected"];

// export default function Dashboard() {
//   const { user, loading } = useAuth();
//   const navigate = useNavigate();
//   const [docs, setDocs] = useState([]);
//   const [fetching, setFetching] = useState(true);
//   const [filter, setFilter] = useState("all");

//   useEffect(() => {
//     if (!loading && !user) navigate("/login");
//   }, [user, loading]);

//   useEffect(() => {
//     if (!user) return;
//     setFetching(true);
//     getDocuments()
//       .then(({ data }) => setDocs(data.documents))
//       .catch(console.error)
//       .finally(() => setFetching(false));
//   }, [user]);

//   const handleUploadSuccess = (newDoc) => {
//     setDocs((prev) => [newDoc, ...prev]);
//   };

//   const handleDelete = (id) => {
//     setDocs((prev) => prev.filter((d) => d._id !== id));
//   };

//   const filtered =
//     filter === "all" ? docs : docs.filter((d) => d.status === filter);

//   const counts = {
//     all: docs.length,
//     pending: docs.filter((d) => d.status === "pending").length,
//     signed: docs.filter((d) => d.status === "signed").length,
//     rejected: docs.filter((d) => d.status === "rejected").length,
//   };

//   if (loading) return null;

//   const refetchDocs = () => {
//     if (!user) return;
//     setFetching(true);
//     getDocuments()
//       .then(({ data }) => setDocs(data.documents))
//       .catch(console.error)
//       .finally(() => setFetching(false));
//   };

//   return (
//     <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
//       <DashboardNav />

//       <div
//         style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 2rem" }}
//       >
//         {/* Header */}
//         // In Dashboard.jsx, update the header div:
//         <div
//           style={{
//             marginBottom: "2rem",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//         >
//           <div>
//             <h1
//               style={{
//                 fontFamily: "Fraunces, serif",
//                 fontSize: "1.8rem",
//                 fontWeight: 700,
//                 color: "var(--ink)",
//                 marginBottom: "0.3rem",
//               }}
//             >
//               My Documents
//             </h1>
//             <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
//               Upload PDFs and manage your signing workflow.
//             </p>
//           </div>
//           <button
//             onClick={refetchDocs}
//             style={{
//               padding: "0.5rem 1.2rem",
//               background: "transparent",
//               border: "1.5px solid var(--border)",
//               borderRadius: "4px",
//               fontSize: "0.82rem",
//               fontWeight: 600,
//               color: "var(--muted)",
//               cursor: "pointer",
//               fontFamily: "DM Sans, sans-serif",
//               transition: "border-color 0.2s",
//             }}
//             onMouseEnter={(e) => (e.target.style.borderColor = "var(--ink)")}
//             onMouseLeave={(e) => (e.target.style.borderColor = "var(--border)")}
//           >
//             ↻ Refresh
//           </button>
//         </div>
//         {/* Upload Zone */}
//         <UploadZone onUploadSuccess={handleUploadSuccess} />
//         {/* Filter Tabs */}
//         <div
//           style={{
//             display: "flex",
//             gap: "0.5rem",
//             marginBottom: "1.5rem",
//             flexWrap: "wrap",
//           }}
//         >
//           {FILTERS.map((f) => (
//             <button
//               key={f}
//               onClick={() => setFilter(f)}
//               style={{
//                 padding: "0.4rem 1rem",
//                 borderRadius: "99px",
//                 border: "1.5px solid",
//                 borderColor: filter === f ? "var(--ink)" : "var(--border)",
//                 background: filter === f ? "var(--ink)" : "transparent",
//                 color: filter === f ? "#fff" : "var(--muted)",
//                 fontSize: "0.8rem",
//                 fontWeight: 600,
//                 cursor: "pointer",
//                 fontFamily: "DM Sans, sans-serif",
//                 textTransform: "capitalize",
//                 transition: "all 0.15s",
//               }}
//             >
//               {f} ({counts[f]})
//             </button>
//           ))}
//         </div>
//         {/* Document Grid */}
//         {fetching ? (
//           <div
//             style={{
//               textAlign: "center",
//               padding: "4rem",
//               color: "var(--muted)",
//               fontSize: "0.9rem",
//             }}
//           >
//             Loading documents...
//           </div>
//         ) : filtered.length === 0 ? (
//           <div
//             style={{
//               textAlign: "center",
//               padding: "4rem 2rem",
//               border: "1px dashed var(--border)",
//               borderRadius: "8px",
//               background: "#fff",
//             }}
//           >
//             <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📭</div>
//             <p
//               style={{
//                 fontWeight: 600,
//                 color: "var(--ink)",
//                 marginBottom: "0.4rem",
//               }}
//             >
//               {filter === "all" ? "No documents yet" : `No ${filter} documents`}
//             </p>
//             <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
//               {filter === "all"
//                 ? "Upload a PDF above to get started."
//                 : "Try a different filter."}
//             </p>
//           </div>
//         ) : (
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
//               gap: "1.2rem",
//             }}
//           >
//             {filtered.map((doc) => (
//               <DocCard key={doc._id} doc={doc} onDelete={handleDelete} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
