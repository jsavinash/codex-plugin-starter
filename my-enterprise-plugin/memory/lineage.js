'use strict';

const guard = require('../state/recursion_guard.json');

function checkLineage(chain) {
  if (!Array.isArray(chain)) return { allowed: false, reason: 'lineage must be an array' };
  if (chain.some((item) => typeof item !== 'string' || item.length > 160)) return { allowed: false, reason: 'lineage entries must be short identifiers' };
  if (chain.length > guard.max_handoff_depth) return { allowed: false, reason: 'maximum handoff depth exceeded' };
  const counts = new Map();
  for (const item of chain) counts.set(item, (counts.get(item) || 0) + 1);
  const repeated = [...counts.entries()].find(([, count]) => count > guard.max_repeated_handoff_signature);
  if (repeated) return { allowed: false, reason: `repeated handoff signature: ${repeated[0]}` };
  return { allowed: true, depth: chain.length };
}

module.exports = { checkLineage };
