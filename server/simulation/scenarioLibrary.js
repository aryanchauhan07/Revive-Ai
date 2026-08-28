import { db } from '../db/database.js';
import { diagnoseAndPlanCase } from '../core/recoveryPlanner.js';

export const SCENARIO_LIBRARY = [
  {
    id: "S1",
    name: "Issuer/UPI Downtime",
    signal: "UPI success rate collapses for HDFC Bank; Razorpay status API corroborates.",
    expectedBehavior: "Create incident; suppress same-rail retries; offer unaffected methods; ₹0 discount; recover cohort after stabilization.",
    priority: "P0"
  },
  {
    id: "S2",
    name: "UPI Timeout vs User Exit",
    signal: "Timed-out payment attempt vs brief exit without intent.",
    expectedBehavior: "Technical timeout -> recovery link; low-intent exit -> no action.",
    priority: "P0"
  },
  {
    id: "S3",
    name: "Merchant Deployment Regression",
    signal: "Failures rise immediately after backend deploy across methods.",
    expectedBehavior: "Flag merchant regression; pause outreach; recommend rollback.",
    priority: "P1"
  },
  {
    id: "S5",
    name: "Insufficient Funds (Single Customer)",
    signal: "Recurring debit fails for single customer, no ecosystem anomaly.",
    expectedBehavior: "Wait for salary window (1st-3rd of month); limited retry; ₹0 discount.",
    priority: "P0"
  },
  {
    id: "S7",
    name: "Authorized But Not Captured Yet",
    signal: "Partial out-of-order events received.",
    expectedBehavior: "Do not contact customer; wait and reconcile; monotonic transition only.",
    priority: "P0"
  },
  {
    id: "S8",
    name: "Duplicate Webhook Delivery",
    signal: "Same Razorpay event ID arrives multiple times.",
    expectedBehavior: "Idempotent no-op after first receipt; record audit log.",
    priority: "P0"
  },
  {
    id: "S15",
    name: "Customer Self-Recovery",
    signal: "Customer retries independently before scheduled message.",
    expectedBehavior: "Cancel queued recovery actions; classify attribution as SELF_RECOVERED.",
    priority: "P0"
  },
  {
    id: "S17",
    name: "High-Value Transaction (₹25k+)",
    signal: "Order value ₹25,000+ exceeds approval floor.",
    expectedBehavior: "Require human manager approval for sensitive actions; basic wait remains autonomous.",
    priority: "P0"
  },
  {
    id: "S22",
    name: "Quiet Hours DND (01:00 IST)",
    signal: "Payment fails during DND window (22:00-08:00 IST).",
    expectedBehavior: "Schedule message for 08:00 IST; do not send at night.",
    priority: "P0"
  },
  {
    id: "S23",
    name: "Customer Opt-Out ('STOP')",
    signal: "Customer sends 'STOP' or channel opt-out recorded.",
    expectedBehavior: "Hard stop all messaging; audit compliance.",
    priority: "P1"
  }
];

export function runScenarioSimulation(scenarioId) {
  const scenario = SCENARIO_LIBRARY.find(s => s.id === scenarioId) || SCENARIO_LIBRARY[0];

  db.addAuditEvent({
    actor_type: 'user',
    actor_id: 'scenario_runner',
    action: 'SCENARIO_EXECUTED',
    correlation_id: scenario.id,
    details: `Executed scenario ${scenario.id}: ${scenario.name}. Expected: ${scenario.expectedBehavior}`
  });

  return scenario;
}
