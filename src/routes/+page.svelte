<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '$lib/components/ui/dialog';
  import { Badge } from '$lib/components/ui/badge';
  import { Separator } from '$lib/components/ui/separator';
  import { showSuccess, showError, showInfo } from '$lib/stores/toast';
  import { roiInputSchema, type ROIInputs, type ROIResults } from '$lib/schemas/roi';
  import type { PageData } from './$types';

  export let data: PageData;

  // Form state
  let formData: ROIInputs = {
    monthly_invoice_volume: 1000,
    num_ap_staff: 2,
    avg_hours_per_invoice: 0.5,
    hourly_wage: 25,
    error_rate_manual: 5,
    error_cost: 100,
    time_horizon_months: 12,
    one_time_implementation_cost: 10000
  };

  let results: ROIResults | null = null;
  let isCalculating = false;
  let formErrors: Record<string, string[]> = {};

  // Scenario management
  let scenarios = data.scenarios || [];
  let showScenarioDialog = false;
  let scenarioName = '';
  let isSavingScenario = false;

  // Report modal
  let showReportDialog = false;
  let reportEmail = '';
  let isGeneratingReport = false;

  // Calculate ROI
  async function calculateROI() {
    isCalculating = true;
    formErrors = {};

    const validation = roiInputSchema.safeParse(formData);
    if (!validation.success) {
      formErrors = validation.error.flatten().fieldErrors;
      showError('Please fix the form errors');
      isCalculating = false;
      return;
    }

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to calculate ROI');
      }

      const data = await response.json();
      results = data.results;
      showSuccess('ROI calculated successfully!');
    } catch (error) {
      showError('Failed to calculate ROI');
      console.error(error);
    } finally {
      isCalculating = false;
    }
  }

  // Save scenario
  async function saveScenario() {
    if (!scenarioName.trim()) {
      showError('Please enter a scenario name');
      return;
    }

    if (!results) {
      showError('Please calculate ROI first');
      return;
    }

    isSavingScenario = true;

    try {
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scenarioName,
          data: formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save scenario');
      }

      const newScenario = await response.json();
      scenarios = [newScenario, ...scenarios];
      scenarioName = '';
      showScenarioDialog = false;
      showSuccess('Scenario saved successfully!');
    } catch (error) {
      showError('Failed to save scenario');
      console.error(error);
    } finally {
      isSavingScenario = false;
    }
  }

  // Load scenario
  function loadScenario(scenario: any) {
    formData = { ...scenario.data };
    results = scenario.results;
    showInfo(`Loaded scenario: ${scenario.name}`);
  }

  // Delete scenario
  async function deleteScenario(scenarioId: string) {
    try {
      const response = await fetch(`/api/scenarios/${scenarioId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete scenario');
      }

      scenarios = scenarios.filter(s => s.id !== scenarioId);
      showSuccess('Scenario deleted successfully!');
    } catch (error) {
      showError('Failed to delete scenario');
      console.error(error);
    }
  }

  // Generate report
  async function generateReport() {
    if (!reportEmail.trim()) {
      showError('Please enter your email address');
      return;
    }

    if (!results) {
      showError('Please calculate ROI first');
      return;
    }

    isGeneratingReport = true;

    try {
      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: reportEmail,
          scenario_data: formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'roi-report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      reportEmail = '';
      showReportDialog = false;
      showSuccess('Report generated and sent to your email!');
    } catch (error) {
      showError('Failed to generate report');
      console.error(error);
    } finally {
      isGeneratingReport = false;
    }
  }

  // Format currency
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  // Format percentage
  function formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  onMount(() => {
    calculateROI();
  });
</script>

<main class="container mx-auto p-6 max-w-7xl">
  <div class="mb-8">
    <h1 class="text-3xl font-bold mb-2">Invoicing ROI Calculator</h1>
    <p class="text-muted-foreground">Calculate the return on investment for automating your invoice processing</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Input Form -->
    <div class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Input Parameters</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="monthly_invoice_volume">Monthly Invoice Volume</Label>
              <Input
                id="monthly_invoice_volume"
                type="number"
                bind:value={formData.monthly_invoice_volume}
                class={formErrors.monthly_invoice_volume ? 'border-red-500' : ''}
              />
              {#if formErrors.monthly_invoice_volume}
                <p class="text-sm text-red-500 mt-1">{formErrors.monthly_invoice_volume[0]}</p>
              {/if}
            </div>

            <div>
              <Label for="num_ap_staff">Number of AP Staff</Label>
              <Input
                id="num_ap_staff"
                type="number"
                bind:value={formData.num_ap_staff}
                class={formErrors.num_ap_staff ? 'border-red-500' : ''}
              />
              {#if formErrors.num_ap_staff}
                <p class="text-sm text-red-500 mt-1">{formErrors.num_ap_staff[0]}</p>
              {/if}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="avg_hours_per_invoice">Avg Hours per Invoice</Label>
              <Input
                id="avg_hours_per_invoice"
                type="number"
                step="0.01"
                bind:value={formData.avg_hours_per_invoice}
                class={formErrors.avg_hours_per_invoice ? 'border-red-500' : ''}
              />
              {#if formErrors.avg_hours_per_invoice}
                <p class="text-sm text-red-500 mt-1">{formErrors.avg_hours_per_invoice[0]}</p>
              {/if}
            </div>

            <div>
              <Label for="hourly_wage">Hourly Wage ($)</Label>
              <Input
                id="hourly_wage"
                type="number"
                bind:value={formData.hourly_wage}
                class={formErrors.hourly_wage ? 'border-red-500' : ''}
              />
              {#if formErrors.hourly_wage}
                <p class="text-sm text-red-500 mt-1">{formErrors.hourly_wage[0]}</p>
              {/if}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="error_rate_manual">Manual Error Rate (%)</Label>
              <Input
                id="error_rate_manual"
                type="number"
                step="0.1"
                bind:value={formData.error_rate_manual}
                class={formErrors.error_rate_manual ? 'border-red-500' : ''}
              />
              {#if formErrors.error_rate_manual}
                <p class="text-sm text-red-500 mt-1">{formErrors.error_rate_manual[0]}</p>
              {/if}
            </div>

            <div>
              <Label for="error_cost">Cost per Error ($)</Label>
              <Input
                id="error_cost"
                type="number"
                bind:value={formData.error_cost}
                class={formErrors.error_cost ? 'border-red-500' : ''}
              />
              {#if formErrors.error_cost}
                <p class="text-sm text-red-500 mt-1">{formErrors.error_cost[0]}</p>
              {/if}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="time_horizon_months">Time Horizon (Months)</Label>
              <Input
                id="time_horizon_months"
                type="number"
                bind:value={formData.time_horizon_months}
                class={formErrors.time_horizon_months ? 'border-red-500' : ''}
              />
              {#if formErrors.time_horizon_months}
                <p class="text-sm text-red-500 mt-1">{formErrors.time_horizon_months[0]}</p>
              {/if}
            </div>

            <div>
              <Label for="one_time_implementation_cost">Implementation Cost ($)</Label>
              <Input
                id="one_time_implementation_cost"
                type="number"
                bind:value={formData.one_time_implementation_cost}
                class={formErrors.one_time_implementation_cost ? 'border-red-500' : ''}
              />
              {#if formErrors.one_time_implementation_cost}
                <p class="text-sm text-red-500 mt-1">{formErrors.one_time_implementation_cost[0]}</p>
              {/if}
            </div>
          </div>

          <Button 
            on:click={calculateROI} 
            disabled={isCalculating}
            class="w-full"
          >
            {isCalculating ? 'Calculating...' : 'Calculate ROI'}
          </Button>
        </CardContent>
      </Card>

      <!-- Scenario Management -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Saved Scenarios</CardTitle>
            <Dialog bind:open={showScenarioDialog}>
              <DialogTrigger asChild let:builder>
                <Button builders={[builder]} variant="outline" size="sm">
                  Save Current
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Scenario</DialogTitle>
                </DialogHeader>
                <div class="space-y-4">
                  <div>
                    <Label for="scenario_name">Scenario Name</Label>
                    <Input
                      id="scenario_name"
                      bind:value={scenarioName}
                      placeholder="Enter scenario name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    on:click={saveScenario}
                    disabled={isSavingScenario}
                  >
                    {isSavingScenario ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {#if scenarios.length === 0}
            <p class="text-muted-foreground text-sm">No saved scenarios yet</p>
          {:else}
            <div class="space-y-2">
              {#each scenarios as scenario}
                <div class="flex items-center justify-between p-3 border rounded-lg">
                  <div class="flex items-center space-x-3">
                    <Badge variant="secondary">{scenario.name}</Badge>
                    <span class="text-sm text-muted-foreground">
                      {new Date(scenario.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      on:click={() => loadScenario(scenario)}
                    >
                      Load
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      on:click={() => deleteScenario(scenario.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </CardContent>
      </Card>
    </div>

    <!-- Results -->
    <div class="space-y-6">
      {#if results}
        <!-- Key Metrics -->
        <Card>
          <CardHeader>
            <CardTitle>ROI Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">
                  {formatCurrency(results.monthly_savings)}
                </div>
                <div class="text-sm text-muted-foreground">Monthly Savings</div>
              </div>
              
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">
                  {results.payback_months ? `${results.payback_months.toFixed(1)} months` : 'N/A'}
                </div>
                <div class="text-sm text-muted-foreground">Payback Period</div>
              </div>
              
              <div class="text-center p-4 bg-purple-50 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">
                  {formatPercentage(results.roi_percentage)}
                </div>
                <div class="text-sm text-muted-foreground">ROI Percentage</div>
              </div>
              
              <div class="text-center p-4 bg-orange-50 rounded-lg">
                <div class="text-2xl font-bold text-orange-600">
                  {formatCurrency(results.net_savings)}
                </div>
                <div class="text-sm text-muted-foreground">Net Savings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Detailed Breakdown -->
        <Card>
          <CardHeader>
            <CardTitle>Detailed Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead class="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Labor Cost (Manual)</TableCell>
                  <TableCell class="text-right">{formatCurrency(results.labor_cost_manual)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Automation Cost</TableCell>
                  <TableCell class="text-right">{formatCurrency(results.automation_cost)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Error Savings</TableCell>
                  <TableCell class="text-right">{formatCurrency(results.error_savings)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Cumulative Savings</TableCell>
                  <TableCell class="text-right">{formatCurrency(results.cumulative_savings)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Implementation Cost</TableCell>
                  <TableCell class="text-right">{formatCurrency(formData.one_time_implementation_cost)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <!-- Report Generation -->
        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog bind:open={showReportDialog}>
              <DialogTrigger asChild let:builder>
                <Button builders={[builder]} class="w-full">
                  Download PDF Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate PDF Report</DialogTitle>
                </DialogHeader>
                <div class="space-y-4">
                  <p class="text-sm text-muted-foreground">
                    Enter your email address to receive the detailed ROI report.
                  </p>
                  <div>
                    <Label for="report_email">Email Address</Label>
                    <Input
                      id="report_email"
                      type="email"
                      bind:value={reportEmail}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    on:click={generateReport}
                    disabled={isGeneratingReport}
                  >
                    {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      {:else}
        <Card>
          <CardContent class="text-center py-12">
            <p class="text-muted-foreground">Enter your parameters and click "Calculate ROI" to see results</p>
          </CardContent>
        </Card>
      {/if}
    </div>
  </div>
</main>
