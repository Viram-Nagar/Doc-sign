import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDocument, getFreshUrl } from "../api/docs";
import { getSignatures } from "../api/signatures";
import DashboardNav from "../components/dashboard/DashboardNav";
import PDFEditorCanvas from "../components/editor/PDFEditorCanvas";
import DocSidebar from "../components/editor/DocSidebar";

export default function Editor() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [signatures, setSignatures] = useState([]);

  useEffect(() => {
    if (authLoading) return; // ← wait for auth to finish
    if (!user) navigate("/login");
  }, [user, authLoading, navigate]);

  const loadDocument = useCallback(async () => {
    try {
      setFetching(true);
      setError("");
      const [{ data: docData }, { data: sigData }] = await Promise.all([
        getDocument(id),
        getSignatures(id),
      ]);
      setDoc(docData.document);
      setSignatures(sigData.signatures);
      const { data: urlData } = await getFreshUrl(id);
      setFileUrl(urlData.signedUrl);
    } catch (err) {
      if (err.response?.status === 404) setError("Document not found.");
      else setError("Failed to load document. Please try again.");
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    if (user) loadDocument();
  }, [user, loadDocument]);

  useEffect(() => {
    if (!user || !fileUrl) return;
    const interval = setInterval(
      async () => {
        try {
          const { data } = await getFreshUrl(id);
          setFileUrl(data.signedUrl);
        } catch {
          console.warn("URL refresh failed");
        }
      },
      90 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [user, id, fileUrl]);

  const handleSignatureAdded = (sig) => {
    setSignatures((prev) => [sig, ...prev]);
  };

  // Refresh doc status when a field gets signed
  const handleSignaturesChange = async (updaterOrArray) => {
    setSignatures(updaterOrArray);
    // Re-fetch doc to get updated status
    try {
      const { data } = await getDocument(id);
      setDoc(data.document);
    } catch {
      /* silent */
    }
  };

  const handleDocUpdated = (updatedDoc) => {
    setDoc(updatedDoc);
  };

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
        <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
          Loading document...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📄</div>
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
    <div
      style={{
        minHeight: "100vh",
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DashboardNav />
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          height: "calc(100vh - 60px)",
        }}
      >
        {/* PDF Editor */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {fileUrl && (
            <PDFEditorCanvas
              fileUrl={fileUrl}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onTotalPages={setTotalPages}
              signatures={signatures}
              onSignaturesChange={handleSignaturesChange}
            />
          )}
        </div>

        {/* Sidebar */}
        <DocSidebar
          doc={doc}
          totalPages={totalPages}
          currentPage={currentPage}
          onSignatureAdded={handleSignatureAdded}
          onDocUpdated={handleDocUpdated}
        />
      </div>
    </div>
  );
}

// import { useEffect, useState, useCallback, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { getDocument, getFreshUrl } from "../api/docs";
// import { getSignatures } from "../api/signatures";
// import DashboardNav from "../components/dashboard/DashboardNav";
// import PDFViewer from "../components/editor/PDFViewer";
// import DocSidebar from "../components/editor/DocSidebar";
// import SignatureOverlay from "../components/editor/SignatureOverlay";

// export default function Editor() {
//   const { id } = useParams();
//   const { user, loading: authLoading } = useAuth();
//   const navigate = useNavigate();

//   const [doc, setDoc] = useState(null);
//   const [fileUrl, setFileUrl] = useState(null);
//   const [fetching, setFetching] = useState(true);
//   const [error, setError] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(null);
//   const [signatures, setSignatures] = useState([]);

//   const pdfContainerRef = useRef(null);

//   useEffect(() => {
//     if (!authLoading && !user) navigate("/login");
//   }, [user, authLoading]);

//   const loadDocument = useCallback(async () => {
//     try {
//       setFetching(true);
//       setError("");

//       const [{ data: docData }, { data: sigData }] = await Promise.all([
//         getDocument(id),
//         getSignatures(id),
//       ]);

//       setDoc(docData.document);
//       setSignatures(sigData.signatures);

//       const { data: urlData } = await getFreshUrl(id);
//       setFileUrl(urlData.signedUrl);
//     } catch (err) {
//       if (err.response?.status === 404) setError("Document not found.");
//       else setError("Failed to load document. Please try again.");
//     } finally {
//       setFetching(false);
//     }
//   }, [id]);

//   useEffect(() => {
//     if (user) loadDocument();
//   }, [user, loadDocument]);

//   // Auto-refresh Supabase URL every 90 min
//   useEffect(() => {
//     if (!user || !fileUrl) return;
//     const interval = setInterval(
//       async () => {
//         try {
//           const { data } = await getFreshUrl(id);
//           setFileUrl(data.signedUrl);
//         } catch {
//           console.warn("URL refresh failed");
//         }
//       },
//       90 * 60 * 1000,
//     );
//     return () => clearInterval(interval);
//   }, [user, id, fileUrl]);

//   // ── Signature handlers ───────────────────────────────────
//   const handleSignatureAdded = (sig) => {
//     setSignatures((prev) => [sig, ...prev]);
//   };

//   const handleSignatureDeleted = (sigId) => {
//     setSignatures((prev) => prev.filter((s) => s._id !== sigId));
//   };

//   const handlePositionChange = (sigId, { x, y }) => {
//     setSignatures((prev) =>
//       prev.map((s) => (s._id === sigId ? { ...s, x, y } : s)),
//     );
//   };

//   // ── Loading screen ───────────────────────────────────────
//   if (authLoading || fetching) {
//     return (
//       <div
//         style={{
//           minHeight: "100vh",
//           background: "var(--paper)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           flexDirection: "column",
//           gap: "1rem",
//         }}
//       >
//         <div
//           style={{
//             width: "40px",
//             height: "40px",
//             border: "3px solid var(--border)",
//             borderTopColor: "var(--ink)",
//             borderRadius: "50%",
//             animation: "spin 0.8s linear infinite",
//           }}
//         />
//         <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
//           Loading document...
//         </p>
//         <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//       </div>
//     );
//   }

//   // ── Error screen ─────────────────────────────────────────
//   if (error) {
//     return (
//       <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
//         <DashboardNav />
//         <div
//           style={{
//             maxWidth: "600px",
//             margin: "6rem auto",
//             textAlign: "center",
//             padding: "2rem",
//           }}
//         >
//           <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📄</div>
//           <h2
//             style={{
//               fontFamily: "Fraunces, serif",
//               fontSize: "1.4rem",
//               color: "var(--ink)",
//               marginBottom: "0.5rem",
//             }}
//           >
//             {error}
//           </h2>
//           <button
//             onClick={() => navigate("/dashboard")}
//             style={{
//               marginTop: "1.5rem",
//               padding: "0.7rem 1.8rem",
//               background: "var(--ink)",
//               color: "#fff",
//               border: "none",
//               borderRadius: "4px",
//               fontSize: "0.9rem",
//               fontWeight: 600,
//               cursor: "pointer",
//               fontFamily: "DM Sans, sans-serif",
//             }}
//           >
//             ← Back to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "var(--paper)",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       <DashboardNav />

//       <div
//         style={{
//           flex: 1,
//           display: "flex",
//           overflow: "hidden",
//           height: "calc(100vh - 60px)",
//         }}
//       >
//         {/* PDF + Overlay wrapper */}
//         <div
//           style={{
//             flex: 1,
//             overflow: "hidden",
//             display: "flex",
//             flexDirection: "column",
//             position: "relative",
//           }}
//         >
//           {fileUrl ? (
//             <>
//               {/* PDF canvas — we need ref on the inner page container */}
//               <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
//                 <div
//                   ref={pdfContainerRef}
//                   style={{ position: "relative", display: "inline-block" }}
//                 >
//                   <PDFViewer
//                     fileUrl={fileUrl}
//                     currentPage={currentPage}
//                     onPageChange={setCurrentPage}
//                     onTotalPages={setTotalPages}
//                   />
//                   {/* Signature overlay sits on top of the PDF page */}
//                   <SignatureOverlay
//                     signatures={signatures}
//                     currentPage={currentPage}
//                     containerRef={pdfContainerRef}
//                     onDelete={handleSignatureDeleted}
//                     onPositionChange={handlePositionChange}
//                   />
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div
//               style={{
//                 flex: 1,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 color: "var(--muted)",
//                 fontSize: "0.9rem",
//               }}
//             >
//               No file available
//             </div>
//           )}
//         </div>

//         {/* Sidebar */}
//         <DocSidebar
//           doc={doc}
//           totalPages={totalPages}
//           currentPage={currentPage}
//           onSignatureAdded={handleSignatureAdded}
//         />
//       </div>
//     </div>
//   );
// }
