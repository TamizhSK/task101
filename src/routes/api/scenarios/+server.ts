import { json, type RequestHandler } from '@sveltejs/kit';
import { scenarioCreateSchema } from '$lib/schemas/roi';
import { prisma } from '$lib/server/db';
import { calculateROI } from '$lib/server/roi';

export const GET: RequestHandler = async () => {
  const scenarios = await prisma.scenario.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return json(scenarios);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const parsed = scenarioCreateSchema.safeParse(body);

  if (!parsed.success) {
    return json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const { name, data } = parsed.data;
  const results = calculateROI(data);

  const scenario = await prisma.scenario.create({
    data: {
      name,
      data,
      results
    }
  });

  return json(scenario, { status: 201 });
};
