import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';

export default function globalSetup() {
  const dbPath = path.resolve(__dirname, '../../data/test.db');

  if (existsSync(dbPath)) {
    rmSync(dbPath, { force: true });
  }

  const isWin = process.platform === 'win32';

  execFileSync(
    isWin ? 'cmd.exe' : 'pnpm',
    isWin
      ? ['/c', 'pnpm exec prisma migrate deploy']
      : ['exec', 'prisma', 'migrate', 'deploy'],
    {
      cwd: __dirname,
      env: {
        ...process.env,
        DATABASE_URL: 'file:../../data/test.db',
      },
      stdio: 'pipe',
    },
  );
}
