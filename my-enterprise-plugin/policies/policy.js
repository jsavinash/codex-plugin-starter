'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function redactText(input) {
  if (typeof input !== 'string') throw new TypeError('text must be a string');
  if (Buffer.byteLength(input, 'utf8') > 256_000) throw new RangeError('text exceeds the 256 KB limit');
  const config = readJson('policies/data_redaction.json');
  let output = input;
  for (const rule of config.rules) {
    const flags = [...new Set((rule.flags || '').replace(/[^gimsuy]/g, '') + 'g')].join('');
    const regex = new RegExp(rule.pattern, flags);
    output = output.replace(regex, config.replacement_template.replace('{id}', rule.id));
  }
  return output;
}

function checkCommand(command) {
  if (typeof command !== 'string') return { allowed: false, reason: 'command must be a string' };
  const config = readJson('policies/blocked_commands.json');
  if (command.length > config.max_command_chars) {
    return { allowed: false, reason: `command exceeds ${config.max_command_chars} characters` };
  }
  for (const rule of config.rules) {
    const flags = [...new Set((rule.flags || '').replace(/[^dgimsuvy]/g, '') + 'g')].join('');
    if (new RegExp(rule.pattern, flags).test(command)) {
      return { allowed: false, rule_id: rule.id, reason: rule.description };
    }
  }
  return { allowed: true, reason: 'no configured block pattern matched' };
}

function checkResidency(dataRegion, processingRegion) {
  const config = readJson('sovereignty/data_residency.json');
  if (typeof dataRegion !== 'string' || typeof processingRegion !== 'string') {
    return { allowed: false, reason: 'both dataRegion and processingRegion are required' };
  }
  const rule = config.regions[dataRegion.toUpperCase()];
  if (!rule) return { allowed: false, reason: `no residency policy for ${dataRegion}` };
  const allowed = rule.allowed_processing_regions.includes(processingRegion.toUpperCase());
  return {
    allowed,
    policy_id: rule.policy_id,
    reason: allowed ? 'declared processing region is permitted' : 'declared processing region is outside the configured boundary',
    enforcement_limit: 'This compares caller-declared regions; it does not verify upstream data location.'
  };
}

function checkBudget(costCenter, estimateUsd) {
  const ledger = readJson('monetization/chargeback_ledger.json');
  const caps = readJson('monetization/budget_caps.json');
  if (typeof costCenter !== 'string' || !Object.hasOwn(ledger.cost_centers, costCenter)) {
    return { allowed: false, reason: 'unknown cost center' };
  }
  if (typeof estimateUsd !== 'number' || !Number.isFinite(estimateUsd) || estimateUsd < 0) {
    return { allowed: false, reason: 'estimateUsd must be a finite non-negative number' };
  }
  const capUsd = caps.cost_centers[costCenter] ?? caps.default_cap;
  return {
    allowed: estimateUsd <= capUsd,
    cost_center: costCenter,
    cap_usd: capUsd,
    estimate_usd: estimateUsd,
    enforcement_limit: caps.enforcement
  };
}

function recommendRoute(taskType, region) {
  if (typeof taskType !== 'string' || taskType.length > 80 || typeof region !== 'string') {
    return { routes: [], reason: 'taskType and region are required' };
  }
  const config = readJson('routing/failover_policy.json');
  const routes = config.routes
    .filter((route) => route.region.toUpperCase() === region.toUpperCase())
    .sort((left, right) => left.priority - right.priority)
    .map(({ id, provider, model_env, region: routeRegion }) => ({ id, provider, model_env, region: routeRegion }));
  return {
    task_type: taskType,
    routes,
    mode: config.mode,
    reason: routes.length ? 'recommendation only; no model request is routed by this plugin' : 'no route is configured for that region'
  };
}

module.exports = { ROOT, readJson, redactText, checkCommand, checkResidency, checkBudget, recommendRoute };
