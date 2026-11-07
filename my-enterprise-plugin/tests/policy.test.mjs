import test from 'node:test';
import assert from 'node:assert/strict';
import policy from '../policies/policy.js';
import bloom from '../sync/bloom_filter.js';
import lineage from '../memory/lineage.js';
import preflight from '../agents/deploy-agent/preflight.js';

test('redaction masks email and token patterns', () => {
  const value = policy.redactText('dev@example.test Bearer abcdefghijklmnopqrstuvwxyz012345');
  assert.match(value, /\[REDACTED:EMAIL\]/);
  assert.match(value, /\[REDACTED:BEARER_TOKEN\]/);
});

test('command check denies recursive root deletion and permits read-only git status', () => {
  assert.equal(policy.checkCommand('rm -rf /').allowed, false);
  assert.equal(policy.checkCommand('git status --short').allowed, true);
});

test('residency and budget helpers reject out-of-policy estimates', () => {
  assert.equal(policy.checkResidency('EU', 'US').allowed, false);
  assert.equal(policy.checkBudget('engineering', 30).allowed, false);
  assert.equal(policy.checkBudget('unknown', 1).allowed, false);
});

test('route suggestion is scoped to configured region and stays advisory', () => {
  const route = policy.recommendRoute('patch', 'EU');
  assert.equal(route.routes.length, 2);
  assert.match(route.reason, /no model request is routed/);
  assert.equal(policy.recommendRoute('patch', 'APAC').routes.length, 0);
});

test('empty Bloom filter loads and never reports an indicator', () => {
  const filter = bloom.loadFilter();
  assert.equal(filter.itemCount, 0);
  assert.equal(bloom.containsSha256('a'.repeat(64)), false);
});

test('lineage guard stops repeated signatures and excessive depth', () => {
  assert.equal(lineage.checkLineage(['patch', 'review', 'deploy']).allowed, true);
  assert.equal(lineage.checkLineage(['patch', 'patch', 'patch']).allowed, false);
  assert.equal(lineage.checkLineage(Array(9).fill('unique')).allowed, false);
});

test('production preflight requires ticket and approved window', () => {
  const result = preflight.preflight({ artifactSha256: 'a'.repeat(64), environment: 'production', changeWindowApproved: false });
  assert.equal(result.ready, false);
  assert.ok(result.issues.some((issue) => issue.includes('ticket')));
});
