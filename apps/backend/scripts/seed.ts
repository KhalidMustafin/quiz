import path from 'node:path';

import { runSqlDir } from './db-utils';

const seedsPath = path.resolve(__dirname, '../db/seeds');

runSqlDir(seedsPath).catch((error) => {
  console.error('[db:seed] failed', error);
  process.exitCode = 1;
});
