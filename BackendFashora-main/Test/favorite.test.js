const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Product = require('../models/Product');
const favoriteRouter = require('../routers/FavoriteRoutes'); // adjust path

const app = express();
app.use(express.json());
app.use('/api/favorites', favoriteRouter);

describe('Favorite API', () => {
  let user, product1, product2, token;

  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb');

    user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '9860500911',
      favorites: [],
    });
    await user.save();

    product1 = new Product({
      name: 'Test Product 1',
      price: 10,
      categoryId: new mongoose.Types.ObjectId(),
      description: 'Test description 1',
      sellerId: new mongoose.Types.ObjectId(),
      image: '',
    });
    await product1.save();

    product2 = new Product({
      name: 'Test Product 2',
      price: 20,
      categoryId: new mongoose.Types.ObjectId(),
      description: 'Test description 2',
      sellerId: new mongoose.Types.ObjectId(),
      image: '',
    });
    await product2.save();

    token = jwt.sign({ _id: user._id }, process.env.SECRET || 'secretkey');
  });

  afterAll(async () => {
    // Reset favorites instead of deleting user or products
    user.favorites = [];
    await user.save();

    product1.name = 'Test Product 1';
    await product1.save();

    product2.name = 'Test Product 2';
    await product2.save();

    await mongoose.connection.close();
  });




  



  it('5. should fail toggle favorite without authentication', async () => {
    const res = await request(app)
      .post('/api/favorites/toggle')
      .send({ productId: product1._id.toString() });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('6. should fail get favorites without authentication', async () => {
    const res = await request(app).get('/api/favorites');

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });





  it('10. should handle server errors gracefully on getFavorites', async () => {
    // Temporarily mock User.findById to throw error
    const originalFindById = User.findById;
    User.findById = jest.fn(() => { throw new Error('DB error'); });

    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);

    // Restore original method
    User.findById = originalFindById;
  });
});
