import { json, type RequestHandler } from '@sveltejs/kit';
import { roiInputSchema } from '$lib/schemas/roi';
import { calculateROI, roiConstants } from '$lib/server/roi';

export const POST: RequestHandler = async ({ request }) => {
  try {
    console.log('Simulate API called');
    console.log('Environment check - DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    const payload = await request.json();
    console.log('Request payload received:', Object.keys(payload));
    
    const parsed = roiInputSchema.safeParse(payload);

    if (!parsed.success) {
      console.error('Validation failed:', parsed.error.flatten());
      return json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    console.log('Calculating ROI...');
    const results = calculateROI(parsed.data);
    console.log('ROI calculation successful');
    
    return json({
      results,
      inputs: parsed.data,
      constants: roiConstants
    });
  } catch (error) {
    console.error('Simulate API error:', error);
    return json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
};
