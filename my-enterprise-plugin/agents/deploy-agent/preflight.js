'use strict';

function preflight(request) {
  const issues = [];
  if (!request || typeof request !== 'object') return { ready: false, issues: ['request must be an object'] };
  if (typeof request.artifactSha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(request.artifactSha256)) issues.push('artifact SHA-256 is invalid');
  if (!['development', 'staging', 'production'].includes(request.environment)) issues.push('environment is invalid');
  if (request.environment === 'production' && request.changeWindowApproved !== true) issues.push('production change window approval is missing');
  if (request.environment === 'production' && !request.changeTicket) issues.push('production change ticket is missing');
  return { ready: issues.length === 0, issues, action: 'preflight-only; no deployment performed' };
}

if (require.main === module) {
  const request = JSON.parse(require('node:fs').readFileSync(0, 'utf8'));
  const result = preflight(request);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (!result.ready) process.exitCode = 2;
}

module.exports = { preflight };
