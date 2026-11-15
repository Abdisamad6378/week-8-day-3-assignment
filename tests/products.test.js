const request = require('supertest');
const app = require('../app');
const { resetProducts } = require('../app');

// Start every test with the same 3 products so tests don't affect each other
beforeEach(() => {
  resetProducts();
});

describe('GET /api/products', () => {
  it('returns a list of products', async () => {
    const response = await request(app).get('/api/products');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toEqual({ id: 1, name: 'Ketepa Tea', price: 300 });
  });
});

describe('POST /api/products', () => {
  it('creates a new product with 201 status', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({ name: 'Dormans Coffee', price: 650 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: expect.any(Number), name: 'Dormans Coffee', price: 650 });

    // It should really be saved: the list now has 4 products
    const list = await request(app).get('/api/products');
    expect(list.body).toHaveLength(4);
  });
});

describe('GET /api/products/:id', () => {
  it('returns a single product by ID', async () => {
    const response = await request(app).get('/api/products/2');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 2, name: 'Tusker Lager', price: 250 });
  });
});

describe('POST /api/products (invalid)', () => {
  it('returns 400 when name is missing', async () => {
    const response = await request(app).post('/api/products').send({ price: 100 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Name is required');
  });
});

describe('DELETE /api/products/:id', () => {
  it('deletes a product and returns 204', async () => {
    const response = await request(app).delete('/api/products/1');

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});

    // The product is gone
    const check = await request(app).get('/api/products/1');
    expect(check.status).toBe(404);
  });
});
