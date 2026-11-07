import test from 'node:test';
import assert from 'node:assert/strict';
import server from '../agents/patch-agent/runtime.js';

test('MCP initialize negotiates client protocol and advertises tools', async () => {
  const initialized = await server.handle({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } });
  assert.equal(initialized.result.protocolVersion, '2025-06-18');
  const listed = await server.handle({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
  assert.ok(listed.result.tools.some((tool) => tool.name === 'check_command'));
});

test('MCP tool call returns structured local policy as text', async () => {
  const response = await server.handle({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'check_command', arguments: { command: 'rm -rf /' } } });
  const result = JSON.parse(response.result.content[0].text);
  assert.equal(result.allowed, false);
});

test('MCP notifications do not produce JSON-RPC responses', async () => {
  assert.equal(await server.handle({ jsonrpc: '2.0', method: 'notifications/initialized' }), null);
});
