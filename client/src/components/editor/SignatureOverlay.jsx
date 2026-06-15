import { useState } from "react";
import { deleteSignature } from "../../api/signatures";

export default function SignatureOverlay({
  signatures,
  currentPage,
  containerRef,
  onDelete,
  onPositionChange,
}) {
  // Only show signatures for the current page
  const pageSignatures = signatures.filter((s) => s.page === currentPage);

  if (pageSignatures.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {pageSignatures.map((sig) => (
        <SignatureField
          key={sig._id}
          sig={sig}
          containerRef={containerRef}
          onDelete={onDelete}
          onPositionChange={onPositionChange}
        />
      ))}
    </div>
  );
}

function SignatureField({ sig, containerRef, onDelete, onPositionChange }) {
  const [dragging, setDragging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  const isPlaced = sig.status === "placed";
  const isSigned = sig.status === "signed";

  // ── Drag start ──────────────────────────────────────────
  const onMouseDown = (e) => {
    if (!isPlaced) return;
    e.preventDefault();
    e.stopPropagation();

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    setDragging(true);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      origX: sig.x,
      origY: sig.y,
      rectW: rect.width,
      rectH: rect.height,
    });

    const onMouseMove = (e) => {
      if (!dragStart) return;
      const dx = ((e.clientX - dragStart.mouseX) / dragStart.rectW) * 100;
      const dy = ((e.clientY - dragStart.mouseY) / dragStart.rectH) * 100;

      const newX = Math.max(0, Math.min(100 - sig.width, dragStart.origX + dx));
      const newY = Math.max(
        0,
        Math.min(100 - sig.height, dragStart.origY + dy),
      );

      onPositionChange(sig._id, { x: newX, y: newY });
    };

    const onMouseUp = async (e) => {
      setDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      if (!dragStart) return;
      const dx = ((e.clientX - dragStart.mouseX) / dragStart.rectW) * 100;
      const dy = ((e.clientY - dragStart.mouseY) / dragStart.rectH) * 100;

      const newX = Math.max(0, Math.min(100 - sig.width, dragStart.origX + dx));
      const newY = Math.max(
        0,
        Math.min(100 - sig.height, dragStart.origY + dy),
      );

      // Persist to backend
      try {
        await updateSignaturePosition(sig._id, { x: newX, y: newY });
      } catch (err) {
        console.error("Position update failed:", err);
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (isSigned) return;
    setDeleting(true);
    try {
      await deleteSignature(sig._id);
      onDelete(sig._id);
    } catch {
      alert("Failed to remove signature field.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Status colours ────────────────────────────────────────
  const borderColor = isSigned
    ? "#059669"
    : dragging
      ? "var(--ink)"
      : hovered
        ? "#B45309"
        : "var(--seal)";

  const bgColor = isSigned ? "rgba(209,250,229,0.5)" : "rgba(192,57,43,0.06)";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        left: `${sig.x}%`,
        top: `${sig.y}%`,
        width: `${sig.width}%`,
        height: `${sig.height}%`,
        border: `2px dashed ${borderColor}`,
        background: bgColor,
        borderRadius: "3px",
        cursor: isSigned ? "default" : dragging ? "grabbing" : "grab",
        pointerEvents: "all",
        transition: dragging ? "none" : "border-color 0.15s, background 0.15s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        zIndex: dragging ? 20 : 10,
      }}
    >
      {/* Signed stamp */}
      {isSigned ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1px",
            padding: "0 4px",
            textAlign: "center",
          }}
        >
          {sig.signatureDataUrl ? (
            <img
              src={sig.signatureDataUrl}
              alt="signature"
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <>
              <span
                style={{
                  fontFamily: "Fraunces, serif",
                  fontStyle: "italic",
                  fontSize: "clamp(8px, 1.2vw, 14px)",
                  color: "#065F46",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
              >
                {sig.signerName || "Signed"}
              </span>
              <span
                style={{
                  fontSize: "clamp(6px, 0.7vw, 9px)",
                  color: "#065F46",
                  opacity: 0.7,
                }}
              >
                ✓ Signed
              </span>
            </>
          )}
        </div>
      ) : (
        /* Placement label */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1px",
            padding: "0 4px",
          }}
        >
          <span
            style={{
              fontSize: "clamp(7px, 0.9vw, 11px)",
              fontWeight: 700,
              color: "var(--seal)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
            }}
          >
            ✍ Signature
          </span>
          {sig.signerEmail && (
            <span
              style={{
                fontSize: "clamp(6px, 0.7vw, 9px)",
                color: "var(--muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              {sig.signerEmail}
            </span>
          )}
        </div>
      )}

      {/* Delete button — shown on hover for placed fields */}
      {isPlaced && hovered && !dragging && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            position: "absolute",
            top: "-10px",
            right: "-10px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "var(--seal)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "10px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            zIndex: 30,
            pointerEvents: "all",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }}
          title="Remove signature field"
        >
          ✕
        </button>
      )}
    </div>
  );
}
