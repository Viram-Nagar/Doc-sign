import { useRef, useState, useEffect } from "react";

export default function SignatureDrawer({ onConfirm, onCancel }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#0D0D0D";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setHasDrawn(false);
    setSignerName("");
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirm = () => {
    if (!hasDrawn && !signerName.trim()) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    onConfirm({
      signatureDataUrl: hasDrawn ? dataUrl : null,
      signerName: signerName.trim() || "Signed",
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,13,13,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "520px",
          boxShadow: "8px 8px 0 var(--cream)",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "1.2rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--surface)",
          }}
        >
          <h3
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--ink)",
            }}
          >
            Draw Your Signature
          </h3>
          <button
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
              color: "var(--muted)",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "1.5rem" }}>
          {/* Signer Name */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--muted)",
                marginBottom: "0.4rem",
              }}
            >
              Your Full Name
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Alice Johnson"
              style={{
                width: "100%",
                padding: "0.6rem 0.9rem",
                border: "1.5px solid var(--border)",
                borderRadius: "4px",
                fontSize: "0.9rem",
                fontFamily: "DM Sans, sans-serif",
                background: "var(--surface)",
                color: "var(--ink)",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Canvas */}
          <div style={{ marginBottom: "0.6rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.4rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--muted)",
                }}
              >
                Draw Signature
              </label>
              <button
                onClick={clearCanvas}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  color: "var(--seal)",
                  fontWeight: 600,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Clear
              </button>
            </div>

            <canvas
              ref={canvasRef}
              width={460}
              height={140}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
              style={{
                width: "100%",
                height: "140px",
                border: "1.5px solid var(--border)",
                borderRadius: "4px",
                cursor: "crosshair",
                display: "block",
                background: "#fff",
                touchAction: "none",
              }}
            />
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--muted)",
                marginTop: "0.4rem",
              }}
            >
              Draw your signature above with your mouse or finger.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: "0.8rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "0.65rem 1.4rem",
              background: "transparent",
              border: "1.5px solid var(--border)",
              borderRadius: "4px",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--muted)",
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasDrawn && !signerName.trim()}
            style={{
              padding: "0.65rem 1.8rem",
              background:
                !hasDrawn && !signerName.trim() ? "var(--muted)" : "var(--ink)",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor:
                !hasDrawn && !signerName.trim() ? "not-allowed" : "pointer",
              fontFamily: "DM Sans, sans-serif",
              transition: "background 0.2s",
            }}
          >
            Apply Signature
          </button>
        </div>
      </div>
    </div>
  );
}
