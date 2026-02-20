/**
 * Charge les secrets depuis Vault et démarre l'application.
 * Si VAULT_ADDR n'est pas défini, démarre directement.
 */
const http = require('http');
const https = require('https');

const VAULT_ADDR = process.env.VAULT_ADDR;
const VAULT_TOKEN = process.env.VAULT_TOKEN || 'root';
const SECRET_PATH = process.env.VAULT_SECRET_PATH || 'secret/data/repertoire';

async function fetchFromVault() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${VAULT_ADDR}/v1/${SECRET_PATH}`);
    const client = url.protocol === 'https:' ? https : http;

    const req = client.request(url, {
      method: 'GET',
      headers: { 'X-Vault-Token': VAULT_TOKEN },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const secrets = json?.data?.data || {};
          resolve(secrets);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(new Error('Timeout')); });
    req.end();
  });
}

async function waitForVault(maxAttempts = 30) {
  const url = new URL(`${VAULT_ADDR}/v1/sys/health`);
  const client = url.protocol === 'https:' ? https : http;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = client.request(url, (res) => {
          res.on('data', () => {});
          res.on('end', resolve);
        });
        req.on('error', reject);
        req.setTimeout(2000, () => req.destroy());
        req.end();
      });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error('Vault inaccessible');
}

async function main() {
  if (!VAULT_ADDR) {
    console.log('ℹ️  Mode sans Vault');
    require('./index.js').start();
    return;
  }

  console.log('⏳ Attente de Vault...');
  await waitForVault();
  console.log('✅ Vault accessible');

  console.log('🔐 Récupération des secrets...');
  const secrets = await fetchFromVault();
  Object.assign(process.env, secrets);
  console.log('✅ Secrets chargés');

  require('./index.js').start();
}

main().catch((err) => {
  console.error('❌ Erreur Vault:', err.message);
  process.exit(1);
});
