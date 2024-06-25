const request = require("supertest");

const dbConnector = require("../../src/database/database");
const app = require("../../src/app/app");
const StatusCode = require("../../src/utils/statuscode");
const userHandler = require("../../src/handlers/userHandler");

beforeAll(async () => await dbConnector.connect());

afterEach(async () => await dbConnector.clearDatabase());

afterAll(async () => await dbConnector.closeDatabase());

describe("createUser", () => {
  it("error case - missing email body parameter", () => {
    return request(app)
      .post(`/users/`)
      .send({ password: "password123" })
      .then((response) => {
        expect(response.status).toBe(StatusCode.BAD_REQUEST);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "Invalid email address",
              path: "email",
              type: "field",
            },
          ],
        });
      });
  });

  it("error case - invalid email body parameter", () => {
    return request(app)
      .post(`/users/`)
      .send({ email: "pizzapotato123", password: "password123" })
      .then((response) => {
        expect(response.status).toBe(StatusCode.BAD_REQUEST);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "Invalid email address",
              path: "email",
              type: "field",
              value: "pizzapotato123",
            },
          ],
        });
      });
  });

  it("error case - missing password body parameter", () => {
    return request(app)
      .post(`/users/`)
      .send({ email: "pizzapotato123@email.com" })
      .then((response) => {
        expect(response.status).toBe(StatusCode.BAD_REQUEST);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "Password cannot be empty",
              path: "password",
              type: "field",
            },
          ],
        });
      });
  });

  it("error case - empty password body parameter", () => {
    return request(app)
      .post(`/users/`)
      .send({ email: "pizzapotato123@email.com", password: "" })
      .then((response) => {
        expect(response.status).toBe(StatusCode.BAD_REQUEST);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "Password cannot be empty",
              path: "password",
              type: "field",
              value: "",
            },
          ],
        });
      });
  });

  it("success case", async () => {
    const email = "cookiemonster@sesamestreet.com";
    const response = await request(app)
      .post("/users/")
      .send({ email: email, password: "gandalf" });

    expect(response.status).toBe(StatusCode.OK);

    const id = response.body.id;
    expect(response.body.email).toBe(email);

    const createdUser = await userHandler.getUserById(id);
    expect(createdUser).toEqual({
      id: id,
      email: email,
    });
  });
});

describe("getUserById", () => {
  it("error case - no such user with id found", () => {
    const FAKE_ID = "ASDFQWER";

    return request(app)
      .get(`/users/${FAKE_ID}/`)
      .expect(StatusCode.NOT_FOUND)
      .then((response) => {
        expect(response.body.message).toBe(
          `User with id \"${FAKE_ID}\" not found`
        );
      });
  });

  it("success case", () => {
    const email = "pizza@icecream.com";
    const password = "password";
    return userHandler.createUser(email, password).then((user) => {
      return request(app)
        .get(`/users/${user.id}/`)
        .expect(StatusCode.OK)
        .then((response) => {
          expect(response.body).toEqual(user);
        });
    });
  });
});

describe("deleteUserById", () => {
  it("error case - no such user with id found", () => {
    const FAKE_ID = "ASDFQWER";

    return request(app)
      .delete(`/users/${FAKE_ID}/`)
      .expect(StatusCode.NOT_FOUND)
      .then((response) => {
        expect(response.body.message).toBe(
          `User with id \"${FAKE_ID}\" not found`
        );
      });
  });

  it("success case", async () => {
    const email = "pizza@icecream.com";
    const password = "password";
    const user = await userHandler.createUser(email, password);

    const response = await request(app)
      .delete(`/users/${user.id}/`)
      .expect(StatusCode.OK)
      .then((response) => {
        expect(response.body).toEqual(user);
      });

    try {
      await userHandler.getUserById(user.id);
    } catch (error) {
      expect(error.status).toBe(StatusCode.NOT_FOUND);
    }

    return response;
  });
});
