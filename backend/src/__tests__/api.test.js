const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../index');

describe('API Répertoire', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/repertoire_test';
    await mongoose.connect(mongoUri).catch(() => {});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/health', () => {
    it('retourne un statut OK', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('GET /api/contacts', () => {
    it('retourne un tableau (liste des contacts)', async () => {
      const res = await request(app).get('/api/contacts');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/contacts', () => {
    it('crée un nouveau contact', async () => {
      const contact = {
        nom: 'Test',
        prenom: 'Jean',
        telephone: '0612345678',
        email: 'jean.test@email.com'
      };
      const res = await request(app).post('/api/contacts').send(contact);
      expect(res.status).toBe(201);
      expect(res.body.nom).toBe('Test');
      expect(res.body.prenom).toBe('Jean');
      expect(res.body._id).toBeDefined();
    });
  });
});
