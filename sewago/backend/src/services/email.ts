import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.EMAIL_FROM || "no-reply@sewago.app";

export const isEmailConfigured = Boolean(smtpHost && smtpUser && smtpPass);

let transporter: nodemailer.Transporter | null = null;
function getTransporter(): nodemailer.Transporter {
  if (!isEmailConfigured) {
    throw new Error("SMTP is not configured");
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: { user: smtpUser!, pass: smtpPass! },
    });
  }
  return transporter;
}

export async function sendBookingConfirmation(params: {
  to: string;
  bookingId: string;
  serviceTitle: string;
  scheduledAt: Date;
}) {
  if (!isEmailConfigured) return false;
  const t = getTransporter();
  const { to, bookingId, serviceTitle, scheduledAt } = params;
  await t.sendMail({
    from: fromEmail,
    to,
    subject: `Your SewaGo booking is confirmed (#${bookingId})`,
    text: `Thanks for booking ${serviceTitle} on ${scheduledAt.toLocaleString()}. Your booking id is ${bookingId}.`,
  });
  return true;
}

