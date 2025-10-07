import PDFDocument from 'pdfkit';
import type { ROIInputs, ROIResults } from '$lib/schemas/roi';

export async function generateReport(
  inputs: ROIInputs,
  results: ROIResults
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => {
      try {
        resolve(Buffer.concat(chunks));
      } catch (err) {
        reject(err);
      }
    });

    doc
      .fontSize(24)
      .text('Invoicing ROI Simulation Report', { align: 'center' })
      .moveDown();

    doc
      .fontSize(12)
      .text(`Generated on: ${new Date().toLocaleString()}`)
      .moveDown(1.5);

    doc.fontSize(16).text('Inputs', { underline: true }).moveDown(0.5);
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

function formatLabel(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value: unknown) {
  if (typeof value === 'number') {
    return formatNumber(value);
  }
  return String(value);
}

function formatNumber(value: unknown) {
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
