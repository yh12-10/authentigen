/**
 * Optional SMTP email via nodemailer. Disabled gracefully when unconfigured —
 * callers get `false` and should fall back (e.g. console logging) rather than fail.
 * The transport is created lazily so deployments without SMTP never load it.
 */
import type { Transporter } from "nodemailer";
import { ENV, isSmtpConfigured } from "./env";

let _transport: Transporter | null = null;

async function getTransport(): Promise<Transporter> {
  if (_transport) return _transport;
  const { default: nodemailer } = await import("nodemailer");
  _transport = nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpSecure,
    auth: ENV.smtpUser ? { user: ENV.smtpUser, pass: ENV.smtpPassword } : undefined,
  });
  return _transport;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  if (!isSmtpConfigured()) return false;
  try {
    const transport = await getTransport();
    await transport.sendMail({
      from: ENV.smtpFrom,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    return true;
  } catch (err) {
    console.warn("[email] sendMail failed:", err);
    return false;
  }
}

/** Best-effort "your result is ready" notice. Never throws. */
export async function sendJobCompletionEmail(params: {
  to: string;
  jobId: number;
  type: "image" | "video";
}): Promise<void> {
  if (!isSmtpConfigured()) return;
  const link = `${ENV.appBaseUrl.replace(/\/+$/, "")}/process/${params.jobId}`;
  await sendMail({
    to: params.to,
    subject: "Your AuthentiGen result is ready",
    text: `Your ${params.type} has finished processing.\n\nView and download it here:\n${link}`,
  }).catch(() => {});
}

export { isSmtpConfigured };
