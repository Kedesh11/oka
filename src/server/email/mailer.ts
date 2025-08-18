import nodemailer from "nodemailer";

export function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !user || !pass) {
    throw new Error("SMTP non configuré: définissez SMTP_HOST, SMTP_USER, SMTP_PASS");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendMail(opts: { to: string; subject: string; html?: string; text?: string; from?: string }) {
  const transporter = createTransport();
  const from = opts.from || process.env.SMTP_FROM || `OKA Voyages <no-reply@oka>`;
  await transporter.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text });
}
