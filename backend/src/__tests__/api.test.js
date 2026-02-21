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

  describe('GET /api/metrics', () => {
    it('retourne les métriques Prometheus', async () => {
      const res = await request(app).get('/api/metrics');
      expect(res.status).toBe(200);
      expect(res.text).toMatch(/http_requests_total|process_cpu/);
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
    it('retourne 400 si données invalides', async () => {
      const res = await request(app).post('/api/contacts').send({ nom: '' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/contacts/:id', () => {
    it('retourne un contact par ID', async () => {
      const create = await request(app).post('/api/contacts').send({
        nom: 'GetTest', prenom: 'Paul', telephone: '0698765432', email: 'paul@test.com'
      });
      const id = create.body._id;
      const res = await request(app).get(`/api/contacts/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.nom).toBe('GetTest');
    });
    it('retourne 404 si contact inexistant', async () => {
      const res = await request(app).get('/api/contacts/000000000000000000000000');
      expect(res.status).toBe(404);
    });
    it('retourne 500 si ID invalide', async () => {
      const res = await request(app).get('/api/contacts/invalid-id');
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/contacts/:id', () => {
    it('met à jour un contact', async () => {
      const create = await request(app).post('/api/contacts').send({
        nom: 'PutTest', prenom: 'Marie', telephone: '0611111111', email: 'marie@test.com'
      });
      const id = create.body._id;
      const res = await request(app).put(`/api/contacts/${id}`).send({
        nom: 'PutUpdated', prenom: 'Marie', telephone: '0611111111', email: 'marie@test.com'
      });
      expect(res.status).toBe(200);
      expect(res.body.nom).toBe('PutUpdated');
    });
    it('retourne 404 si contact inexistant', async () => {
      const res = await request(app).put('/api/contacts/000000000000000000000000').send({
        nom: 'X', prenom: 'Y', telephone: '06', email: 'x@y.com'
      });
      expect(res.status).toBe(404);
    });
    it('retourne 400 si données invalides', async () => {
      const create = await request(app).post('/api/contacts').send({
        nom: 'Val', prenom: 'Test', telephone: '0612345678', email: 'val@test.com'
      });
      const res = await request(app).put(`/api/contacts/${create.body._id}`).send({
        nom: '', prenom: '', telephone: '', email: ''
      });
      expect(res.status).toBe(400);
    });
    it('retourne 500 si ID invalide', async () => {
      const res = await request(app).put('/api/contacts/invalid-id').send({
        nom: 'X', prenom: 'Y', telephone: '06', email: 'x@y.com'
      });
      expect([400, 500]).toContain(res.status);
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('supprime un contact', async () => {
      const create = await request(app).post('/api/contacts').send({
        nom: 'DelTest', prenom: 'Luc', telephone: '0622222222', email: 'luc@test.com'
      });
      const id = create.body._id;
      const res = await request(app).delete(`/api/contacts/${id}`);
      expect(res.status).toBe(200);
      const get = await request(app).get(`/api/contacts/${id}`);
      expect(get.status).toBe(404);
    });
    it('retourne 404 si contact inexistant', async () => {
      const res = await request(app).delete('/api/contacts/000000000000000000000000');
      expect(res.status).toBe(404);
    });
    it('retourne 500 si ID invalide', async () => {
      const res = await request(app).delete('/api/contacts/invalid-id');
      expect(res.status).toBe(500);
    });
  });
});
