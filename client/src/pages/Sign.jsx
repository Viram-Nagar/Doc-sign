console.count("SIGN PAGE RENDER");
console.count("SIGN COMPONENT");

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { getDocByToken, signViaToken } from "../api/share";
import { signerReject } from "../api/status";

import workerSrc from "pdfjs-dist/build/pdf.worker?url";
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
export default function Sign() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState(null);
  const [signerName, setSignerName] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log("fileUrl changed");
  }, [fileUrl]);

  useEffect(() => {
    console.log("dims changed", dims);
  }, [dims]);

  useEffect(() => {
    console.log("currentPage changed", currentPage);
  }, [currentPage]);

  useEffect(() => {
    console.log("scale changed", scale);
  }, [scale]);

  useEffect(() => {
    console.log("signatures changed");
  }, [signatures]);

  // ── Load document via token ──────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getDocByToken(token);
        setDoc(data.document);
        setFileUrl(data.document.fileUrl);
        setSignatures(data.signatures);
      } catch (err) {
        setError(
          err.response?.data?.message || "Invalid or expired signing link",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  // ── Measure PDF container ────────────────────────────────
  // const measureContainer = () => {
  //   console.count("SIGN PAGE RENDER");
  //   if (!containerRef.current) return;
  //   const rect = containerRef.current.getBoundingClientRect();
  //   setDims({ width: rect.width, height: rect.height });
  // };

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

  // ── Canvas setup ─────────────────────────────────────────
  const initCanvas = () => {
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
  };

  useEffect(() => {
    if (drawerOpen) setTimeout(initCanvas, 50);
  }, [drawerOpen]);

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

  // ── Submit signature ─────────────────────────────────────
  const handleSign = async () => {
    if (!activeFieldId) return;
    setSubmitting(true);

    try {
      const canvas = canvasRef.current;
      const signatureDataUrl = hasDrawn ? canvas.toDataURL("image/png") : null;

      const { data } = await signViaToken(token, {
        signatureId: activeFieldId,
        signatureDataUrl,
        signerName: signerName.trim() || doc?.signerEmail || "Signer",
      });

      // Update local signatures state
      setSignatures((prev) => prev.filter((s) => s._id !== activeFieldId));

      setDrawerOpen(false);
      setActiveFieldId(null);

      if (data.documentFullySigned) {
        setSuccess(true);
      }
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to apply signature. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignerReject = async (reason) => {
    setRejecting(true);
    try {
      await signerReject(token, { reason });
      setRejectOpen(false);
      setRejected(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject. Try again.");
    } finally {
      setRejecting(false);
    }
  };

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

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
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
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Loading document...
        </p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────
  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--paper)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "2.5rem",
            textAlign: "center",
            boxShadow: "6px 6px 0 var(--cream)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⛔</div>
          <h2
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "1.4rem",
              color: "var(--ink)",
              marginBottom: "0.5rem",
            }}
          >
            Link Unavailable
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.9rem",
              lineHeight: 1.6,
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────
  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--paper)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "3rem 2.5rem",
            textAlign: "center",
            boxShadow: "6px 6px 0 var(--cream)",
          }}
        >
          {/* Animated seal */}
          <div
            style={{
              width: "80px",
              height: "80px",
              border: "3px solid #059669",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "2rem",
              background: "#D1FAE5",
            }}
          >
            ✓
          </div>
          <h2
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "var(--ink)",
              marginBottom: "0.6rem",
            }}
          >
            Document Signed!
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              marginBottom: "1.5rem",
            }}
          >
            You have successfully signed <strong>{doc?.originalName}</strong>.
            The document owner has been notified.
          </p>
          <div
            style={{
              padding: "0.8rem 1rem",
              background: "var(--cream)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              fontSize: "0.8rem",
              color: "var(--muted)",
            }}
          >
            Signed on{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Rejected screen ──────────────────────────────────────
  if (rejected) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--paper)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "3rem 2.5rem",
            textAlign: "center",
            boxShadow: "6px 6px 0 #FEE2E2",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              border: "3px solid #991B1B",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "2rem",
              background: "#FEE2E2",
              color: "#991B1B",
            }}
          >
            ✕
          </div>
          <h2
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "var(--ink)",
              marginBottom: "0.6rem",
            }}
          >
            Document Rejected
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              marginBottom: "1.5rem",
            }}
          >
            You have rejected <strong>{doc?.originalName}</strong>. The document
            owner has been notified.
          </p>
          {rejectReason && (
            <div
              style={{
                padding: "0.8rem 1rem",
                background: "#FEF3C7",
                border: "1px solid #FDE68A",
                borderRadius: "4px",
                fontSize: "0.82rem",
                color: "#92400E",
                fontStyle: "italic",
                marginBottom: "1rem",
              }}
            >
              Your reason: "{rejectReason}"
            </div>
          )}
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--muted)",
            }}
          >
            You can safely close this tab.
          </p>
        </div>
      </div>
    );
  }

  // ── Main signing UI ──────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <nav
        style={{
          borderBottom: "1px solid var(--border)",
          background: "#fff",
          padding: "0 1.5rem",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "var(--ink)",
          }}
        >
          Doc<span style={{ color: "var(--seal)" }}>Sign</span>
        </span>
        <div
          style={{
            fontSize: "0.78rem",
            color: "var(--muted)",
            background: "var(--cream)",
            border: "1px solid var(--border)",
            padding: "0.3rem 0.8rem",
            borderRadius: "99px",
          }}
        >
          🔒 Secure Signing Session
        </div>
      </nav>

      {/* Doc info banner */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid var(--border)",
          padding: "0.8rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          flexShrink: 0,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            {doc?.originalName}
          </p>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--muted)",
              margin: "2px 0 0",
            }}
          >
            {signatures.length} field{signatures.length !== 1 ? "s" : ""}{" "}
            remaining to sign
          </p>
        </div>
        <div
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#B45309",
            background: "#FEF3C7",
            border: "1px solid #FDE68A",
            padding: "0.3rem 0.8rem",
            borderRadius: "2px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Awaiting Signature
        </div>
      </div>

      {/* Main: PDF + instructions */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          height: "calc(100vh - 56px - 52px)",
        }}
      >
        {/* PDF area */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            background: "#E8E4DC",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.5rem 1rem",
              background: "#fff",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <TBtn
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
              >
                ‹
              </TBtn>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--muted)",
                  minWidth: "80px",
                  textAlign: "center",
                }}
              >
                Page {currentPage} of {numPages || "…"}
              </span>
              <TBtn
                onClick={() => setCurrentPage((p) => Math.min(p + 1, numPages))}
                disabled={currentPage >= numPages}
              >
                ›
              </TBtn>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <TBtn
                onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
                disabled={scale <= 0.5}
              >
                −
              </TBtn>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--muted)",
                  minWidth: "40px",
                  textAlign: "center",
                }}
              >
                {Math.round(scale * 100)}%
              </span>
              <TBtn
                onClick={() => setScale((s) => Math.min(s + 0.2, 2.5))}
                disabled={scale >= 2.5}
              >
                +
              </TBtn>
            </div>
          </div>

          {/* PDF + overlays */}
          <div
            style={{
              padding: "2rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              ref={containerRef}
              style={{
                position: "relative",
                display: "inline-block",
                lineHeight: 0,
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
              }}
            >
              <Document
                file={pdfFile}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={null}
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  onRenderSuccess={() => setTimeout(measureContainer, 50)}
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
                      Loading page…
                    </div>
                  }
                />
              </Document>

              {/* Clickable signature fields */}
              {dims.width > 0 &&
                pageSignatures.map((sig) => {
                  const leftPx = (sig.x / 100) * dims.width;
                  const topPx = (sig.y / 100) * dims.height;
                  const wPx = (sig.width / 100) * dims.width;
                  const hPx = (sig.height / 100) * dims.height;

                  return (
                    <div
                      key={sig._id}
                      onClick={() => {
                        setActiveFieldId(sig._id);
                        setDrawerOpen(true);
                      }}
                      style={{
                        position: "absolute",
                        left: leftPx,
                        top: topPx,
                        width: wPx,
                        height: hPx,
                        border: "2px dashed var(--seal)",
                        background: "rgba(192,57,43,0.07)",
                        borderRadius: "3px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.15s, border-color 0.15s",
                        zIndex: 10,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(192,57,43,0.14)";
                        e.currentTarget.style.borderColor = "var(--ink)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(192,57,43,0.07)";
                        e.currentTarget.style.borderColor = "var(--seal)";
                      }}
                    >
                      <span
                        style={{
                          fontSize: "clamp(7px, 1vw, 11px)",
                          fontWeight: 700,
                          color: "var(--seal)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          pointerEvents: "none",
                        }}
                      >
                        ✍ Click to Sign
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right instructions panel */}
        <div
          style={{
            width: "240px",
            flexShrink: 0,
            background: "#fff",
            borderLeft: "1px solid var(--border)",
            padding: "1.2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            overflowY: "auto",
          }}
        >
          <h3
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            How to sign
          </h3>

          {[
            {
              n: "1",
              t: "Find the field",
              d: "Look for the dashed red box on the document.",
            },
            {
              n: "2",
              t: "Click to sign",
              d: "Click on the field to open the signature drawer.",
            },
            {
              n: "3",
              t: "Draw & confirm",
              d: "Draw your signature and click Apply.",
            },
          ].map((step) => (
            <div
              key={step.n}
              style={{
                display: "flex",
                gap: "0.7rem",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "var(--ink)",
                  color: "#fff",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                {step.n}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--ink)",
                    margin: "0 0 2px",
                  }}
                >
                  {step.t}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--muted)",
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {step.d}
                </p>
              </div>
            </div>
          ))}

          {/* Remaining fields indicator */}
          <div
            style={{
              marginTop: "auto",
              padding: "0.8rem",
              background: signatures.length === 0 ? "#D1FAE5" : "var(--cream)",
              border: `1px solid ${signatures.length === 0 ? "#6EE7B7" : "var(--border)"}`,
              borderRadius: "6px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: signatures.length === 0 ? "#065F46" : "var(--ink)",
                margin: 0,
              }}
            >
              {signatures.length === 0
                ? "✅ All fields signed!"
                : `${signatures.length} field${signatures.length !== 1 ? "s" : ""} left`}
            </p>
          </div>
          {/* Bottom of right instructions panel — add below field counter */}
          <button
            onClick={() => setRejectOpen(true)}
            style={{
              width: "100%",
              padding: "0.6rem",
              background: "transparent",
              border: "1.5px solid #FECACA",
              borderRadius: "4px",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#991B1B",
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
              transition: "all 0.15s",
              marginTop: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FEE2E2";
              e.currentTarget.style.borderColor = "#991B1B";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "#FECACA";
            }}
          >
            ✕ Decline to Sign
          </button>
        </div>
      </div>

      {/* ── Signature Drawer Modal ─────────────────────────── */}
      {drawerOpen && (
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
              maxWidth: "500px",
              boxShadow: "8px 8px 0 var(--cream)",
              overflow: "hidden",
            }}
          >
            {/* Modal header */}
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
                  margin: 0,
                }}
              >
                Sign Document
              </h3>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setActiveFieldId(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  color: "var(--muted)",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "1.5rem" }}>
              {/* Name */}
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
                  placeholder={doc?.signerEmail || "Your name"}
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
              <div>
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
                  width={440}
                  height={130}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                  style={{
                    width: "100%",
                    height: "130px",
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
                  Draw with mouse or finger.
                </p>
              </div>
            </div>

            {/* Modal footer */}
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
                onClick={() => {
                  setDrawerOpen(false);
                  setActiveFieldId(null);
                }}
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
                onClick={handleSign}
                disabled={submitting || (!hasDrawn && !signerName.trim())}
                style={{
                  padding: "0.65rem 1.8rem",
                  background:
                    submitting || (!hasDrawn && !signerName.trim())
                      ? "var(--muted)"
                      : "var(--seal)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor:
                    submitting || (!hasDrawn && !signerName.trim())
                      ? "not-allowed"
                      : "pointer",
                  fontFamily: "DM Sans, sans-serif",
                  transition: "background 0.2s",
                }}
              >
                {submitting ? "Applying..." : "✍ Apply Signature"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reject modal */}
      {rejectOpen && (
        <RejectModal
          title="Decline to Sign"
          subtitle="Please let the sender know why you are declining."
          confirmLabel="Decline Document"
          onConfirm={(reason) => {
            setRejectReason(reason);
            handleSignerReject(reason);
          }}
          onCancel={() => setRejectOpen(false)}
          loading={rejecting}
        />
      )}
    </div>
  );
}

function TBtn({ onClick, disabled, children }) {
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
        fontFamily: "DM Sans, sans-serif",
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}
