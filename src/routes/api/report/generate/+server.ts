import { error, json, type RequestHandler } from '@sveltejs/kit';
import { reportRequestSchema } from '$lib/schemas/roi';
import { prisma } from '$lib/server/db';
import { calculateROI } from '$lib/server/roi';
import { generateReport } from '$lib/server/pdf';
import { sendReportEmail } from '$lib/server/email';

export const POST: RequestHandler = async ({ request }) => {
  const payload = await request.json();
  const parsed = reportRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const { email, scenario_data } = parsed.data;
  const results = calculateROI(scenario_data);

  await prisma.emailCapture.create({
    data: { email }
  });

  const pdfBuffer = await generateReport(scenario_data, results);

  try {
    await sendReportEmail(email, scenario_data, results, pdfBuffer);
  } catch (err) {
    console.error('Failed to send report email', err);
  }

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=roi-report.pdf'
    }
  });
};
