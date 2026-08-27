// Resend Email Delivery Engine for Backlox Platform
const RESEND_API_URL = "https://api.resend.com/emails";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Backlox <onboarding@resend.dev>";
const DEFAULT_TAG = process.env.RESEND_TAG || "rt_backlox";

/**
 * Universal Resend Email Sender
 */
async function sendEmail({ to, subject, html, text, tags = [] }) {
  if (!RESEND_API_KEY) {
    console.warn("⚠️ Resend API Key is not set. Email skipped for:", to);
    return { success: false, message: "Resend API Key missing" };
  }

  try {
    const formattedTags = [
      { name: "tag", value: DEFAULT_TAG },
      ...tags.map((t) => (typeof t === "string" ? { name: "category", value: t } : t)),
    ];

    const payload = {
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ""),
      tags: formattedTags,
    };

    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Resend API Error:", data);
      return { success: false, error: data };
    }

    console.log(`✉️ Email sent successfully via Resend to ${to} [ID: ${data.id}]`);
    return { success: true, data };
  } catch (err) {
    console.error("❌ Failed to send email via Resend:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Modern HTML Email Wrapper Template
 */
function emailLayout(content, title = "Backlox Notification") {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #0b0f19;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #e2e8f0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background: #111827;
        border: 1px solid #1f2937;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      }
      .header {
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
        padding: 32px 24px;
        text-align: center;
        border-bottom: 1px solid #374151;
      }
      .logo-text {
        font-size: 26px;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: #ffffff;
        text-transform: uppercase;
        margin: 0;
      }
      .logo-sub {
        font-size: 13px;
        color: #a5b4fc;
        margin-top: 6px;
        letter-spacing: 0.04em;
      }
      .content {
        padding: 32px 24px;
        font-size: 15px;
        line-height: 1.6;
        color: #cbd5e1;
      }
      .button {
        display: inline-block;
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        color: #ffffff !important;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 10px;
        font-weight: 600;
        margin: 24px 0;
        text-align: center;
      }
      .card-box {
        background: #1f2937;
        border: 1px solid #374151;
        border-radius: 12px;
        padding: 16px 20px;
        margin: 20px 0;
      }
      .footer {
        background-color: #0b0f19;
        padding: 24px;
        text-align: center;
        font-size: 12px;
        color: #64748b;
        border-top: 1px solid #1f2937;
      }
      .footer a {
        color: #818cf8;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="logo-text">🎓 BACKLOX</h1>
        <div class="logo-sub">Academic & Career Intelligence Platform</div>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Backlox Universe. All rights reserved.</p>
        <p>You received this email because you have an account or active session on Backlox.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Template: Welcome Email
 */
async function sendWelcomeEmail({ name, email, role = "trainee" }) {
  const isInstructor = role === "instructor";
  const portalName = isInstructor ? "Instructor Creator Studio" : "Student Learning Hub & Roadmap";

  const content = `
    <h2>Welcome to Backlox, ${name}! 👋</h2>
    <p>We are thrilled to have you join the <strong>Backlox Career Intelligence Universe</strong>.</p>
    
    <div class="card-box">
      <strong>Your Account Summary:</strong><br>
      • <strong>Role:</strong> ${isInstructor ? "Verified Instructor / Creator" : "Scholar / Trainee"}<br>
      • <strong>Registered Email:</strong> ${email}<br>
      • <strong>Workspace:</strong> ${portalName}
    </div>

    <p>${
      isInstructor
        ? "You can now publish structured video courses, manage modular syllabi in ₹ INR, grade student assignments, and track real-time enrollment revenue."
        : "You now have access to comprehensive Post-12th Engineering & Medical Roadmaps, Aptitude Exam Practice Matrices, and personalized career roadmaps."
    }</p>

    <div style="text-align: center;">
      <a href="https://pathward.vercel.app/login" class="button">Access Backlox Portal →</a>
    </div>

    <p style="font-size: 13px; color: #94a3b8;">If you did not create this account, please contact our support team immediately.</p>
  `;

  return sendEmail({
    to: email,
    subject: `🎓 Welcome to Backlox — Your Career Roadmap Starts Here`,
    html: emailLayout(content, "Welcome to Backlox"),
    tags: ["welcome", role],
  });
}

/**
 * Template: Password Reset Request
 */
async function sendPasswordResetEmail({ name, email, resetCode = "849201" }) {
  const content = `
    <h2>Password Reset Request 🔐</h2>
    <p>Hi ${name || "there"},</p>
    <p>We received a request to reset your Backlox account password. Use the secure authorization code below:</p>

    <div class="card-box" style="text-align: center; font-size: 28px; font-weight: 800; letter-spacing: 0.25em; color: #818cf8;">
      ${resetCode}
    </div>

    <p>This code is valid for <strong>15 minutes</strong>. If you did not make this request, you can safely ignore this email — your password remains secure.</p>

    <div style="text-align: center;">
      <a href="https://pathward.vercel.app/login" class="button">Go to Login Screen →</a>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `🔐 Reset your Backlox account password`,
    html: emailLayout(content, "Password Reset"),
    tags: ["password-reset"],
  });
}

/**
 * Template: Backlox Pro Subscription Confirmation
 */
async function sendProUpgradeEmail({ name, email, planName = "Backlox Pro", amount = "₹499", orderId }) {
  const content = `
    <h2>🎉 You are now a Backlox Pro Scholar!</h2>
    <p>Hi ${name || "Scholar"},</p>
    <p>Thank you for subscribing to <strong>${planName}</strong>. Your payment was verified and your account is upgraded with Lifetime Pro privileges.</p>

    <div class="card-box">
      <strong>💎 Unlocked Pro Features:</strong><br>
      • <strong>Unlimited MCQ Practice Gym:</strong> Full access to thousands of placement and entrance tests.<br>
      • <strong>Step-by-Step Solutions:</strong> Mathematical derivations, formulas, and hints.<br>
      • <strong>AI Study Assistant & Summarizer:</strong> Instant lecture distillation and smart note pad.<br>
      • <strong>Masterclass Access:</strong> Full stream curriculum and video courses.<br>
      • <strong>Transaction Ref:</strong> <code style="color: #a5b4fc;">${orderId || "ONLINE_VERIFIED"}</code>
    </div>

    <div style="text-align: center;">
      <a href="https://pathward.vercel.app/dashboard" class="button">Open Your Pro Dashboard →</a>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `💎 Receipt & Activation: Welcome to ${planName}!`,
    html: emailLayout(content, "Backlox Pro Activation"),
    tags: ["pro-upgrade", "payment-receipt"],
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendProUpgradeEmail,
  RESEND_API_KEY,
  FROM_EMAIL,
  DEFAULT_TAG,
};
