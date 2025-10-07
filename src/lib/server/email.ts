import nodemailer, { type Transporter } from 'nodemailer';
import type { ROIInputs, ROIResults } from '$lib/schemas/roi';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const SMTP_HOST = privateEnv.SMTP_HOST;
const SMTP_PORT = privateEnv.SMTP_PORT;
const SMTP_USER = privateEnv.SMTP_USER;
const SMTP_PASS = privateEnv.SMTP_PASS;

const hasSmtpCredentials = Boolean(
  SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS
);

let transporter: Transporter | undefined;

function getTransporter(): Transporter | undefined {
  if (!hasSmtpCredentials) {
    return undefined;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  }

  return transporter;
}

export async function sendReportEmail(
  to: string,
  inputs: ROIInputs,
  results: ROIResults,
  pdfBuffer: Buffer
) {
  const mailer = getTransporter();
  if (!mailer) {
    return false;
  }

  const summaryLines = Object.entries(results)
    .map(([key, value]) => `${formatLabel(key)}: ${formatNumber(value)}`)
    .join('\n');

  const appUrl = publicEnv.PUBLIC_APP_URL ?? 'https://example.com';

  await mailer.sendMail({
    from: SMTP_USER,
    to,
    subject: 'Your Invoicing ROI Simulation Report',
    text:
      `Thanks for exploring automation ROI with us!\n\nKey results:\n${summaryLines}\n\n` +
      `View more at ${appUrl}.`,
    attachments: [
      {
        filename: 'roi-report.pdf',
        content: pdfBuffer
      }
    ]
  });

  return true;
}

function formatLabel(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatNumber(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'N/A';
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
