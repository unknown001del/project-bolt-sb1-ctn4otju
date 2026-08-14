// Simple scaffold runner for NOVA Studio
// Run with: node scripts/scaffold.js

const fs = require('fs').promises;
const path = require('path');

function nowTs() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

async function backupIfExists(targetPath) {
  try {
    const exists = await fs.stat(targetPath).then(() => true).catch(() => false);
    if (!exists) return null;
    const content = await fs.readFile(targetPath, 'utf8');
    const stashDir = path.join(process.cwd(), '.nova-stash', nowTs(), path.dirname(path.relative(process.cwd(), targetPath)));
    await ensureDir(stashDir);
    const dest = path.join(stashDir, path.basename(targetPath));
    await fs.writeFile(dest, content, 'utf8');
    console.log(`Backed up ${targetPath} -> ${dest}`);
    return dest;
  } catch (e) {
    console.error('Backup failed for', targetPath, e);
    throw e;
  }
}

async function writeFileSafe(rel, content) {
  const target = path.join(process.cwd(), rel);
  try {
    await ensureDir(path.dirname(target));
    const backup = await backupIfExists(target);
    if (backup) {
      // ask the user in terminal whether to overwrite
      const prompt = `File ${rel} exists and was backed up at ${backup}. Overwrite? (y/N): `;
      const res = await ask(prompt);
      if (!/^y/i.test(res.trim())) {
        console.log(`Skipped overwriting ${rel}`);
        return false;
      }
    }
    await fs.writeFile(target, content, 'utf8');
    console.log(`Wrote ${rel}`);
    return true;
  } catch (e) {
    console.error('Failed to write', rel, e);
    return false;
  }
}

function ask(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', function (data) {
      process.stdin.pause();
      resolve(data.toString());
    });
  });
}

async function run() {
  console.log('NOVA scaffold runner starting...');

  const prismaSchema = `generator client {\n  provider = \"prisma-client-js\"\n}\n\n datasource db {\n  provider = \"postgresql\"\n  url = env(\"DATABASE_URL\")\n}\n\nmodel User {\n  id String @id @default(uuid())\n  email String @unique\n  name String?\n  createdAt DateTime @default(now())\n}\n\nmodel Profile {\n  id String @id @default(uuid())\n  userId String\n  bio String?\n  user User @relation(fields: [userId], references: [id])\n}\n\nmodel Subscription {\n  id String @id @default(uuid())\n  userId String\n  status String\n  user User @relation(fields: [userId], references: [id])\n}\n\nmodel Workspace {\n  id String @id @default(uuid())\n  ownerId String\n  title String\n}\n\nmodel Invoice {\n  id String @id @default(uuid())\n  amount Int\n  paid Boolean @default(false)\n}\n`;

  const apiAuth = `// Simple auth endpoints (simulated)\nexport async function login(req) {\n  return { status: 200, body: { ok: true, token: 'simulated-token' } };\n}\n\nexport async function signup(req) {\n  return { status: 200, body: { ok: true } };\n}\n`;

  const apiDeploy = `// Simulated deploy controller for NOVA\nexport async function deploy(req) {\n  return { status: 200, body: { ok: true, url: 'https://nova-app.dev/simulated' } };\n}\n`;

  const dbSchemaTs = `// Auto-generated schema mirror of prisma/schema.prisma\nexport const schema = ` + '`' + prismaSchema + '`' + `;\n`;

  const serverIndex = `// Server API index (simulated)\nexport * from './hello';\nexport * from './auth';\nexport * from './deploy';\n`;

  const hello = `export async function GET() {\n  return new Response(JSON.stringify({ message: 'Hello from NOVA API (scaffolded)' }), { status: 200 });\n}\n`;

  const scaffoldFiles = {
    'prisma/schema.prisma': prismaSchema,
    'src/database/schema.ts': dbSchemaTs,
    'src/server/api/auth.ts': apiAuth,
    'src/server/api/deploy.ts': apiDeploy,
    'src/server/api/index.ts': serverIndex,
    'src/server/api/hello.ts': hello,
    'scripts/README.md': '# NOVA scaffold scripts\nRun `npm run scaffold` to re-run the scaffold. Backups of overwritten files are stored in .nova-stash/'
  };

  for (const [rel, content] of Object.entries(scaffoldFiles)) {
    await writeFileSafe(rel, content);
  }

  console.log('Scaffold complete.');
}

run().catch(err => { console.error(err); process.exit(1); });
