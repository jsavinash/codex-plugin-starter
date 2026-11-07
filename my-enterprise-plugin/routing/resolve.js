'use strict';

const { recommendRoute } = require('../policies/policy');

const request = JSON.parse(require('node:fs').readFileSync(0, 'utf8'));
const result = recommendRoute(request.taskType, request.region);
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
