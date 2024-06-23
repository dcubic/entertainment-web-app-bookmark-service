const User = require("../models/user");

const CONFLICT_STATUS_CODE = 409;

describe("createUser", () => {
  it("success case - create a user", async () => {
    const user = new User({
      email: "pizza@potatoes.com",
      password: "eskimo123",
    });
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(user.email);
    expect(savedUser.password).toBe(savedUser.password);
  });

  it("success case - create two users with the same password", async () => {
    const user1 = new User({
        email: 'asdf@asdf.com', password: 'pass123'
    });
    await user1.save();

    const user2 = new User({
        email: 'fdsa@asdf.com', password: 'pass123'
    });
    const savedUser2 = await user2.save();

    expect(savedUser2._id).toBeDefined();
    expect(savedUser2.email).toBe(user2.email);
    expect(savedUser2.password).toBe(user1.password);
    expect(savedUser2.password).toBe(user2.password);
  });

  it("error case - a user with the same email already exists within the database", async () => {
    const duplicatedEmail = "hotshot@flimflam.com";
    const firstUser = new User({ email: duplicatedEmail, password: "123" });
    await firstUser.save();

    try {
      new User({ email: duplicatedEmail, password: "456" });
      expect(true).toBe(false); // This shouldn't be reached
    } catch (error) {
      expect(error.status).toBe(CONFLICT_STATUS_CODE);

      const expectedErrors = [
        { fieldName: "email", message: "TODO", kind: "unique" },
      ];

      expect(error.errors.toEqual(expect.arrayContaining(expectedErrors)));
      expect(expectedErrors.toEqual(expect.arrayContaining(error.errors)));
    }
  });
});
