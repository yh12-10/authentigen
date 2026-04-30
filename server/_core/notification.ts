/**
 * Lightweight notification stub — no external email/SMS provider.
 * Replace with a real one (Resend, Postmark, SendGrid, etc.) when needed.
 */

export type NotificationPayload = {
  title: string;
  content: string;
};

export async function notifyOwner(input: NotificationPayload): Promise<boolean> {
  console.log(`[notify] ${input.title}\n${input.content}`);
  return true;
}
