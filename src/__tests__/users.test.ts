import { describe, expect, test, beforeEach, afterAll } from "@jest/globals";
const app = require("../app.ts");
const request = require("supertest");
const testData = require("../db/data/test-data/index.js");
const { seed } = require("../db/seeds/seed");
const { db } = require("../db/connection");

beforeEach(() => seed(testData));
afterAll(() => db.end());

interface UserData {
  user_id: number;
  username: string;
  bio: string;
  avatar_img_url: string;
}

describe("GET /api/users", () => {
  test("200: returns an array of user objects", async () => {
    const {
      status,
      body: { users },
    } = await request(app).get("/api/users");
    expect(status).toBe(200);
    expect(users.length).toBe(2);

    users.forEach((user: UserData) => {
      expect(typeof user.user_id).toBe("number");

      expect(typeof user.username).toBe("string");
      expect(typeof user.bio).toBe("string");
      expect(typeof user.avatar_img_url).toBe("string");
    });
  });
});

describe("GET /api/users/:user_id", () => {
  test("200: returns a user object by user_id, { username: '', bio: '', avatar_img_url: ''}", async () => {
    const {
      status,
      body: { user },
    } = await request(app).get("/api/users/1");
    expect(status).toBe(200);
    expect(user.user_id).toBe(1);
    expect(user).toMatchObject({
      user_id: 1,
      username: "freezypop",
      bio: "I like to sit in the fridge making sick burns about the maternal figure in your life.",
      avatar_img_url:
        "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f",
    });
  });
  test("400: Bad request for invalid filepath", async () => {
    const {
      status,
      body: { msg },
    } = await request(app).get("/api/users/:banana");
    expect(status).toBe(400);
    expect(msg).toBe("Bad Request");
  });
  test("404: Not Found for none-existent user", async () => {
    const {
      status,
      body: { msg },
    } = await request(app).get("/api/users/5000");
    expect(status).toBe(404);
    expect(msg).toBe("User does not exist!");
  });
  describe("/solutions", () => {
    test("GET 200: returns an array of the user's solutions with kata_id, solution_id, solution", async () => {
      const { body } = await request(app)
        .get("/api/users/1/solutions")
        .expect(200);

      expect(body.solutions[0]).toMatchObject({
        kata_id: expect.any(Number),
        kata_name: expect.any(String),
        solution_id: expect.any(Number),
        solution: expect.any(String),
      });
    });
    test("GET 400: responds with appropriate message and status code when given an invalid user_id", async () => {
      const { body } = await request(app)
        .get("/api/users/:banana/solutions")
        .expect(400);
      expect(body.msg).toBe("Bad Request");
    });
    test("GET 404: responds with an appropriate message and status code when given a valid user_id that has no solutions", async () => {
      const { body } = await request(app)
        .get("/api/users/4/solutions")
        .expect(404);
      expect(body.msg).toBe("No solutions found for that user");
    });
  });
});
