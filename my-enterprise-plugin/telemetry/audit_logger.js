'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { redactText } = require('../policies/policy');

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function digest(event, secret, keyId = 'default') {
  return crypto.createHmac('sha256', secret).update(stableJson({ event, key_id: keyId }), 'utf8').digest('hex');
}

function makeRecord(input, now = new Date()) {
  const toolInput = input && input.tool_input && typeof input.tool_input === 'object' ? input.tool_input : {};
  let commandSummary = null;
  if (typeof toolInput.command === 'string') commandSummary = redactText(toolInput.command).slice(0, 500);
  return {
    timestamp: now.toISOString(),
    event: input && typeof input.hook_event_name === 'string' ? input.hook_event_name : 'unknown',
    tool_name: input && typeof input.tool_name === 'string' ? input.tool_name.slice(0, 160) : 'unknown',
    tool_use_id: input && typeof input.tool_use_id === 'string' ? input.tool_use_id.slice(0, 160) : null,
    command_summary: commandSummary
  };
}

function verifyLines(contents, secret) {
  const results = [];
  for (const [index, line] of contents.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line);
      const expected = digest(record.event, secret, record.key_id || 'default');
      const supplied = Buffer.from(record.signature || '', 'hex');
      const expectedBytes = Buffer.from(expected, 'hex');
      const valid = supplied.length === expectedBytes.length && crypto.timingSafeEqual(supplied, expectedBytes);
      results.push({ line: index + 1, valid });
    } catch {
      results.push({ line: index + 1, valid: false });
    }
  }
  return results;
}

async function main() {
  const secret = process.env.ENTERPRISE_AUDIT_HMAC_KEY;
  if (process.argv[2] === '--verify') {
    if (!secret) throw new Error('ENTERPRISE_AUDIT_HMAC_KEY is required for verification');
    const file = process.argv[3];
    if (!file) throw new Error('usage: node audit_logger.js --verify <audit.jsonl>');
    const results = verifyLines(fs.readFileSync(file, 'utf8'), secret);
    process.stdout.write(JSON.stringify({ checked: results.length, valid: results.every((item) => item.valid), records: results }) + '\n');
    process.exitCode = results.every((item) => item.valid) ? 0 : 1;
    return;
  }
  let raw = '';
  for await (const chunk of process.stdin) {
    raw += chunk;
    if (raw.length > 1_000_000) throw new Error('hook input exceeds 1 MB');
  }
  if (!secret) {
    process.stdout.write(JSON.stringify({ systemMessage: 'Audit signing is not configured: tool event was not recorded. Set ENTERPRISE_AUDIT_HMAC_KEY in the trusted local hook environment.' }) + '\n');
    return;
  }
  const pluginData = process.env.PLUGIN_DATA;
  if (!pluginData) throw new Error('PLUGIN_DATA is unavailable; refusing to write audit data into the plugin package');
  const event = makeRecord(JSON.parse(raw));
  const keyId = process.env.ENTERPRISE_AUDIT_KEY_ID || 'default';
  const record = { event, key_id: keyId, signature: digest(event, secret, keyId) };
  fs.mkdirSync(pluginData, { recursive: true, mode: 0o700 });
  const file = path.join(pluginData, 'audit.jsonl');
  fs.appendFileSync(file, JSON.stringify(record) + '\n', { encoding: 'utf8', mode: 0o600 });
  fs.chmodSync(file, 0o600);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`audit logger error: ${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = { stableJson, digest, makeRecord, verifyLines };
