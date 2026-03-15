import fs from 'node:fs/promises';
import path from 'node:path';

import { Client } from 'pg';

import { env } from '../src/config/env';

export async function runSqlDir(dirPath: string): Promise<void> {
  const client = new Client({ connectionString: env.databaseUrl });
  await client.connect();

  try {
    const entries = await fs.readdir(dirPath);
    const sqlFiles = entries.filter((file) => file.endsWith('.sql')).sort();

    for (const file of sqlFiles) {
      const fullPath = path.join(dirPath, file);
      const sql = await fs.readFile(fullPath, 'utf8');
      await client.query(sql);
      console.log(`[db] executed ${file}`);
    }
  } finally {
    await client.end();
  }
}
