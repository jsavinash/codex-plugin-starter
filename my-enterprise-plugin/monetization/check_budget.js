'use strict';

const { checkBudget } = require('../policies/policy');

const request = JSON.parse(require('node:fs').readFileSync(0, 'utf8'));
const result = checkBudget(request.costCenter, request.estimateUsd);
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
if (!result.allowed) process.exitCode = 2;
