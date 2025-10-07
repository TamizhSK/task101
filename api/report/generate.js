import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['error'],
  errorFormat: 'pretty',
});

// ROI calculation function (same as simulate.js)
function calculateROI(inputs) {
  const CONSTANTS = {
    automated_cost_per_invoice: 0.2,
    error_rate_auto_percent: 0.1,
    time_saved_per_invoice_minutes: 8,
    min_roi_boost_factor: 1.1
  };

  const BIAS_BONUS_PER_ERROR_POINT = 0.0025;

  const labor_cost_manual =
    inputs.num_ap_staff *
    inputs.hourly_wage *
    inputs.avg_hours_per_invoice *
    inputs.monthly_invoice_volume;

  const automation_cost =
    inputs.monthly_invoice_volume * CONSTANTS.automated_cost_per_invoice;

  const baseline_error_cost =
    inputs.monthly_invoice_volume *
    (inputs.error_rate_manual / 100) *
    inputs.error_cost;

  const automation_error_cost =
    inputs.monthly_invoice_volume *
    (CONSTANTS.error_rate_auto_percent / 100) *
    inputs.error_cost;

  const error_savings = baseline_error_cost - automation_error_cost;

  const raw_monthly_savings =
    labor_cost_manual + error_savings - automation_cost;

  const bias_multiplier = Math.max(
    CONSTANTS.min_roi_boost_factor,
    1 + inputs.error_rate_manual * BIAS_BONUS_PER_ERROR_POINT
  );

  const monthly_savings = raw_monthly_savings * bias_multiplier;

  const cumulative_savings =
    monthly_savings * inputs.time_horizon_months;

  const net_savings =
    cumulative_savings - inputs.one_time_implementation_cost;

  const payback_months = monthly_savings > 0
    ? inputs.one_time_implementation_cost / monthly_savings
    : null;

  const roi_base = inputs.one_time_implementation_cost || 1;
  const roi_percentage =
    ((monthly_savings * inputs.time_horizon_months) - inputs.one_time_implementation_cost) /
    roi_base * 100;

  return {
    monthly_savings,
    payback_months,
    roi_percentage,
    cumulative_savings,
    net_savings,
    error_savings,
    labor_cost_saved: labor_cost_manual,
    automation_cost,
    labor_cost_manual,
    baseline_error_cost,
    automation_error_cost,
    bias_multiplier
  };
}

// PDF generation function
async function generateReport(inputs, results) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => {
      try {
        resolve(Buffer.concat(chunks));
      } catch (err) {
        reject(err);
      }
    });

    // Generate PDF content
    doc
      .fontSize(24)
      .text('Invoicing ROI Simulation Report', { align: 'center' })
      .moveDown();

    doc
      .fontSize(12)
      .text(`Generated on: ${new Date().toLocaleString()}`)
      .moveDown(1.5);

    doc.fontSize(16).text('Input Parameters', { underline: true }).moveDown(0.5);
    Object.entries(inputs).forEach(([key, value]) => {
      doc.fontSize(12).text(`${formatLabel(key)}: ${formatValue(value)}`);
    });

    doc.moveDown(1.5);
    doc.fontSize(16).text('Results', { underline: true }).moveDown(0.5);
    Object.entries(results).forEach(([key, value]) => {
      doc
        .fontSize(12)
        .text(`${formatLabel(key)}: ${formatNumber(value)}`);
    });

    doc.end();
  });
}

// Email sending function
async function sendReportEmail(to, inputs, results, pdfBuffer) {
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = process.env.SMTP_PORT;
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;

  const hasSmtpCredentials = Boolean(
    SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS
  );

  if (!hasSmtpCredentials) {
    console.log('SMTP credentials not configured, skipping email');
    return false;
  }

  const transporter = nodemailer.createTransporter({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  const summaryLines = Object.entries(results)
    .map(([key, value]) => `${formatLabel(key)}: ${formatNumber(value)}`)
    .join('\n');

  const appUrl = process.env.PUBLIC_APP_URL || 'https://your-app.vercel.app';

  await transporter.sendMail({
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

// Helper functions
function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value) {
  if (typeof value === 'number') {
    return formatNumber(value);
  }
  return String(value);
}

function formatNumber(value) {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  if (typeof value !== 'number') {
    return String(value);
  }
  if (!Number.isFinite(value)) {
    return 'N/A';
  }
  if (Math.abs(value) >= 1) {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 2
    });
  }
  return value.toFixed(4);
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Report generation API called:', req.method);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed',
        allowed: ['POST']
      });
    }

    const { email, scenario_data } = req.body;
    console.log('Request keys:', Object.keys(req.body));

    // Validation
    if (!email || !scenario_data) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Both email and scenario_data are required'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        details: 'Please provide a valid email address'
      });
    }

    console.log('Generating report for email:', email);

    // Calculate ROI
    const results = calculateROI(scenario_data);
    console.log('ROI calculated successfully');

    // Save email to database
    console.log('Saving email capture...');
    await prisma.emailCapture.create({
      data: { email }
    });
    console.log('Email captured successfully');

    // Generate PDF
    console.log('Generating PDF...');
    const pdfBuffer = await generateReport(scenario_data, results);
    console.log('PDF generated successfully, size:', pdfBuffer.length);

    // Send email (optional)
    try {
      console.log('Attempting to send email...');
      await sendReportEmail(email, scenario_data, results, pdfBuffer);
      console.log('Email sent successfully');
    } catch (err) {
      console.error('Failed to send report email (non-blocking):', err);
    }

    // Return PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=roi-report.pdf');
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('Report generation error:', error);
    
    // Handle Prisma-specific errors
    if (error.code && error.code.startsWith('P')) {
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to save email capture',
        code: error.code
      });
    }

    return res.status(500).json({
      error: 'Failed to generate report',
      message: error.message || 'Unknown error occurred'
    });
  } finally {
    await prisma.$disconnect();
  }
}