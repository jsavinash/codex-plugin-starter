'use strict';

const config = require('./token_throttling.json');

function checkEstimate({ requestsInMinute, inputTokens, outputTokens }) {
  const values = [requestsInMinute, inputTokens, outputTokens];
  if (values.some((value) => !Number.isInteger(value) || value < 0)) {
    return { allowed: false, reason: 'all usage estimates must be non-negative integers' };
  }
  const violations = [];
  if (requestsInMinute > config.requests_per_minute) violations.push('requests_per_minute');
  if (inputTokens > config.max_input_tokens) violations.push('max_input_tokens');
  if (outputTokens > config.max_output_tokens) violations.push('max_output_tokens');
  return { allowed: violations.length === 0, violations, mode: config.mode, note: 'Caller estimates only; this does not throttle Codex or a provider.' };
}

module.exports = { checkEstimate };
