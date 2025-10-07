import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async () => {
  const scenarios = await prisma.scenario.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return {
    scenarios
  };
};
