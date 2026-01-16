const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category'); // make sure you have this model
const User = require('../models/User'); // make sure you have this model
const productRouter = require('../routers/admin/productRouteAdmin');

const app = express();
app.use(express.json());
app.use('/api/products', productRouter);

describe('Product API', () => {
  let createdProductIds = [];
  let categoryId;
  let userId;

  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create dummy category and user
    const category = await Category.create({ name: 'Test Category' });
    categoryId = category._id;

    const user = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      phoneNumber: '1234567890',
      password: '123456',
    });
    userId = user._id;
  });

  afterEach(async () => {
    for (const id of createdProductIds) {
      try {
        await Product.findByIdAndDelete(id);
      } catch {
        // ignore errors if already deleted
      }
    }
    createdProductIds = [];
  });

  afterAll(async () => {
    // Clean up
    await Product.deleteMany();
    await Category.findByIdAndDelete(categoryId);
    await User.findByIdAndDelete(userId);
    await mongoose.connection.close();
  });

  it('should fail creating product with missing fields', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Incomplete Product',
    });
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Missing field');
  });

  it('should get all products with pagination', async () => {
    const products = await Product.create([
      { name: 'Prod1', price: 10, categoryId, sellerId: userId, description: 'Desc1' },
      { name: 'Prod2', price: 20, categoryId, sellerId: userId, description: 'Desc2' },
    ]);
    products.forEach((p) => createdProductIds.push(p._id));

    const res = await request(app)
      .get('/api/products')
      .query({ page: '1', limit: '10' }); // Pass as strings to be safe

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThanOrEqual(2);
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('should return 404 if single product not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/products/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Product not found');
  });

  it('should return 404 updating non-existing product', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app).put(`/api/products/${fakeId}`).send({
      name: 'NoProd',
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Product not found');
  });


  





  it('should return 400 when invalid categoryId is provided on create', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Invalid CategoryId',
      price: '20',
      categoryId: '12345', // invalid ObjectId
      userId: userId.toString(),
      description: 'Test invalid categoryId',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid categoryId/);
  });

  it('should return 400 when invalid userId is provided on create', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Invalid UserId',
      price: '20',
      categoryId: categoryId.toString(),
      userId: 'notvaliduserid',
      description: 'Test invalid userId',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid userId/);
  });

  it('should update only product price without affecting other fields', async () => {
    const product = await Product.create({
      name: 'Price Update Product',
      price: '100',
      categoryId,
      sellerId: userId,
      description: 'Original description',
    });
    createdProductIds.push(product._id);

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .send({ price: '150' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.price).toBe('150');
    expect(res.body.data.name).toBe('Price Update Product');
  });

  it('should return 400 when updating product with invalid categoryId', async () => {
    const product = await Product.create({
      name: 'Invalid Cat Update',
      price: '50',
      categoryId,
      sellerId: userId,
      description: 'desc',
    });
    createdProductIds.push(product._id);

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .send({ categoryId: 'invalidid' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid categoryId/);
  });

  it('should search products by name', async () => {
    const p1 = await Product.create({
      name: 'SearchTest1',
      price: '10',
      categoryId,
      sellerId: userId,
      description: 'desc',
    });
    const p2 = await Product.create({
      name: 'AnotherProduct',
      price: '20',
      categoryId,
      sellerId: userId,
      description: 'desc',
    });
    createdProductIds.push(p1._id, p2._id);

    const res = await request(app)
      .get('/api/products')
      .query({ search: 'SearchTest' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.products.some(p => p.name === 'SearchTest1')).toBe(true);
    expect(res.body.products.some(p => p.name === 'AnotherProduct')).toBe(false);
  });







it('should get a product by ID', async () => {
  const product = await Product.create({
    name: 'GetByIdProduct',
    price: '200',
    categoryId,
    sellerId: userId,
    description: 'Fetch by ID test',
  });
  createdProductIds.push(product._id);

  const res = await request(app).get(`/api/products/${product._id}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.name).toBe('GetByIdProduct');
});

it('should return 500 when getting product with invalid ID format', async () => {
  const res = await request(app).get('/api/products/invalid123');

  expect(res.statusCode).toBe(500);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toBe('Server error');
});



it('should update multiple fields in a product', async () => {
  const product = await Product.create({
    name: 'MultiUpdate',
    price: '300',
    categoryId,
    sellerId: userId,
    description: 'Old description',
  });
  createdProductIds.push(product._id);

  const res = await request(app)
    .put(`/api/products/${product._id}`)
    .send({
      name: 'MultiUpdatedName',
      price: '350',
      description: 'Updated description',
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.name).toBe('MultiUpdatedName');
  expect(res.body.data.price).toBe('350');
  expect(res.body.data.description).toBe('Updated description');
});

});
