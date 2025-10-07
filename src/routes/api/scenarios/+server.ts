import { json, type RequestHandler } from '@sveltejs/kit';
import { scenarioCreateSchema } from '$lib/schemas/roi';
import { calculateROI } from '$lib/server/roi';

// Lazy import Prisma to avoid cold start issues
async function getPrisma() {
  const { prisma } = await import('$lib/server/db');
  return prisma;
}

export const GET: RequestHandler = async () => {
  try {
    console.log('Scenarios GET API called');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    const prisma = await getPrisma();
    const scenarios = await prisma.scenario.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('Found scenarios:', scenarios.length);
    return json(scenarios);
  } catch (error) {
    console.error('Scenarios GET error:', error);
    return json(
      { 
        error: 'Failed to fetch scenarios',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    console.log('Scenarios POST API called');
    
    const body = await request.json();
    console.log('Request body keys:', Object.keys(body));
    
    const parsed = scenarioCreateSchema.safeParse(body);

    if (!parsed.success) {
      console.error('Validation failed:', parsed.error.flatten());
      return json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    const { name, data } = parsed.data;
    console.log('Creating scenario:', name);
    
    const results = calculateROI(data);
    console.log('ROI calculated, saving to database...');

    const prisma = await getPrisma();
    const scenario = await prisma.scenario.create({
      data: {
        name,
        data,
        results
      }
    });

    console.log('Scenario created successfully:', scenario.id);
    return json(scenario, { status: 201 });
  } catch (error) {
    console.error('Scenarios POST error:', error);
    return json(
      { 
        error: 'Failed to create scenario',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
};
