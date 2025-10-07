import { error, json, type RequestHandler } from '@sveltejs/kit';
import { scenarioIdParamSchema } from '$lib/schemas/roi';
import { prisma } from '$lib/server/db';

export const GET: RequestHandler = async ({ params }) => {
  const parsed = scenarioIdParamSchema.safeParse(params);
  if (!parsed.success) {
    throw error(400, 'Invalid scenario id');
  }

  const scenario = await prisma.scenario.findUnique({
    where: { id: parsed.data.id }
  });

  if (!scenario) {
    throw error(404, 'Scenario not found');
  }

  return json(scenario);
};

export const DELETE: RequestHandler = async ({ params }) => {
  const parsed = scenarioIdParamSchema.safeParse(params);
  if (!parsed.success) {
    throw error(400, 'Invalid scenario id');
  }

  await prisma.scenario.delete({
    where: { id: parsed.data.id }
  });

  return new Response(null, { status: 204 });
};
