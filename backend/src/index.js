const fs = require('fs');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const contactRoutes = require('./routes/contacts');
const { metricsMiddleware, getMetrics, getContentType } = require('./metrics');

// Phase 7 – Vault : charge MONGODB_URI depuis /vault/secrets si injecté par Vault Agent
if (!process.env.MONGODB_URI && fs.existsSync('/vault/secrets/mongodb')) {
  process.env.MONGODB_URI = fs.readFileSync('/vault/secrets/mongodb', 'utf8').trim();
}

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/repertoire';

app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);
app.use('/api/contacts', contactRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Répertoire opérationnelle' });
});

app.get('/api/metrics', async (req, res) => {
  res.set('Content-Type', getContentType());
  res.end(await getMetrics());
});

function start() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/repertoire';
  mongoose.connect(uri)
    .then(() => console.log('✅ MongoDB connecté'))
    .catch((err) => console.error('❌ Erreur MongoDB:', err));

  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  start();
}

module.exports = { app, start };
