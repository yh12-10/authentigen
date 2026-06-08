/**
 * Owner notifications. Delivers via SMTP email when configured
 * (see server/_core/email.ts), otherwise falls back to console logging.
 */
import { ENV, isSmtpConfigured } from "./env";
import { sendMail } from "./email";

export type NotificationPayload = {
  title: string;
  content: string;
};

export async function notifyOwner(input: NotificationPayload): Promise<boolean> {
  if (isSmtpConfigured() && ENV.ownerEmail) {
    const sent = await sendMail({
      to: ENV.ownerEmail,
      subject: `[AuthentiGen] ${input.title}`,
      text: input.content,
    });
    if (sent) return true;
  }
  console.log(`[notify] ${input.title}\n${input.content}`);
  return true;
}
