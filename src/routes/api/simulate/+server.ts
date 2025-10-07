import { json, type RequestHandler } from '@sveltejs/kit';
import { roiInputSchema } from '$lib/schemas/roi';
import { calculateROI, roiConstants } from '$lib/server/roi';

export const POST: RequestHandler = async ({ request }) => {
  const payload = await request.json();
  const parsed = roiInputSchema.safeParse(payload);

  if (!parsed.success) {
    return json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const results = calculateROI(parsed.data);
  return json({
    results,
    inputs: parsed.data,
    constants: roiConstants
  });
};
