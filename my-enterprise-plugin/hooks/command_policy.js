'use strict';

const readline = require('node:readline');
const { checkCommand } = require('../policies/policy');

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: `Enterprise command policy: ${reason}`
    }
  }) + '\n');
}

async function main() {
  let raw = '';
  for await (const chunk of process.stdin) {
    raw += chunk;
    if (raw.length > 1_000_000) return deny('hook input too large');
  }
  try {
    const event = JSON.parse(raw);
    if (event.hook_event_name !== 'PreToolUse' || event.tool_name !== 'Bash') return;
    const command = event.tool_input && event.tool_input.command;
    const decision = checkCommand(command);
    if (!decision.allowed) return deny(decision.reason);
  } catch (error) {
    // A malformed input or unreadable policy must not silently authorize this hook path.
    return deny(`policy check failed (${error.message})`);
  }
}

main().catch((error) => deny(`policy check failed (${error.message})`));
