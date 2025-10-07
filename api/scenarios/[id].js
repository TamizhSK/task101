import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['error'],
  errorFormat: 'pretty',
});

// Validate CUID format
function isValidCuid(id) {
  return /^c[a-z0-9]{24}$/.test(id);
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Scenario by ID API called:', req.method);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

  const { id } = req.query;
  console.log('Scenario ID:', id);

  // Validate ID format
  if (!id || !isValidCuid(id)) {
    console.error('Invalid scenario ID format:', id);
    return res.status(400).json({
      error: 'Invalid scenario ID',
      message: 'ID must be a valid CUID format'
    });
  }

  try {
    if (req.method === 'GET') {
      console.log('Fetching scenario by ID...');
      
      const scenario = await prisma.scenario.findUnique({
        where: { id }
      });

      if (!scenario) {
        console.log('Scenario not found:', id);
        return res.status(404).json({
          error: 'Scenario not found',
          message: `No scenario found with ID: ${id}`
        });
      }

      console.log('Scenario found:', scenario.name);
      return res.status(200).json(scenario);
    }

    if (req.method === 'DELETE') {
      console.log('Deleting scenario...');
      
      // Check if scenario exists first
      const existingScenario = await prisma.scenario.findUnique({
        where: { id }
      });

      if (!existingScenario) {
        console.log('Scenario not found for deletion:', id);
        return res.status(404).json({
          error: 'Scenario not found',
          message: `No scenario found with ID: ${id}`
        });
      }

      await prisma.scenario.delete({
        where: { id }
      });

      console.log('Scenario deleted successfully:', id);
      return res.status(204).end();
    }

    return res.status(405).json({
      error: 'Method not allowed',
      allowed: ['GET', 'DELETE']
    });

  } catch (error) {
    console.error('Scenario by ID API error:', error);
    
    // Handle Prisma-specific errors
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Scenario not found',
        message: 'The scenario you are trying to access does not exist'
      });
    }

    if (error.code && error.code.startsWith('P')) {
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to connect to database',
        code: error.code
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred'
    });
  } finally {
    await prisma.$disconnect();
  }
}