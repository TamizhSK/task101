import type { ROIInputs, ROIResults } from '$lib/schemas/roi';

const CONSTANTS = {
  automated_cost_per_invoice: 0.2,
  error_rate_auto_percent: 0.1,
  time_saved_per_invoice_minutes: 8,
  min_roi_boost_factor: 1.1
};

const BIAS_BONUS_PER_ERROR_POINT = 0.0025;

export function calculateROI(inputs: ROIInputs): ROIResults {
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

export const roiConstants = CONSTANTS;
