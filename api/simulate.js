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

// Input validation schema
function validateROIInputs(data) {
  const errors = [];

  if (!data.monthly_invoice_volume || data.monthly_invoice_volume < 1 || data.monthly_invoice_volume > 100000) {
    errors.push('monthly_invoice_volume must be between 1 and 100,000');
  }

  if (!data.num_ap_staff || data.num_ap_staff < 1 || data.num_ap_staff > 50) {
    errors.push('num_ap_staff must be between 1 and 50');
  }

  if (!data.avg_hours_per_invoice || data.avg_hours_per_invoice < 0.01 || data.avg_hours_per_invoice > 10) {
    errors.push('avg_hours_per_invoice must be between 0.01 and 10');
  }

  if (!data.hourly_wage || data.hourly_wage < 1 || data.hourly_wage > 500) {
    errors.push('hourly_wage must be between 1 and 500');
  }

  if (data.error_rate_manual === undefined || data.error_rate_manual < 0 || data.error_rate_manual > 100) {
    errors.push('error_rate_manual must be between 0 and 100');
  }

  if (!data.error_cost || data.error_cost < 0 || data.error_cost > 100000) {
    errors.push('error_cost must be between 0 and 100,000');
  }

  if (!data.time_horizon_months || data.time_horizon_months < 1 || data.time_horizon_months > 240) {
    errors.push('time_horizon_months must be between 1 and 240');
  }

  if (data.one_time_implementation_cost !== undefined && (data.one_time_implementation_cost < 0 || data.one_time_implementation_cost > 10000000)) {
    errors.push('one_time_implementation_cost must be between 0 and 10,000,000');
  }

  return errors;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Simulate API called:', req.method);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        allowed: ['POST']
      });
    }

    const data = req.body;
    console.log('Simulate request keys:', Object.keys(data));

    // Validate input data
    const validationErrors = validateROIInputs(data);
    if (validationErrors.length > 0) {
      console.error('Validation failed:', validationErrors);
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    console.log('Calculating ROI...');
    const results = calculateROI(data);
    console.log('ROI calculation completed successfully');

    const response = {
      results,
      inputs: data,
      constants: {
        automated_cost_per_invoice: 0.2,
        error_rate_auto_percent: 0.1,
        time_saved_per_invoice_minutes: 8,
        min_roi_boost_factor: 1.1
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Simulate API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred'
    });
  }
}