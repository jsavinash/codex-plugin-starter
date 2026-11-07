'use strict';

// Minimal dependency-free MCP stdio server. It exposes policy helpers only; it
// does not execute shell commands, route model calls, or access remote services.
const readline = require('node:readline');
const {
  checkBudget,
  checkCommand,
  checkResidency,
  readJson,
  recommendRoute,
  redactText
} = require('../../policies/policy');
const { containsSha256, loadFilter } = require('../../sync/bloom_filter');

const PROTOCOLS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
const TOOLS = [
  {
    name: 'redact_text',
    description: 'Apply configured local regex redaction to a text value. Heuristic only; this is not a DLP guarantee.',
    inputSchema: { type: 'object', properties: { text: { type: 'string', maxLength: 200000 } }, required: ['text'], additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false }
  },
  {
    name: 'check_command',
    description: 'Check a proposed shell command against the local configured deny patterns. Does not execute it and is not a complete shell parser.',
    inputSchema: { type: 'object', properties: { command: { type: 'string', maxLength: 12000 } }, required: ['command'], additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false }
  },
  {
    name: 'check_data_residency',
    description: 'Compare caller-declared data and processing regions with the local residency map. Does not inspect actual provider routing.',
    inputSchema: { type: 'object', properties: { dataRegion: { type: 'string' }, processingRegion: { type: 'string' } }, required: ['dataRegion', 'processingRegion'], additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false }
  },
  {
    name: 'check_budget_estimate',
    description: 'Compare an explicit estimated cost with a local cost-center cap. Does not read provider billing or stop inference spend.',
    inputSchema: { type: 'object', properties: { costCenter: { type: 'string' }, estimateUsd: { type: 'number', minimum: 0 } }, required: ['costCenter', 'estimateUsd'], additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false }
  },
  {
    name: 'recommend_route',
    description: 'List configured route candidates for a declared task and region. It does not make or redirect model requests.',
    inputSchema: { type: 'object', properties: { taskType: { type: 'string', maxLength: 80 }, region: { type: 'string' } }, required: ['taskType', 'region'], additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false }
  },
  {
    name: 'check_sha256_feed',
    description: 'Check a SHA-256 digest against the locally provisioned Bloom filter. An empty filter has no indicators and a positive result may be a false positive.',
    inputSchema: { type: 'object', properties: { sha256: { type: 'string', pattern: '^[a-fA-F0-9]{64}$' } }, required: ['sha256'], additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false }
  }
];

function jsonResult(value, isError = false) {
  return { content: [{ type: 'text', text: JSON.stringify(value) }], isError };
}

function callTool(name, args = {}) {
  switch (name) {
    case 'redact_text': return jsonResult({ redacted: redactText(args.text) });
    case 'check_command': return jsonResult(checkCommand(args.command));
    case 'check_data_residency': return jsonResult(checkResidency(args.dataRegion, args.processingRegion));
    case 'check_budget_estimate': return jsonResult(checkBudget(args.costCenter, args.estimateUsd));
    case 'recommend_route': return jsonResult(recommendRoute(args.taskType, args.region));
    case 'check_sha256_feed': {
      const filter = loadFilter();
      return jsonResult({
        available: true,
        item_count: filter.itemCount,
        match: containsSha256(args.sha256),
        meaning: 'Bloom filters can return false positives; validate positive hits against the authoritative signed feed.'
      });
    }
    default: return jsonResult({ error: `unknown tool: ${name}` }, true);
  }
}

async function handle(message) {
  if (!message || typeof message !== 'object' || message.jsonrpc !== '2.0' || typeof message.method !== 'string') {
    if (message && Object.hasOwn(message, 'id')) return { jsonrpc: '2.0', id: message.id, error: { code: -32600, message: 'Invalid Request' } };
    return null;
  }
  const id = message.id;
  const request = Object.hasOwn(message, 'id');
  const respond = (result) => request ? { jsonrpc: '2.0', id, result } : null;
  if (message.method === 'notifications/initialized' || message.method === 'notifications/cancelled') return null;
  if (message.method === 'ping') return respond({});
  if (message.method === 'initialize') {
    const requested = message.params && message.params.protocolVersion;
    const version = PROTOCOLS.includes(requested) ? requested : '2024-11-05';
    return respond({ protocolVersion: version, capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'enterprise-local-guardrails', version: '0.1.0' } });
  }
  if (message.method === 'tools/list') return respond({ tools: TOOLS });
  if (message.method === 'tools/call') {
    const params = message.params || {};
    if (typeof params.name !== 'string' || !params.arguments || typeof params.arguments !== 'object' || Array.isArray(params.arguments)) {
      return respond(jsonResult({ error: 'tools/call requires a name and object arguments' }, true));
    }
    try {
      return respond(callTool(params.name, params.arguments));
    } catch (error) {
      return respond(jsonResult({ error: error.message }, true));
    }
  }
  return request ? { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${message.method}` } } : null;
}

function start(input = process.stdin, output = process.stdout) {
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  lines.on('line', async (line) => {
    if (Buffer.byteLength(line, 'utf8') > 1_000_000) {
      output.write(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Message exceeds 1 MB limit' } }) + '\n');
      return;
    }
    let response;
    try {
      response = await handle(JSON.parse(line));
    } catch (error) {
      response = { jsonrpc: '2.0', id: null, error: { code: -32700, message: `Parse or dispatch error: ${error.message}` } };
    }
    if (response) output.write(JSON.stringify(response) + '\n');
  });
}

if (require.main === module) start();
module.exports = { PROTOCOLS, TOOLS, callTool, handle, start };
