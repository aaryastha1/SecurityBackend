

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');
const {
  validateSignup,
  validateLogin,
  authenticateUser,
  isAdmin
} = require('../middlewares/authorizedUser');

dotenv.config();

const app = express();
app.use(express.json());

app.post('/signup', validateSignup, (req, res) => {
  res.status(200).json({ message: 'Valid signup' });
});

app.post('/login', validateLogin, (req, res) => {
  res.status(200).json({ message: 'Valid login' });
});

app.get('/protected', authenticateUser, (req, res) => {
  res.status(200).json({ userId: req.user._id });
});

app.get('/admin', authenticateUser, isAdmin, (req, res) => {
  res.status(200).json({ message: 'Admin access granted' });
});

describe('User model and auth middleware', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should fail signup if any field is missing', async () => {
    const res = await request(app).post('/signup').send({ email: 'test@mail.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });

  it('should validate correct signup input', async () => {
    const res = await request(app).post('/signup').send({
      name: 'Test',
      email: 'test@mail.com',
      phoneNumber: '1234567890',
      password: '123456'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Valid signup');
  });

  it('should fail login if email or password missing', async () => {
    const res = await request(app).post('/login').send({ email: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });

  it('should allow valid login', async () => {
    const res = await request(app).post('/login').send({ email: 'a@a.com', password: '123456' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Valid login');
  });

  it('should deny access without token', async () => {
    const res = await request(app).get('/protected');
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Token required');
  });

  it('should allow access with valid token', async () => {
    const user = new User({
      name: 'John',
      email: 'john@mail.com',
      phoneNumber: '9876543210',
      password: '123456',
    });
    await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.SECRET || 'testsecret');

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.userId).toBe(user._id.toString());
  });

  it('should deny admin route if user is not admin', async () => {
    const user = new User({
      name: 'NormalUser',
      email: 'user@mail.com',
      phoneNumber: '9999999999',
      password: '123456',
    });
    await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.SECRET || 'testsecret');

    const res = await request(app)
      .get('/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Access denied, not admin');
  });

  it('should allow admin route if user is admin', async () => {
    const admin = new User({
      name: 'Admin',
      email: 'admin@mail.com',
      phoneNumber: '1111111111',
      password: 'adminpass',
      role: 'admin',
    });
    await admin.save();

    const token = jwt.sign({ _id: admin._id }, process.env.SECRET || 'testsecret');

    const res = await request(app)
      .get('/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Admin access granted');
  });

  
});
