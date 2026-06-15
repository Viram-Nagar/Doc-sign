const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const axios = require("axios");

/**
 * Download a file from a URL and return as Buffer
 */
const downloadFile = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data);
};

/**
 * Convert percentage-based coords → pdf-lib point coords
 *
 * pdf-lib origin is BOTTOM-LEFT, browser origin is TOP-LEFT
 * so we flip the Y axis.
 *
 * @param {number} xPct   - x position as % of page width
 * @param {number} yPct   - y position as % of page height (from top)
 * @param {number} wPct   - width as % of page width
 * @param {number} hPct   - height as % of page height
 * @param {PDFPage} page
 */
const pctToPoints = (xPct, yPct, wPct, hPct, page) => {
  const { width, height } = page.getSize();
  const x = (xPct / 100) * width;
  const w = (wPct / 100) * width;
  const h = (hPct / 100) * height;
  // Flip Y: pdf-lib y is from bottom
  const y = height - (yPct / 100) * height - h;
  return { x, y, w, h };
};

/**
 * Embed a base64 PNG signature image onto the page
 */
const embedSignatureImage = async (pdfDoc, page, dataUrl, x, y, w, h) => {
  try {
    // Strip the data:image/png;base64, prefix
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    const imgBytes = Buffer.from(base64, "base64");
    const image = await pdfDoc.embedPng(imgBytes);
    page.drawImage(image, {
      x,
      y,
      width: w,
      height: h,
      opacity: 0.92,
    });
  } catch (err) {
    console.error("Image embed failed:", err.message);
    throw err;
  }
};

/**
 * Embed a text-based signature onto the page
 */
const embedSignatureText = async (pdfDoc, page, signerName, x, y, w, h) => {
  const font = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const fontSize = Math.min(h * 0.55, 18);

  // Signature name in italic
  page.drawText(signerName, {
    x: x + 4,
    y: y + h / 2 - fontSize / 2,
    size: fontSize,
    font,
    color: rgb(0.02, 0.27, 0.22), // dark green #055045
    maxWidth: w - 8,
  });

  // Thin underline
  page.drawLine({
    start: { x, y },
    end: { x: x + w, y },
    thickness: 0.5,
    color: rgb(0.02, 0.27, 0.22),
    opacity: 0.5,
  });
};

/**
 * Add audit stamp in the bottom margin of each signed page
 */
const addAuditStamp = async (pdfDoc, page, signedAt, signerName) => {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width } = page.getSize();
  const dateStr = new Date(signedAt).toUTCString();

  page.drawText(`Digitally signed by ${signerName} · ${dateStr} · DocSign`, {
    x: 28,
    y: 14,
    size: 6,
    font,
    color: rgb(0.55, 0.52, 0.47),
    maxWidth: width - 56,
  });
};

/**
 * Main function — generate the final signed PDF
 *
 * @param {string}   originalUrl  - Supabase signed URL of the original PDF
 * @param {Array}    signatures   - Array of Signature documents (status: signed)
 * @returns {Uint8Array}          - Final PDF bytes
 */
const generateSignedPdf = async (originalUrl, signatures) => {
  // 1. Download original PDF
  const pdfBytes = await downloadFile(originalUrl);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  // Track which pages we've stamped
  const stampedPages = new Set();

  // 2. Embed each signed signature field
  for (const sig of signatures) {
    if (sig.status !== "signed") continue;

    // pdf-lib pages are 0-indexed
    const pageIndex = (sig.page || 1) - 1;
    if (pageIndex < 0 || pageIndex >= pages.length) continue;

    const page = pages[pageIndex];
    const { x, y, w, h } = pctToPoints(
      sig.x,
      sig.y,
      sig.width,
      sig.height,
      page,
    );

    if (sig.signatureDataUrl) {
      await embedSignatureImage(pdfDoc, page, sig.signatureDataUrl, x, y, w, h);
    } else {
      await embedSignatureText(
        pdfDoc,
        page,
        sig.signerName || "Signed",
        x,
        y,
        w,
        h,
      );
    }

    // Audit stamp on this page (once)
    if (!stampedPages.has(pageIndex)) {
      await addAuditStamp(
        pdfDoc,
        page,
        sig.signedAt,
        sig.signerName || "Unknown",
      );
      stampedPages.add(pageIndex);
    }
  }

  // 3. Add document-level metadata
  pdfDoc.setTitle(`Signed Document`);
  pdfDoc.setSubject("Digitally signed via DocSign");
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  // 4. Serialize to bytes
  const signedPdfBytes = await pdfDoc.save();
  return signedPdfBytes;
};

module.exports = generateSignedPdf;
