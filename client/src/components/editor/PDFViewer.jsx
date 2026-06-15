import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker
import workerSrc from "pdfjs-dist/build/pdf.worker?url";
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export default function PDFViewer({
  fileUrl,
  currentPage,
  onPageChange,
  onTotalPages,
}) {
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }) => {
      setNumPages(numPages);
      setLoading(false);
      setError(false);
      if (onTotalPages) onTotalPages(numPages);
    },
    [onTotalPages],
  );

  const onDocumentLoadError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  const goToPrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < numPages) onPageChange(currentPage + 1);
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 2.5));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.6rem 1rem",
          borderBottom: "1px solid var(--border)",
          background: "#fff",
          flexShrink: 0,
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        {/* Page Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ToolButton onClick={goToPrev} disabled={currentPage <= 1}>
            ‹
          </ToolButton>
          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--muted)",
              minWidth: "80px",
              textAlign: "center",
            }}
          >
            {loading ? "..." : `Page ${currentPage} of ${numPages}`}
          </span>
          <ToolButton
            onClick={goToNext}
            disabled={currentPage >= numPages || loading}
          >
            ›
          </ToolButton>
        </div>

        {/* Zoom Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ToolButton onClick={zoomOut} disabled={scale <= 0.5}>
            −
          </ToolButton>
          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--muted)",
              minWidth: "44px",
              textAlign: "center",
            }}
          >
            {Math.round(scale * 100)}%
          </span>
          <ToolButton onClick={zoomIn} disabled={scale >= 2.5}>
            +
          </ToolButton>
        </div>
      </div>

      {/* PDF Canvas Area */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          background: "#E8E4DC",
          display: "flex",
          justifyContent: "center",
          alignItems: loading ? "center" : "flex-start",
          padding: "2rem",
        }}
      >
        {error ? (
          <ErrorState />
        ) : (
          <div style={{ position: "relative" }}>
            {loading && <LoadingState />}
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={null}
              />
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolButton({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "28px",
        height: "28px",
        border: "1.5px solid var(--border)",
        borderRadius: "4px",
        background: disabled ? "var(--cream)" : "#fff",
        color: disabled ? "var(--border)" : "var(--ink)",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "1rem",
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
        fontFamily: "DM Sans, sans-serif",
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

function LoadingState() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(245,240,232,0.8)",
        zIndex: 10,
        gap: "0.8rem",
        minHeight: "300px",
        minWidth: "300px",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          border: "3px solid var(--border)",
          borderTopColor: "var(--ink)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
        Loading PDF...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "3rem",
        color: "var(--muted)",
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
      <p
        style={{ fontWeight: 600, color: "var(--ink)", marginBottom: "0.4rem" }}
      >
        Could not load PDF
      </p>
      <p style={{ fontSize: "0.85rem" }}>
        The file may have expired. Go back and try again.
      </p>
    </div>
  );
}
