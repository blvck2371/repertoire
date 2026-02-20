#!/usr/bin/env node
/**
 * Synchronise la version du projet root vers backend et frontend
 */
const fs = require('fs');
const path = require('path');

const rootPkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);
const version = rootPkg.version;

['backend', 'frontend'].forEach((dir) => {
  const pkgPath = path.join(__dirname, '..', dir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`✓ ${dir}/package.json → ${version}`);
});

console.log(`\nVersion projet : v${version}`);
console.log('Pensez à créer le tag : git tag v' + version);
