import { z } from 'zod';

const percent = z.coerce.number().min(0).max(100);
const currency = z.coerce.number().min(0).max(1_000_000_000);

export const roiInputSchema = z.object({
  monthly_invoice_volume: z.coerce.number().min(1).max(100_000),
  num_ap_staff: z.coerce.number().min(1).max(50),
  avg_hours_per_invoice: z.coerce.number().min(0.01).max(10),
  hourly_wage: z.coerce.number().min(1).max(500),
  error_rate_manual: percent,
  error_cost: currency.max(100_000),
  time_horizon_months: z.coerce.number().min(1).max(240),
  one_time_implementation_cost: currency.max(10_000_000).default(0)
});

export const roiResultsSchema = z.object({
  monthly_savings: z.number(),
  payback_months: z.number().nullable(),
  roi_percentage: z.number(),
  cumulative_savings: z.number(),
  net_savings: z.number(),
  error_savings: z.number(),
  labor_cost_saved: z.number(),
  automation_cost: z.number(),
  labor_cost_manual: z.number(),
  baseline_error_cost: z.number(),
  automation_error_cost: z.number(),
  bias_multiplier: z.number()
});

export const scenarioCreateSchema = z.object({
  name: z.string().min(1).max(50),
  data: roiInputSchema
});

export const scenarioIdParamSchema = z.object({
  id: z.string().cuid()
});

export const reportRequestSchema = z.object({
  email: z.string().email(),
  scenario_data: roiInputSchema
});

export type ROIInputs = z.infer<typeof roiInputSchema>;
export type ROIResults = z.infer<typeof roiResultsSchema>;
export type ScenarioCreateInput = z.infer<typeof scenarioCreateSchema>;
export type ReportRequestInput = z.infer<typeof reportRequestSchema>;
