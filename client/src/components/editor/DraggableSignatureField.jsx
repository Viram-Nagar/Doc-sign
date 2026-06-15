import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function DraggableSignatureField({
  sig,
  containerWidth,
  containerHeight,
  onDelete,
  onOpenDrawer,
  deleting,
}) {
  const isSigned = sig.status === "signed";
  const isPlaced = sig.status === "placed";

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: sig._id,
      disabled: isSigned,
    });

  // Convert % → px for positioning
  const leftPx = (sig.x / 100) * containerWidth;
  const topPx = (sig.y / 100) * containerHeight;
  const wPx = (sig.width / 100) * containerWidth;
  const hPx = (sig.height / 100) * containerHeight;

  const style = {
    position: "absolute",
    left: leftPx,
    top: topPx,
    width: wPx,
    height: hPx,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 999 : 10,
    cursor: isSigned ? "default" : isDragging ? "grabbing" : "grab",
    border: `2px dashed ${
      isSigned ? "#059669" : isDragging ? "var(--ink)" : "var(--seal)"
    }`,
    background: isSigned
      ? "rgba(209,250,229,0.55)"
      : isDragging
        ? "rgba(192,57,43,0.12)"
        : "rgba(192,57,43,0.06)",
    borderRadius: "3px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    transition: isDragging ? "none" : "border-color 0.15s, background 0.15s",
    boxShadow: isDragging ? "0 4px 20px rgba(0,0,0,0.15)" : "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isPlaced ? { ...listeners, ...attributes } : {})}
    >
      {/* Content */}
      {isSigned ? (
        <SignedContent sig={sig} />
      ) : (
        <PlacedContent
          sig={sig}
          isDragging={isDragging}
          onOpenDrawer={onOpenDrawer}
        />
      )}

      {/* Delete button */}
      {isPlaced && !isDragging && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(sig._id);
          }}
          disabled={deleting === sig._id}
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
            zIndex: 30,
            boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
            lineHeight: 1,
          }}
          title="Remove field"
        >
          {deleting === sig._id ? "…" : "✕"}
        </button>
      )}

      {/* Sign button */}
      {isPlaced && !isDragging && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onOpenDrawer(sig._id);
          }}
          style={{
            position: "absolute",
            bottom: "-10px",
            right: "-10px",
            padding: "2px 8px",
            borderRadius: "3px",
            background: "var(--ink)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            zIndex: 30,
            boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
            whiteSpace: "nowrap",
          }}
        >
          ✍ Sign
        </button>
      )}
    </div>
  );
}

function PlacedContent({ sig, isDragging }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1px",
        padding: "0 6px",
        pointerEvents: "none",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontSize: "clamp(7px, 1vw, 11px)",
          fontWeight: 700,
          color: isDragging ? "var(--ink)" : "var(--seal)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
        }}
      >
        {isDragging ? "↔ Drag to position" : "✍ Signature Field"}
      </span>
      {sig.signerEmail && !isDragging && (
        <span
          style={{
            fontSize: "clamp(6px, 0.8vw, 9px)",
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
  );
}

function SignedContent({ sig }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: "4px",
        pointerEvents: "none",
      }}
    >
      {sig.signatureDataUrl ? (
        <img
          src={sig.signatureDataUrl}
          alt="signature"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      ) : (
        <>
          <span
            style={{
              fontFamily: "Fraunces, serif",
              fontStyle: "italic",
              fontSize: "clamp(8px, 1.3vw, 15px)",
              color: "#065F46",
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "90%",
            }}
          >
            {sig.signerName || "Signed"}
          </span>
          <span
            style={{
              fontSize: "clamp(6px, 0.7vw, 9px)",
              color: "#059669",
              marginTop: "1px",
            }}
          >
            ✓ Signed
          </span>
        </>
      )}
    </div>
  );
}
