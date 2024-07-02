const request = require("supertest");
const jwt = require("jsonwebtoken");
const {
  Types: { ObjectId },
} = require("mongoose");
const app = require("../../src/app/app");
const dbConnector = require("../../src/database/DatabaseConnector");
const StatusCode = require("../../src/utils/StatusCode");
const { JWT_SECRET } = require("../../src/utils/testingconstants");
const BookmarksDatabase = require("../../src/database/bookmarks/BookmarksDatabase");

const bookmarksDatabase = new BookmarksDatabase();

beforeAll(async () => await dbConnector.connect());

afterEach(async () => await dbConnector.clearDatabase());

afterAll(async () => await dbConnector.closeDatabase());

const randomObjectId = () => {
  const objectId = new ObjectId();
  return objectId.toString();
};

describe("JWT Authentication", () => {
  it("failure case - JWT is missing", async () => {
    const response = await request(app).get("/users/:userId/bookmarks");

    expect(response.status).toBe(StatusCode.UNAUTHORIZED);
    expect(response.body).toEqual({ message: "Invalid Credentials" });
  });

  it("failure case - not a valid JWT", async () => {
    const response = await request(app)
      .get("/users/:userId/bookmarks")
      .set("Authorization", `Bearer ASDSADASD`);

    expect(response.status).toBe(StatusCode.UNAUTHORIZED);
    expect(response.body).toEqual({ message: "Invalid Credentials" });
  });

  it("failure case - JWT is expired", async () => {
    const userId = randomObjectId();
    const email = "pizza@lunch.com";

    const token = jwt.sign({ subject: userId, email: email }, JWT_SECRET, {
      expiresIn: "-1h",
    });

    const response = await request(app)
      .get(`/users/${userId}/bookmarks`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(StatusCode.UNAUTHORIZED);
    expect(response.body).toEqual({ message: "Invalid Credentials" });
  });

  it("failure case - JWT has an invalid signature (secret is different)", async () => {
    const differentSecret = "SECRETY_WECRETY";
    const userId = randomObjectId();
    const email = "pizza@lunch.com";

    const token = jwt.sign({ subject: userId, email: email }, differentSecret, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .get(`/users/${userId}/bookmarks`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(StatusCode.UNAUTHORIZED);
    expect(response.body).toEqual({ message: "Invalid Credentials" });
  });

  it("failure case - JWT has been tampered with", async () => {
    const userId = randomObjectId();
    const email = "pizza@lunch.com";

    const validToken = jwt.sign({ subject: userId, email: email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const [header, payload, signature] = validToken.split(".");
    const decodedPayload = JSON.parse(
      Buffer.from(payload, "Base64").toString()
    );
    decodedPayload.email = "xXx_eL337_H4CK3R_xXx";

    const tamperedPayload = Buffer.from(
      JSON.stringify(decodedPayload)
    ).toString("base64");
    const tamperedToken = `${header}.${tamperedPayload}.${signature}`;

    const response = await request(app)
      .get(`/users/${userId}/bookmarks`)
      .set("Authorization", `Bearer ${tamperedToken}`);

    expect(response.status).toBe(StatusCode.UNAUTHORIZED);
    expect(response.body).toEqual({ message: "Invalid Credentials" });
  });
});

describe("JWT Authorization", () => {
  it("error case - user is unauthorized to perform this operation", async () => {
    const callingUserId = randomObjectId();
    const bookmarkOwnerUserId = randomObjectId();
    const email = "chagrin@rage.com";

    const callingUserToken = jwt.sign(
      { subject: callingUserId, email: email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .get(`/users/${bookmarkOwnerUserId}/bookmarks`)
      .set("Authorization", `Bearer ${callingUserToken}`);

    expect(response.status).toBe(StatusCode.FORBIDDEN);
    expect(response.body).toEqual({
      message: "Not Authorized to perform this operation",
    });
  });
});

describe("getBookmarks", () => {
  it("success case - user has no bookmarks", async () => {
    const userId = randomObjectId();
    const email = "pizza@hotdog.com";

    const token = jwt.sign({ subject: userId, email: email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .get(`/users/${userId}/bookmarks`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(StatusCode.OK);
    expect(response.body).toEqual([]);
  });

  it("success case - user has multiple bookmarks", async () => {
    const userId = randomObjectId();
    const email = "pizza@hotdog.com";

    const token = jwt.sign({ subject: userId, email: email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const bookmarkTitles = ["SNAP", "CRACKLE", "POP"];

    for (const title of bookmarkTitles) {
      await bookmarksDatabase.createBookmark(userId, title);
    }

    const response = await request(app)
      .get(`/users/${userId}/bookmarks`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(StatusCode.OK);
    expect(response.body.sort()).toEqual(bookmarkTitles.sort());
  });
});

describe("addBookmark", () => {
  it("error case - attempting to add a bookmark that already exists", async () => {
    const title = "BOOKMARK-TITLE";
    const userId = "PIZZA";
    const email = "fat@dog.com";

    await bookmarksDatabase.createBookmark(userId, title);

    const token = jwt.sign({ subject: userId, email: email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .post(`/users/${userId}/bookmarks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title });

    expect(response.status).toBe(StatusCode.CONFLICT);
    expect(response.body).toEqual({ message: "Bookmark already exists" });
  });

  it("success case", async () => {
    const title = "BOOKMARK-TITLE";
    const userId = "PIZZA";
    const email = "fat@dog.com";

    const token = jwt.sign({ subject: userId, email: email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .post(`/users/${userId}/bookmarks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title });

    expect(response.status).toBe(StatusCode.OK);
  });
});

describe("removeBookmark", () => {
  it("error case - attempting to remove a bookmark that doesnt exist", async () => {
    const title = "BOOKMARK-TITLE";
    const userId = "PIZZA";
    const email = "fat@dog.com";

    const token = jwt.sign({ subject: userId, email: email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .delete(`/users/${userId}/bookmarks/${title}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title });

    expect(response.status).toBe(StatusCode.NOT_FOUND);
    expect(response.body).toEqual({ message: `Bookmark with title \"${title}\" not found`})
  });

  it("success case", async () => {
    const title = "BOOKMARK-TITLE";
    const userId = "PIZZA";
    const email = "fat@dog.com";

    await bookmarksDatabase.createBookmark(userId, title);

    const token = jwt.sign({ subject: userId, email: email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .delete(`/users/${userId}/bookmarks/${title}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title });

    expect(response.status).toBe(StatusCode.OK);
  });
});
