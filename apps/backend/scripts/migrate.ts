import path from 'node:path';

import { runSqlDir } from './db-utils';

const migrationsPath = path.resolve(__dirname, '../db/migrations');

runSqlDir(migrationsPath).catch((error) => {
  console.error('[db:migrate] failed', error);
  process.exitCode = 1;
});
