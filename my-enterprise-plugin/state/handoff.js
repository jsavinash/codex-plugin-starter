'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { checkLineage } = require('../memory/lineage');
const { redactText } = require('../policies/policy');

function writeHandoff(id, summary, lineage) {
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) throw new Error('handoff id must be a simple 1-80 character identifier');
  if (typeof summary !== 'string' || summary.length > 8000) throw new Error('summary must be text of at most 8000 characters');
  const decision = checkLineage(lineage);
  if (!decision.allowed) throw new Error(decision.reason);
  const dataDir = process.env.ENTERPRISE_STATE_DIR;
  if (!dataDir) throw new Error('set ENTERPRISE_STATE_DIR to an approved private state directory');
  fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  if (fs.lstatSync(dataDir).isSymbolicLink()) throw new Error('state directory must not be a symbolic link');
  const directory = path.join(dataDir, 'handoffs');
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  if (fs.lstatSync(directory).isSymbolicLink()) throw new Error('handoff directory must not be a symbolic link');
  const target = path.join(directory, `${id}.json`);
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify({ schema_version: 1, id, summary: redactText(summary), lineage, created_at: new Date().toISOString() }, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  fs.renameSync(temporary, target);
  fs.chmodSync(target, 0o600);
  return target;
}

module.exports = { writeHandoff };
