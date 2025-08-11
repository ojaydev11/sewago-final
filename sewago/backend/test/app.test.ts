import request from "supertest";
import { createApp } from "../src/app.js";
import { connectToDatabase } from "../src/config/db.js";
import mongoose from "mongoose";

const app = createApp();

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/sewago_e2e";
  await connectToDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

it("GET /api/health", async () => {
  const res = await request(app).get("/api/health");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ ok: true });
});

it("Auth register/login", async () => {
  const email = `smoke_${Date.now()}@ex.com`;
  const phone = String(9800000000 + Math.floor(Math.random() * 1000));
  const reg = await request(app).post("/api/auth/register").send({ name: "T", email, phone, password: "pass" });
  expect(reg.status).toBe(201);
  const token = reg.body.accessToken;
  expect(token).toBeTruthy();
  const login = await request(app).post("/api/auth/login").send({ emailOrPhone: email, password: "pass" });
  expect(login.status).toBe(200);
});

it("Payments stubs", async () => {
  // Stubs require auth; create a user and pass Bearer
  const email = `stub_${Date.now()}@ex.com`;
  const phone = String(9810000000 + Math.floor(Math.random() * 1000));
  const reg = await request(app).post("/api/auth/register").send({ name: "U", email, phone, password: "pass" });
  const token = reg.body.accessToken as string;
  const esewa = await request(app).post("/api/payments/esewa/initiate").set("Authorization", `Bearer ${token}`);
  expect(esewa.status).toBe(200);
  expect(esewa.body.ok).toBe(true);
  const khalti = await request(app).post("/api/payments/khalti/initiate").set("Authorization", `Bearer ${token}`);
  expect(khalti.status).toBe(200);
  expect(khalti.body.ok).toBe(true);
});

it("Services list & booking create", async () => {
  // seed provider and service
  await request(app).post("/api/admin/seed").set("X-Seed-Key", "dev-seed-key");
  // register user and book
  const email = `book_${Date.now()}@ex.com`;
  const phone = String(9840000000 + Math.floor(Math.random() * 1000));
  const reg = await request(app).post("/api/auth/register").send({ name: "U", email, phone, password: "pass" });
  const token = reg.body.accessToken as string;
  const services = await request(app).get("/api/services");
  expect(services.status).toBe(200);
  expect(Array.isArray(services.body)).toBe(true);
  const svc = services.body[0];
  const booking = await request(app)
    .post("/api/bookings")
    .set("Authorization", `Bearer ${token}`)
    .send({ serviceId: svc._id, date: new Date().toISOString(), timeSlot: "10:00-11:00", price: 1000, address: "KT" });
  expect(booking.status).toBe(201);
});


