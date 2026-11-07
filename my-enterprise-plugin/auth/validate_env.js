'use strict';

const config = require('./env_mapping.json');
const status = config.variables.map(({ name, scope, sensitive }) => ({
  name,
  scope,
  present: Object.hasOwn(process.env, name) && process.env[name].length > 0,
  sensitive
}));
process.stdout.write(JSON.stringify({ variables: status }, null, 2) + '\n');
