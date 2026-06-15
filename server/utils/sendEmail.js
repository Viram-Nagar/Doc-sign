const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send signing invitation email
 */
const sendSigningEmail = async ({
  toEmail,
  signerName,
  documentName,
  signingUrl,
  ownerName,
}) => {
  const mailOptions = {
    from: `"DocSign" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${ownerName} has requested your signature`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="
        margin: 0; padding: 0;
        background: #F5F0E8;
        font-family: Georgia, 'Times New Roman', serif;
      ">
        <div style="
          max-width: 560px;
          margin: 40px auto;
          background: #fff;
          border: 1px solid #D4CFC4;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 6px 6px 0 #EDE8DC;
        ">

          <!-- Header -->
          <div style="
            background: #0D0D0D;
            padding: 24px 32px;
            text-align: center;
          ">
            <span style="
              font-size: 22px;
              font-weight: 700;
              color: #fff;
              letter-spacing: -0.02em;
            ">
              Doc<span style="color: #C0392B;">Sign</span>
            </span>
          </div>

          <!-- Body -->
          <div style="padding: 36px 32px;">
            <p style="
              font-size: 13px;
              color: #7A7468;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              font-family: Arial, sans-serif;
              margin: 0 0 12px;
            ">
              Signature Request
            </p>

            <h1 style="
              font-size: 24px;
              font-weight: 700;
              color: #0D0D0D;
              margin: 0 0 16px;
              line-height: 1.2;
            ">
              ${ownerName} is requesting your signature
            </h1>

            <p style="
              font-size: 15px;
              color: #7A7468;
              line-height: 1.6;
              margin: 0 0 24px;
              font-family: Arial, sans-serif;
            ">
              You have been asked to review and sign
              <strong style="color: #0D0D0D;">${documentName}</strong>.
              Click the button below to open the document and sign it securely.
            </p>

            <!-- Document name card -->
            <div style="
              background: #FDFAF5;
              border: 1px solid #D4CFC4;
              border-left: 4px solid #C0392B;
              border-radius: 4px;
              padding: 14px 18px;
              margin-bottom: 28px;
              display: flex;
              align-items: center;
              gap: 10px;
            ">
              <span style="font-size: 20px;">📄</span>
              <span style="
                font-size: 14px;
                font-weight: 600;
                color: #0D0D0D;
                font-family: Arial, sans-serif;
                word-break: break-all;
              ">${documentName}</span>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 28px;">
              
                href="${signingUrl}"
                style="
                  display: inline-block;
                  background: #C0392B;
                  color: #fff;
                  padding: 14px 36px;
                  border-radius: 4px;
                  text-decoration: none;
                  font-size: 15px;
                  font-weight: 700;
                  font-family: Arial, sans-serif;
                  letter-spacing: 0.02em;
                "
              >
                Review & Sign Document →
              </a>
            </div>

            <!-- Expiry notice -->
            <div style="
              background: #FEF3C7;
              border: 1px solid #FDE68A;
              border-radius: 4px;
              padding: 12px 16px;
              margin-bottom: 24px;
            ">
              <p style="
                margin: 0;
                font-size: 13px;
                color: #92400E;
                font-family: Arial, sans-serif;
                line-height: 1.5;
              ">
                ⏳ This signing link will expire in <strong>7 days</strong>.
                After that, you will need to request a new link.
              </p>
            </div>

            <!-- URL fallback -->
            <p style="
              font-size: 12px;
              color: #7A7468;
              line-height: 1.5;
              font-family: Arial, sans-serif;
              margin: 0;
            ">
              If the button above doesn't work, copy and paste this URL into your browser:<br />
              <a href="${signingUrl}" style="color: #C0392B; word-break: break-all;">
                ${signingUrl}
              </a>
            </p>
          </div>

          <!-- Footer -->
          <div style="
            background: #FDFAF5;
            border-top: 1px solid #D4CFC4;
            padding: 20px 32px;
            text-align: center;
          ">
            <p style="
              font-size: 12px;
              color: #7A7468;
              margin: 0;
              font-family: Arial, sans-serif;
              line-height: 1.6;
            ">
              This request was sent by <strong>${ownerName}</strong> via DocSign.<br />
              If you didn't expect this email, you can safely ignore it.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendSigningEmail };
