import { PrismaClient } from '@prisma/client';

// Initialize Prisma client with proper configuration for Vercel
const prisma = new PrismaClient({
  log: ['error'],
  errorFormat: 'pretty',
});

// ROI calculation function
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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Scenarios API called:', req.method);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

  try {
    if (req.method === 'GET') {
      console.log('Fetching scenarios...');
      
      const scenarios = await prisma.scenario.findMany({
        orderBy: { createdAt: 'desc' }
      });
      
      console.log('Found scenarios:', scenarios.length);
      return res.status(200).json(scenarios);
    }

    if (req.method === 'POST') {
      console.log('Creating scenario...');
      console.log('Request body keys:', Object.keys(req.body));
      
      const { name, data } = req.body;
      
      // Validation
      if (!name || !data) {
        console.error('Missing required fields:', { name: !!name, data: !!data });
        return res.status(400).json({ 
          error: 'Missing required fields',
          details: 'Both name and data are required'
        });
      }

      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Invalid name',
          details: 'Name must be a non-empty string'
        });
      }

      console.log('Calculating ROI for scenario:', name);
      const results = calculateROI(data);
      console.log('ROI calculated successfully');

      console.log('Saving scenario to database...');
      const scenario = await prisma.scenario.create({
        data: {
          name: name.trim(),
          data,
          results
        }
      });

      console.log('Scenario created successfully:', scenario.id);
      return res.status(201).json(scenario);
    }

    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['GET', 'POST']
    });

  } catch (error) {
    console.error('Scenarios API error:', error);
    
    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Scenario name already exists',
        message: 'Please choose a different name'
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
    // Disconnect Prisma client to avoid connection leaks
    await prisma.$disconnect();
  }
}