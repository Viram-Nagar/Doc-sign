import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import DraggableSignatureField from "./DraggableSignatureField";
import SignatureDrawer from "./SignatureDrawer";
import { deleteSignature, updateSignaturePosition } from "../../api/signatures";
import api from "../../api/axios";

import workerSrc from "pdfjs-dist/build/pdf.worker?url";
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export default function PDFEditorCanvas({
  fileUrl,
  currentPage,
  onPageChange,
  onTotalPages,
  signatures,
  onSignaturesChange,
}) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [numPages, setNumPages] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [scale, setScale] = useState(1.0);
  const [deleting, setDeleting] = useState(null);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState(null);

  // Measure container after PDF renders
  const measureContainer = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    setDims((prev) => {
      if (prev.width === rect.width && prev.height === rect.height) {
        return prev;
      }

      return {
        width: rect.width,
        height: rect.height,
      };
    });
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(measureContainer);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [measureContainer]);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  // ── Drag end: convert px delta → % and persist ──────────
  const handleDragEnd = async (event) => {
    const { active, delta } = event;
    if (!delta || (delta.x === 0 && delta.y === 0)) return;

    const sig = signatures.find((s) => s._id === active.id);
    if (!sig || sig.status === "signed") return;

    const dx = (delta.x / dims.width) * 100;
    const dy = (delta.y / dims.height) * 100;

    const newX = Math.max(0, Math.min(100 - sig.width, sig.x + dx));
    const newY = Math.max(0, Math.min(100 - sig.height, sig.y + dy));

    // Optimistic UI update
    onSignaturesChange((prev) =>
      prev.map((s) => (s._id === active.id ? { ...s, x: newX, y: newY } : s)),
    );

    // Persist
    try {
      await updateSignaturePosition(active.id, { x: newX, y: newY });
    } catch (err) {
      console.error("Position persist failed:", err);
    }
  };

  // ── Delete field ─────────────────────────────────────────
  const handleDelete = async (sigId) => {
    setDeleting(sigId);
    try {
      await deleteSignature(sigId);
      onSignaturesChange((prev) => prev.filter((s) => s._id !== sigId));
    } catch {
      alert("Failed to remove signature field.");
    } finally {
      setDeleting(null);
    }
  };

  // ── Open signature drawer ────────────────────────────────
  const handleOpenDrawer = (sigId) => {
    setActiveFieldId(sigId);
    setDrawerOpen(true);
  };

  // ── Apply drawn signature ────────────────────────────────
  const handleApplySignature = async ({ signatureDataUrl, signerName }) => {
    if (!activeFieldId) return;
    setDrawerOpen(false);

    try {
      const { data } = await api.patch(
        `/api/signatures/${activeFieldId}/sign`,
        { signatureDataUrl, signerName },
      );
      onSignaturesChange((prev) =>
        prev.map((s) => (s._id === activeFieldId ? data.signature : s)),
      );
    } catch (err) {
      console.error("Sign error:", err);
      alert("Failed to apply signature. Try again.");
    }
    setActiveFieldId(null);
  };

  const handleCancelDrawer = () => {
    setDrawerOpen(false);
    setActiveFieldId(null);
  };

  // Page signatures for current page only
  const pageSignatures = signatures.filter((s) => s.page === currentPage);

  const pdfFile = useMemo(() => {
    if (!fileUrl) return null;

    return {
      url: fileUrl,
      httpHeaders: {
        "Cache-Control": "no-cache",
      },
    };
  }, [fileUrl]);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* ── Toolbar ─────────────────────────────────────── */}
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
        {/* Page controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ToolBtn
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            ‹
          </ToolBtn>
          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--muted)",
              minWidth: "90px",
              textAlign: "center",
            }}
          >
            {pdfLoading ? "…" : `Page ${currentPage} of ${numPages}`}
          </span>
          <ToolBtn
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= numPages || pdfLoading}
          >
            ›
          </ToolBtn>
        </div>

        {/* Zoom controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ToolBtn
            onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
            disabled={scale <= 0.5}
          >
            −
          </ToolBtn>
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
          <ToolBtn
            onClick={() => setScale((s) => Math.min(s + 0.2, 2.5))}
            disabled={scale >= 2.5}
          >
            +
          </ToolBtn>
        </div>

        {/* Field count badge */}
        <div
          style={{
            fontSize: "0.78rem",
            color: "var(--muted)",
            background: "var(--cream)",
            border: "1px solid var(--border)",
            borderRadius: "99px",
            padding: "0.25rem 0.8rem",
          }}
        >
          {pageSignatures.length} field{pageSignatures.length !== 1 ? "s" : ""}{" "}
          on this page
        </div>
      </div>

      {/* ── PDF Canvas + dnd-kit ─────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          background: "#E8E4DC",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "2rem",
        }}
      >
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {/* Relative container — signatures positioned inside this */}
          <div
            ref={containerRef}
            style={{
              position: "relative",
              display: "inline-block",
              boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
              lineHeight: 0,
            }}
          >
            {/* PDF Page */}

            <Document
              file={pdfFile}
              onLoadSuccess={(pdf) => {
                setNumPages(pdf.numPages);
                setPdfLoading(false);
                if (onTotalPages) onTotalPages(pdf.numPages);
              }}
              onLoadError={(error) => {
                setPdfLoading(false);
              }}
              loading={null}
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={
                  <div
                    style={{
                      width: "595px",
                      height: "842px",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--muted)",
                      fontSize: "0.85rem",
                    }}
                  >
                    Loading page...
                  </div>
                }
              />
              {/* <Page
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                onLoadSuccess={() => console.log("PAGE LOADED")}
                onRenderSuccess={() => console.log("PAGE RENDERED")}
                onRenderError={(e) => console.error("RENDER ERROR", e)}
                loading={
                  <div
                    style={{
                      width: "595px",
                      height: "842px",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--muted)",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span>Loading page…</span>
                  </div>
                }
                onRenderSuccess={() => {
                  setTimeout(measureContainer, 50); // slight delay for DOM settle
                }}
              /> */}
            </Document>

            {/* Draggable Signature Fields */}
            {dims.width > 0 &&
              pageSignatures.map((sig) => (
                <DraggableSignatureField
                  key={sig._id}
                  sig={sig}
                  containerWidth={dims.width}
                  containerHeight={dims.height}
                  onDelete={handleDelete}
                  onOpenDrawer={handleOpenDrawer}
                  deleting={deleting}
                />
              ))}
          </div>
        </DndContext>
      </div>

      {/* ── Signature Drawer Modal ───────────────────────── */}
      {drawerOpen && (
        <SignatureDrawer
          onConfirm={handleApplySignature}
          onCancel={handleCancelDrawer}
        />
      )}
    </div>
  );
}

function ToolBtn({ onClick, disabled, children }) {
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
