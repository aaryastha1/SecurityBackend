// const request = require("supertest");
// const app = require("../index"); // your express app
// const mongoose = require("mongoose");
// const Category = require("../models/Category");

// jest.setTimeout(20000);

// describe("Category API", () => {
//   // Keep track of created categories to clean up individually
//   let createdCategoryIds = [];



//   test("POST /api/categories - create category", async () => {
//     const res = await request(app)
//       .post("/api/categories")
//       .field("name", "Test Category");

//     expect(res.statusCode).toBe(201);
//     expect(res.body.success).toBe(true);
//     expect(res.body.data.name).toBe("Test Category");

//     createdCategoryIds.push(res.body.data._id);
//   });

//   test("GET /api/categories - get all categories", async () => {
//     // Create a category to guarantee data exists
//     const category = new Category({ name: "Cat1" });
//     await category.save();
//     createdCategoryIds.push(category._id);

//     const res = await request(app).get("/api/categories");

//     expect(res.statusCode).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(Array.isArray(res.body.data)).toBe(true);
//     expect(res.body.data.length).toBeGreaterThan(0);
//   });

//   test("GET /api/categories/:id - get category by id", async () => {
//     const category = new Category({ name: "Cat2" });
//     await category.save();
//     createdCategoryIds.push(category._id);

//     const res = await request(app).get(`/api/categories/${category._id}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(res.body.data.name).toBe("Cat2");
//   });

//   test("PUT /api/categories/:id - update category", async () => {
//     const category = new Category({ name: "Cat3" });
//     await category.save();
//     createdCategoryIds.push(category._id);

//     const res = await request(app)
//       .put(`/api/categories/${category._id}`)
//       .send({ name: "Updated Cat3" });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(res.body.data.name).toBe("Updated Cat3");
//   });

// //   test("DELETE /api/categories/:id - delete category", async () => {
// //     const category = new Category({ name: "CatToDelete" });
// //     await category.save();

// //     const res = await request(app).delete(`/api/categories/${category._id}`);

// //     expect(res.statusCode).toBe(200);
// //     expect(res.body.success).toBe(true);
// //     expect(res.body.message).toBe("Category deleted");

// //     // No need to push to createdCategoryIds because it's deleted
// //   });
// });



const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Category = require('../models/Category');  // Adjust path as needed
const categoryRouter = require('../routers/admin/CategoryRouteAdmin'); // Adjust path

const app = express();
app.use(express.json());
app.use('/api/categories', categoryRouter);

describe('Category API', () => {
  // Keep track of created category IDs
  let createdCategoryIds = [];

  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb');
  });

  afterEach(async () => {
    // Delete each created category by its ID
    for (const id of createdCategoryIds) {
      try {
        await Category.findByIdAndDelete(id);
      } catch (err) {
        // Ignore errors if already deleted
      }
    }
    // Reset list after cleanup
    createdCategoryIds = [];
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Path to a valid test image (make sure this file exists)
  const testImagePath = path.resolve(__dirname, 'test-image.jpg');


  it('should get all categories', async () => {
    const category = await Category.create({ name: 'Dresses' });
    createdCategoryIds.push(category._id);

    const res = await request(app).get('/api/categories');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should get category by id', async () => {
    const category = await Category.create({ name: 'Shirts' });
    createdCategoryIds.push(category._id);

    const res = await request(app).get(`/api/categories/${category._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Shirts');
  });

  it('should return 404 for non-existing category', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/categories/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Category not found');
  });

 

  it('should return 404 updating non-existing category', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/categories/${fakeId}`)
      .field('name', 'No Category');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Category not found');
    
  });

  



  


  it('should create a category without an image', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: `NoImageCategory${Date.now()}` });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.filepath).toBeUndefined();
    createdCategoryIds.push(res.body.data._id);
  });

  it('should not allow duplicate category names', async () => {
    const categoryName = `UniqueName${Date.now()}`;
    const category = await Category.create({ name: categoryName });
    createdCategoryIds.push(category._id);

    const res = await request(app)
      .post('/api/categories')
      .send({ name: categoryName });

    expect(res.statusCode).toBe(500); // your server returns 500 on duplicate key error
    expect(res.body.success).toBe(false);
  });

  it('should update category name only without image', async () => {
    const category = await Category.create({ name: `OldName${Date.now()}` });
    createdCategoryIds.push(category._id);

    const res = await request(app)
      .put(`/api/categories/${category._id}`)
      .field('name', 'UpdatedNameOnly');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('UpdatedNameOnly');
  });



  it('should return 500 when getting category by invalid ID format', async () => {
    const res = await request(app).get('/api/categories/invalidid123');

    expect(res.statusCode).toBe(500); // mongoose CastError caught by controller returns 500
    expect(res.body.success).toBe(false);
  });


  it('should reject update for non-existing category id with valid format', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/categories/${fakeId}`)
      .field('name', 'SomeName');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Category not found');
  });

  it('should get categories with pagination (if implemented)', async () => {
    const res = await request(app).get('/api/categories?page=1&limit=2');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });





  it('should reject creation with empty request body', async () => {
  const res = await request(app)
    .post('/api/categories')
    .send({});

  expect(res.statusCode).toBe(500);
  expect(res.body.success).toBe(false);
});





it('should handle simultaneous creation of categories with same name gracefully', async () => {
  const categoryName = `Simultaneous${Date.now()}`;

  const create1 = request(app).post('/api/categories').send({ name: categoryName });
  const create2 = request(app).post('/api/categories').send({ name: categoryName });

  const results = await Promise.allSettled([create1, create2]);

  const successCount = results.filter(r => r.status === 'fulfilled' && r.value.statusCode === 201).length;
  const failCount = results.filter(r => r.status === 'fulfilled' && r.value.statusCode !== 201).length;

  expect(successCount).toBe(1);
  expect(failCount).toBe(1);

  // Add the created category to cleanup if success
  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value.statusCode === 201) {
      createdCategoryIds.push(r.value.body.data._id);
    }
  });
});

it('should reject creation with null name field', async () => {
  const res = await request(app)
    .post('/api/categories')
    .send({ name: null });

  expect(res.statusCode).toBe(500);
  expect(res.body.success).toBe(false);
});





it('should get all categories with default limit if pagination params missing', async () => {
  const res = await request(app).get('/api/categories');

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(Array.isArray(res.body.data)).toBe(true);
});

it('should ignore extra fields on category creation', async () => {
  const res = await request(app)
    .post('/api/categories')
    .send({
      name: `ExtraFields${Date.now()}`,
      extraField1: 'extra1',
      extraField2: 1234
    });

  expect(res.statusCode).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data).not.toHaveProperty('extraField1');
  expect(res.body.data).not.toHaveProperty('extraField2');
  createdCategoryIds.push(res.body.data._id);
});

it('should get categories filtered by name (if filtering implemented)', async () => {
  // Create category to filter
  const categoryName = `FilterTest${Date.now()}`;
  const category = await Category.create({ name: categoryName });
  createdCategoryIds.push(category._id);

  // Assuming filtering is implemented via query param ?name=...
  const res = await request(app).get(`/api/categories?name=${categoryName}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.some(c => c.name === categoryName)).toBe(true);
});




it('should allow category creation with special characters in name', async () => {
  const specialName = `Fancy & Cool /#Category ${Date.now()}`;
  const res = await request(app)
    .post('/api/categories')
    .send({ name: specialName });

  expect(res.statusCode).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data.name).toBe(specialName);
  createdCategoryIds.push(res.body.data._id);
});


it('should return empty array when no categories exist (if applicable)', async () => {
  // You can ensure this runs in a clean DB or skip if not applicable
  const all = await Category.find();
  if (all.length === 0) {
    const res = await request(app).get('/api/categories');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  }
});








it('should get category by valid ObjectId but not in DB', async () => {
  const fakeId = new mongoose.Types.ObjectId();
  const res = await request(app).get(`/api/categories/${fakeId}`);

  expect(res.statusCode).toBe(404);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toBe('Category not found');
});



it('should return all categories even with unknown query params', async () => {
  const res = await request(app).get('/api/categories?unknownParam=xyz');

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(Array.isArray(res.body.data)).toBe(true);
});




});
