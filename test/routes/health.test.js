const request = require("supertest");
const app = require("../../src/app/app");
const dbConnector = require("../../src/database/DatabaseConnector");
const StatusCode = require("../../src/utils/StatusCode");

beforeAll(async () => await dbConnector.connect());

afterAll(async () => await dbConnector.closeDatabase());

describe("Health Check", () => {
  it("success case", async () => {
    const response = await request(app).get("/bookmark/health");
    expect(response.status).toBe(StatusCode.OK);
  });
});
