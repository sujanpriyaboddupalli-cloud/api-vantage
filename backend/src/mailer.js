/**
 * Email alerts for monitor state changes.
 *
 * Uses plain SMTP through nodemailer so it works with the Gmail account users
 * sign in with (App Password) or any other provider. If SMTP isn't configured
 * the helpers no-op, so the checker keeps running in local dev.
 */
const nodemailer = require("nodemailer");
const config = require("./config");

let transporter = null;

function getTransporter() {
  if (!config.smtp.host || !config.smtp.user) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  }
  return transporter;
}

async function send(to, subject, html) {
  const tx = getTransporter();
  if (!tx || !to) {
    console.log(`[mailer] skipped (SMTP not configured): ${subject}`);
    return;
  }
  try {
    await tx.sendMail({ from: config.smtp.from, to, subject, html });
    console.log(`[mailer] sent "${subject}" to ${to}`);
  } catch (err) {
    console.error("[mailer]", err.message);
  }
}

const wrap = (accent, heading, body) => `
  <div style="font-family:Inter,Arial,sans-serif;background:#0A0B0F;padding:32px;color:#E7E9EE">
    <div style="max-width:520px;margin:0 auto;background:#11131A;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:28px">
      <p style="margin:0 0 6px;font:600 12px/1 ui-monospace,monospace;letter-spacing:.12em;color:${accent}">API SENTINEL</p>
      <h1 style="margin:0 0 14px;font-size:20px;color:#fff">${heading}</h1>
      ${body}
      <p style="margin:22px 0 0;font-size:12px;color:#8A90A2">You receive this because you own this monitor in API Sentinel.</p>
    </div>
  </div>`;

const row = (label, value) =>
  `<p style="margin:4px 0;font-size:14px;color:#C7CBD6"><strong style="color:#fff">${label}:</strong> ${value}</p>`;

async function sendDownAlert(user, monitor, reason) {
  await send(
    user?.email,
    `🔴 DOWN — ${monitor.name}`,
    wrap(
      "#F87171",
      `${monitor.name} is down`,
      row("Endpoint", `${monitor.method} ${monitor.url}`) +
        row("Reason", reason) +
        row("Region", monitor.region) +
        row("Detected", new Date().toUTCString()),
    ),
  );
}

async function sendRecoveredAlert(user, monitor, responseTimeMs, downMinutes) {
  await send(
    user?.email,
    `🟢 RECOVERED — ${monitor.name}`,
    wrap(
      "#34D399",
      `${monitor.name} has recovered`,
      row("Endpoint", `${monitor.method} ${monitor.url}`) +
        row("Response time", `${responseTimeMs}ms`) +
        row("Downtime", `${downMinutes} min`) +
        row("Recovered", new Date().toUTCString()),
    ),
  );
}

module.exports = { sendDownAlert, sendRecoveredAlert };
