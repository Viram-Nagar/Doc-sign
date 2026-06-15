import { useState, useRef } from "react";
import { uploadDocument } from "../../api/docs";

export default function UploadZone({ onUploadSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [justDone, setJustDone] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB.");
      return;
    }

    setError("");
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("document", file);

    try {
      const { data } = await uploadDocument(formData, setProgress);
      setJustDone(true);
      setTimeout(() => setJustDone(false), 2000);
      onUploadSuccess(data.document);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const onInputChange = (e) => {
    handleFile(e.target.files[0]);
    e.target.value = "";
  };

  const borderColor = dragging
    ? "var(--ink)"
    : error
      ? "var(--seal)"
      : justDone
        ? "#10B981"
        : "var(--border)";

  const bgColor = dragging
    ? "var(--cream)"
    : justDone
      ? "#F0FDF4"
      : "var(--surface)";

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div
        onClick={() => !uploading && inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${borderColor}`,
          borderRadius: "8px",
          padding: "2rem",
          textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          background: bgColor,
          transition: "all 0.2s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={onInputChange}
        />

        {uploading ? (
          <div>
            <div style={{ fontSize: "2rem", marginBottom: "0.6rem" }}>📤</div>
            <p
              style={{
                fontSize: "0.88rem",
                color: "var(--ink)",
                fontWeight: 600,
                marginBottom: "0.8rem",
              }}
            >
              Uploading… {progress}%
            </p>
            {/* Progress bar */}
            <div
              style={{
                height: "6px",
                background: "var(--border)",
                borderRadius: "99px",
                overflow: "hidden",
                maxWidth: "300px",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, var(--ink), #444)",
                  borderRadius: "99px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        ) : justDone ? (
          <div>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
            <p
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#065F46",
              }}
            >
              Upload complete!
            </p>
          </div>
        ) : (
          <div>
            <div
              style={{
                fontSize: "2.2rem",
                marginBottom: "0.6rem",
                transition: "transform 0.2s",
                transform: dragging ? "scale(1.15)" : "scale(1)",
                display: "inline-block",
              }}
            >
              {dragging ? "📂" : "⬆️"}
            </div>
            <p
              style={{
                fontSize: "0.92rem",
                fontWeight: 600,
                color: "var(--ink)",
                marginBottom: "0.25rem",
              }}
            >
              {dragging
                ? "Drop to upload"
                : "Drag & drop PDF here, or click to browse"}
            </p>
            <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
              PDF only · max 10MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--seal)",
            marginTop: "0.4rem",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

// import { useState, useRef } from "react";
// import { uploadDocument } from "../../api/docs";

// export default function UploadZone({ onUploadSuccess }) {
//   const [dragging, setDragging] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [error, setError] = useState("");
//   const inputRef = useRef(null);

//   const handleFile = async (file) => {
//     if (!file) return;
//     if (file.type !== "application/pdf") {
//       setError("Only PDF files are allowed.");
//       return;
//     }
//     if (file.size > 10 * 1024 * 1024) {
//       setError("File size must be under 10MB.");
//       return;
//     }

//     setError("");
//     setUploading(true);
//     setProgress(0);

//     const formData = new FormData();
//     formData.append("document", file);

//     try {
//       const { data } = await uploadDocument(formData, setProgress);
//       onUploadSuccess(data.document);
//     } catch (err) {
//       setError(err.response?.data?.message || "Upload failed. Try again.");
//     } finally {
//       setUploading(false);
//       setProgress(0);
//     }
//   };

//   const onDrop = (e) => {
//     e.preventDefault();
//     setDragging(false);
//     const file = e.dataTransfer.files[0];
//     handleFile(file);
//   };

//   const onInputChange = (e) => {
//     handleFile(e.target.files[0]);
//     e.target.value = "";
//   };

//   return (
//     <div style={{ marginBottom: "2rem" }}>
//       <div
//         onClick={() => !uploading && inputRef.current.click()}
//         onDragOver={(e) => {
//           e.preventDefault();
//           setDragging(true);
//         }}
//         onDragLeave={() => setDragging(false)}
//         onDrop={onDrop}
//         style={{
//           border: `2px dashed ${dragging ? "var(--ink)" : error ? "var(--seal)" : "var(--border)"}`,
//           borderRadius: "8px",
//           padding: "2.5rem",
//           textAlign: "center",
//           cursor: uploading ? "not-allowed" : "pointer",
//           background: dragging ? "var(--cream)" : "var(--surface)",
//           transition: "all 0.2s",
//         }}
//       >
//         <input
//           ref={inputRef}
//           type="file"
//           accept="application/pdf"
//           style={{ display: "none" }}
//           onChange={onInputChange}
//         />

//         {uploading ? (
//           <div>
//             <div
//               style={{
//                 fontSize: "2rem",
//                 marginBottom: "0.8rem",
//                 animation: "pulse 1s infinite",
//               }}
//             >
//               📄
//             </div>
//             <p
//               style={{
//                 fontSize: "0.9rem",
//                 color: "var(--muted)",
//                 marginBottom: "1rem",
//                 fontWeight: 500,
//               }}
//             >
//               Uploading... {progress}%
//             </p>
//             <div
//               style={{
//                 height: "6px",
//                 background: "var(--border)",
//                 borderRadius: "99px",
//                 overflow: "hidden",
//                 maxWidth: "280px",
//                 margin: "0 auto",
//               }}
//             >
//               <div
//                 style={{
//                   height: "100%",
//                   width: `${progress}%`,
//                   background: "var(--ink)",
//                   borderRadius: "99px",
//                   transition: "width 0.3s ease",
//                 }}
//               />
//             </div>
//           </div>
//         ) : (
//           <div>
//             <div style={{ fontSize: "2.5rem", marginBottom: "0.8rem" }}>
//               {dragging ? "📂" : "⬆️"}
//             </div>
//             <p
//               style={{
//                 fontSize: "0.95rem",
//                 fontWeight: 600,
//                 color: "var(--ink)",
//                 marginBottom: "0.3rem",
//               }}
//             >
//               {dragging ? "Drop your PDF here" : "Drag & drop your PDF here"}
//             </p>
//             <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
//               or click to browse · PDF only · max 10MB
//             </p>
//           </div>
//         )}
//       </div>

//       {error && (
//         <p
//           style={{
//             fontSize: "0.82rem",
//             color: "var(--seal)",
//             marginTop: "0.5rem",
//             display: "flex",
//             alignItems: "center",
//             gap: "0.3rem",
//           }}
//         >
//           ⚠ {error}
//         </p>
//       )}
//     </div>
//   );
// }
