import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const walk = async directory => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) files.push(...await walk(path.join(directory, entry.name)));
    else files.push(path.join(directory, entry.name));
  }
  return files;
};

test('integration sources and documents contain no unresolved content conflict markers', async () => {
  const files = [path.join(root, 'README.md'), path.join(root, '.env.example')];
  for (const directory of ['app', 'routes', 'resources', 'docs', 'tests', 'config', 'database']) files.push(...await walk(path.join(root, directory)));
  for (const file of files.filter(file => /\.(?:tsx?|mjs|php|md|json|svg|css|example)$/.test(file))) {
    assert.doesNotMatch(await readFile(file, 'utf8'), /^(?:<<<<<<< .+|=======$|>>>>>>> .+)$/m, path.relative(root, file));
  }
});

test('relative TypeScript imports resolve at their migrated paths including exact filename case', async () => {
  const files = (await walk(path.join(root, 'resources/js'))).concat(await walk(path.join(root, 'tests'))).filter(file => /\.tsx?$/.test(file));
  const available = new Set((await walk(root + '/resources')).concat(await walk(root + '/tests')).map(file => file.replaceAll('\\', '/')));
  for (const file of files) {
    const imports = ts.preProcessFile(await readFile(file, 'utf8'), true, true).importedFiles;
    for (const imported of imports.filter(item => item.fileName.startsWith('.'))) {
      const base = path.resolve(path.dirname(file), imported.fileName).replaceAll('\\', '/');
      const candidates = [base, ...['.ts', '.tsx', '.js', '.json', '.css', '/index.ts', '/index.tsx'].map(extension => base + extension)];
      assert.ok(candidates.some(candidate => available.has(candidate)), `${path.relative(root, file)}: ${imported.fileName}`);
    }
  }
});

test('locked dependencies match the Laravel Inertia package manifest', async () => {
  const manifest = JSON.parse(await readFile(root + '/package.json', 'utf8'));
  const lock = JSON.parse(await readFile(root + '/package-lock.json', 'utf8'));
  assert.deepEqual(lock.packages[''].dependencies, manifest.dependencies);
  assert.deepEqual(lock.packages[''].devDependencies, manifest.devDependencies);
  for (const file of ['resources/js/pages/Home.tsx', 'resources/js/pages/Dashboard.tsx', 'resources/js/pages/Auth/Login.tsx',
    'resources/js/pages/LegacyPreview.tsx', 'resources/js/main.tsx', 'routes/web.php']) await access(root + '/' + file);
});
