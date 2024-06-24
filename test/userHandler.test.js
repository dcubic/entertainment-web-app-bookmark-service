const mongoose = require("mongoose");

const userHandler = require("../handlers/userHandler");
const dbConnector = require("../database/database");

const CONFLICT_STATUS_CODE = 409;

beforeAll(async () => await dbConnector.connect());

afterEach(async () => await dbConnector.clearDatabase());

afterAll(async () => await dbConnector.closeDatabase());

describe("createUser", () => {
  it("success case - create a user", async () => {
    const email = "pizza@potatoes.com";
    const password = "password123";

    const createdUser = await userHandler.createUser(email, password);

    expect(createdUser.id).toBeDefined();
    expect(createdUser.email).toBe(email);

    const retrievedCreatedUser = await userHandler.getUserById(createdUser.id);

    expect(createdUser).toEqual(retrievedCreatedUser);
  });

  it("success case - create two users with the same password", async () => {
    const email1 = "pizza@hotdog.com";
    const email2 = "hotdog@pizza.com";
    const sharedPassword = "pass123";

    const createdUser1 = await userHandler.createUser(email1, sharedPassword);
    const createdUser2 = await userHandler.createUser(email2, sharedPassword);

    expect(createdUser1.id).not.toBe(createdUser2.id);
  });

  it("error case - a user with the same email already exists within the database", async () => {
    const sharedEmail = "flimflam@zimzam.com";
    const user1Password = "1234";
    const user2PasswordAddendum = "5678";
    await userHandler.createUser(sharedEmail, user1Password);

    try {
      await userHandler.createUser(
        sharedEmail,
        user1Password + user2PasswordAddendum
      );
      expect(true).toBe(false); // This shouldn't be reached
    } catch (error) {
      expect(error.status).toBe(CONFLICT_STATUS_CODE);

      const expectedErrors = [
        {
          fieldName: "email",
          message:
            "Error, expected `email` to be unique. Value: `flimflam@zimzam.com`",
          kind: "unique",
        },
      ];
      expect(error.errors).toEqual(expect.arrayContaining(expectedErrors));
      expect(expectedErrors).toEqual(expect.arrayContaining(error.errors));
    }
  });
});

describe("deleteUser", () => {
  it("error case - user does not exist", async () => {
    const userId = new mongoose.Types.ObjectId();
    try {
      await userHandler.deleteUser(userId);
      expect(true).toBe(false); // Shouldn't reach this
    } catch (error) {
      const expectedError = {
        status: 404,
        message: `User with id \"${userId}\" not found`,
      };

      expect(error).toEqual(expectedError);
    }
  });

  it("success case", async () => {
    const email = "pizza@potatoes.com";

    const createdUser = await userHandler.createUser(email, "asdfdsafdsa");

    const deletedUser = await userHandler.deleteUser(createdUser.id);

    expect(deletedUser).toEqual(createdUser);

    try {
      await userHandler.deleteUser(createdUser.id);
      expect(true).toBe(false); // Shouldn't reach this
    } catch (error) {
      const expectedError = {
        status: 404,
        message: `User with id \"${createdUser.id}\" not found`,
      };

      expect(error).toEqual(expectedError);
    }
  });
});

describe("getUserById", () => {
  it("error case - no such user exists", async () => {
    const userId = new mongoose.Types.ObjectId();

    try {
      await userHandler.getUserById(userId.toString());
      expect(true).toBe(false); // Shouldn't reach this
    } catch (error) {
      const expectedError = {
        status: 404,
        message: `User with id \"${userId}\" not found`,
      };

      expect(error).toEqual(expectedError);
    }
  });

  it("success case - get two different users with two different ids", async () => {
    const user1 = await userHandler.createUser(
      "shimmy@shammy.com",
      "password123"
    );
    const user2 = await userHandler.createUser(
      "gandalf@maiarmail.com",
      "youshallnotpass"
    );

    const retrievedUser1 = await userHandler.getUserById(user1.id);
    const retrievedUser2 = await userHandler.getUserById(user2.id);

    expect(retrievedUser1).toEqual(user1);
    expect(retrievedUser2).toEqual(user2);
    expect(retrievedUser1.id).not.toBe(retrievedUser2.id);
  });
});

// describe("getUserByEmail", async () => {

// })
