const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index"); // Adjust path if needed
const Order = require("../models/Order");

describe("Order API", () => {
  let orderId;

  it("1. should place a new order", async () => {
    const res = await request(app)
      .post("/api/orders/place")
      .send({
        fullName: "Test User",
        address: "Pokhara",
        phone: "9812345678",
        paymentMethod: "cod",
        items: [
          {
            productId: new mongoose.Types.ObjectId(),
            quantity: 1
          }
        ]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    expect(res.body.fullName).toBe("Test User");

    orderId = res.body._id;
  });

  it("2. should return the order in all orders list", async () => {
    const res = await request(app).get("/api/orders");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const order = res.body.find(o => o._id === orderId);
    expect(order).toBeDefined();
    expect(order.fullName).toBe("Test User");
  });




  it("5. should fail to place an order with missing fields", async () => {
    const res = await request(app)
      .post("/api/orders/place")
      .send({
        // Missing required fields like fullName, phone, etc.
        address: "Kathmandu",
        paymentMethod: "cod",
        items: []
      });

    expect(res.statusCode).toBe(400); // Adjust based on your validation logic
    expect(res.body.message).toMatch(/required/i);
  });

  afterAll(async () => {
    await mongoose.connection.close(); // No deletion
  });




   it("should place a new order with paymentMethod 'esewa'", async () => {
    const res = await request(app)
      .post("/api/orders/place")
      .send({
        fullName: "Payment Method Test",
        address: "Kathmandu",
        phone: "9800000000",
        paymentMethod: "esewa",
        items: [
          {
            productId: new mongoose.Types.ObjectId(),
            quantity: 2,
          },
        ],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.paymentMethod).toBe("esewa");
    orderId = res.body._id;
  });

  


  // 3. Fail placing order when items array is missing
  it("should fail when items array is missing", async () => {
    const res = await request(app)
      .post("/api/orders/place")
      .send({
        fullName: "Missing Items",
        address: "Bhaktapur",
        phone: "9800000002",
        paymentMethod: "cod",
        // items missing here
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/items/);
  });

  // 4. Get all orders returns array sorted by creation date descending
  it("should get all orders sorted by creation date descending", async () => {
    const res = await request(app).get("/api/orders");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // Check if sorted descending by createdAt
    if (res.body.length > 1) {
      for (let i = 0; i < res.body.length - 1; i++) {
        expect(new Date(res.body[i].createdAt).getTime())
          .toBeGreaterThanOrEqual(new Date(res.body[i + 1].createdAt).getTime());
      }
    }
  });

  // 5. Place order with missing optional paymentMethod (should default to 'cod')
  it("should place order with default paymentMethod 'cod' if not provided", async () => {
    const res = await request(app)
      .post("/api/orders/place")
      .send({
        fullName: "Default Payment",
        address: "Dharan",
        phone: "9800000003",
        items: [
          {
            productId: new mongoose.Types.ObjectId(),
            quantity: 3,
          },
        ],
        // no paymentMethod provided
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.paymentMethod).toBe("cod");
  });
});
