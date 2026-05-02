const request = require('supertest');
const app = require('../src/server');

let token = '';
let clientId = '';
let holdingId = '';

describe('Auth API', () => {
  test('POST /api/auth/register - should register a manager', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Manager', email: 'testjest@test.com', password: 'test123' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('manager');
  });

  test('POST /api/auth/login - should login and return token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testjest@test.com', password: 'test123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  test('POST /api/auth/login - should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testjest@test.com', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });
});

describe('Clients API', () => {
  test('POST /api/clients - should add a client', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Client', email: 'client@test.com', phone: '9999999999' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    clientId = res.body.id;
  });

  test('GET /api/clients - should return list of clients', async () => {
    const res = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/clients - should fail without token', async () => {
    const res = await request(app).get('/api/clients');
    expect(res.statusCode).toBe(401);
  });
});

describe('Portfolio API', () => {
  test('POST /api/portfolio - should add a holding', async () => {
    const res = await request(app)
      .post('/api/portfolio')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client_id: clientId,
        symbol: 'TCS',
        company_name: 'Tata Consultancy Services',
        quantity: 10,
        buy_price: 3500,
        buy_date: '2024-01-01'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    holdingId = res.body.id;
  });

  test('GET /api/portfolio/:clientId - should return portfolio', async () => {
    const res = await request(app)
      .get(`/api/portfolio/${clientId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('DELETE /api/portfolio/:id - should delete a holding', async () => {
    const res = await request(app)
      .delete(`/api/portfolio/${holdingId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /api/clients/:id - should delete a client', async () => {
    const res = await request(app)
      .delete(`/api/clients/${clientId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});

describe('Stocks API', () => {
  test('GET /api/stocks/:symbol - should return stock price', async () => {
    const res = await request(app)
      .get('/api/stocks/TCS')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('price');
  });
});