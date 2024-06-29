const request = require("supertest");
const jwt = require("jsonwebtoken");
// const mongoose = require("mongoose");
const {
  Types: { ObjectId },
} = require("mongoose");
const app = require("../../src/app/app");
// const dbConnector = require("../../src/database/database");
const StatusCode = require("../../src/utils/StatusCode");
const { JWT_SECRET } = require("../../src/utils/testingconstants");
// const bookmarksHandler = require("../../src/handlers/BookmarksHandler");

beforeAll(async () => await dbConnector.connect());

afterEach(async () => await dbConnector.clearDatabase());

afterAll(async () => await dbConnector.closeDatabase());

describe("JWT Authentication", () => {
  it("failure case - JWT is missing", async () => {
    const response = await request(app).get("/users/:userId/bookmarks");

    expect(response.status).toBe(StatusCode.UNAUTHORIZED);
    expect(response.body).toEqual({ message: "" });
  });

  it("failure case - not a valid JWT", async () => {
    const response = await request(app)
      .get("/users/:userId/bookmarks")
      .set("Authorization", `Bearer ASDSADASD`);

    expect(response.status).toBe(StatusCode.UNAUTHORIZED);
    expect(response.body).toEqual({ message: "" });
  });

  it("failure case - JWT is expired", async () => {
    const userId = ObjectId().toString();
    const email = "pizza@lunch.com";

    const token = jwt.sign({ subject: userId, email: email }, JWT_SECRET, {
      expiresIn: Math.floor(Date.now() / 1000) - 3600,
    });

    const response = await request(app)
      .get(`/users/${userId}/bookmarks`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(StatusCode.UNAUTHORIZED);
    expect(response.body).toEqual({ message: "" });
  });

  it("failure case - JWT has an invalid signature (secret is different)", async () => {
    const differentSecret = "SECRETY_WECRETY";
    const userId = ObjectId().toString();
    const email = "pizza@lunch.com";

    const token = jwt.sign({ subject: userId, email: email }, differentSecret, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .get(`/users/${userId}/bookmarks`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(StatusCode.UNAUTHORIZED);
    expect(response.body).toEqual({ message: "" });
  });

  it("failure case - JWT is for different user", async () => {
    const userId = ObjectId().toString();
    const alternateUserId = ObjectId().toString();
    const email = "pizza@lunch.com";

    const token = jwt.sign(
      { subject: alternateUserId, email: email },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const response = await request(app)
      .get(`/users/${userId}/bookmarks`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(StatusCode.UNAUTHORIZED);
    expect(response.body).toEqual({ message: "" });
  });

  it("failure case - JWT has been tampered with", async () => {
    const userId = ObjectId().toString();
    const email = "pizza@lunch.com";

    const validToken = jwt.sign(
      { subject: userId, email: email },
      differentSecret,
      {
        expiresIn: "1h",
      }
    );

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
    expect(response.body).toEqual({ message: "" });
  });
});

// describe("getBookmarks", () => {
//   it("success case - 0 bookmarks retrieved", () => {
//     return userHandler
//       .createUser("email@email.com", "password")
//       .then((createdUser) => {
//         return request(app)
//           .get(`/users/${createdUser.id}/bookmarks`)
//           .then((response) => {
//             expect(response.status).toBe(StatusCode.OK);
//             expect(response.body.bookmarks).toHaveLength(0);
//           });
//       });
//   });

//   it("success case - multiple bookmarks retrieved", async () => {
//     const user = await userHandler.createUser("email@pizza.com", "password");
//     const bookmarks = [
//       "ABC",
//       "DEF",
//       "GHI",
//       "JKL",
//       "MNO",
//       "PQR",
//       "STU",
//       "VXW",
//       "YZ",
//     ];
//     for (const bookmark of bookmarks) {
//       await bookmarksHandler.addBookmark(user.id, bookmark);
//     }

//     const response = await request(app).get(`/users/${user.id}/bookmarks`);

//     expect(response.status).toBe(StatusCode.OK);
//     expect(response.body.bookmarks).toEqual(bookmarks);
//   });
// });

// describe("createBookmark", () => {
//   it("error case - no user matches userId", async () => {
//     const randomId = new mongoose.Types.ObjectId();

//     const response = await request(app)
//       .post(`/users/${randomId}/bookmarks`)
//       .send({ title: "RANDOM_TITLE" });

//     expect(response.status).toBe(StatusCode.NOT_FOUND);
//     expect(response.body).toEqual({
//       message: `User with id \"${randomId}\" not found`,
//     });
//   });

//   it("error case - missing bookmark parameter", async () => {
//     const userId = await userHandler.createUser(
//       "validemail@email.com",
//       "password"
//     );
//     const response = await request(app)
//       .post(`/users/${userId}/bookmarks`)
//       .send({ otherParameter: "asdf" });
//     expect(response.status).toBe(StatusCode.BAD_REQUEST);
//     expect(response.body).toEqual({
//       errors: [
//         {
//           location: "body",
//           msg: "Bookmark title cannot be empty",
//           path: "title",
//           type: "field",
//         },
//       ],
//     });
//   });

//   it("error case - empty bookmark title", async () => {
//     const userId = await userHandler.createUser(
//       "validemail@email.com",
//       "password"
//     );
//     const response = await request(app)
//       .post(`/users/${userId}/bookmarks`)
//       .send({ bookmark: "" });
//     expect(response.status).toBe(StatusCode.BAD_REQUEST);
//     expect(response.body).toEqual({
//       errors: [
//         {
//           location: "body",
//           msg: "Bookmark title cannot be empty",
//           path: "title",
//           type: "field",
//         },
//       ],
//     });
//   });

//   it("success case", async () => {
//     const user = await userHandler.createUser(
//       "validEmail@email.com",
//       "password123"
//     );
//     const bookmarkTitle = "BOOKMARK";
//     const response = await request(app)
//       .post(`/users/${user.id}/bookmarks`)
//       .send({ title: bookmarkTitle });

//     expect(response.status).toBe(StatusCode.OK);
//   });

//   it("error case - a bookmark with the given title already exists for the user", async () => {});
// });

// describe("deleteBookmarkById", () => {
//   it("error case - no such user exists", async () => {
//     const randomId = new mongoose.Types.ObjectId();
//     const otherUser = await userHandler.createUser(
//       "email@email.com",
//       "password123"
//     );
//     const otherUserBookmark = "BOOKMARK";
//     await bookmarksHandler.addBookmark(otherUser.id, otherUserBookmark);

//     const response = await request(app).delete(
//       `/users/${randomId}/bookmarks/${otherUserBookmark}`
//     );

//     expect(response.status).toBe(StatusCode.NOT_FOUND);
//     expect(response.body).toEqual({
//       message: `User with id \"${randomId}\" not found`,
//     });
//   });

//   it("error case - no such bookmark exists", async () => {
//     const user = await userHandler.createUser("email@email.com", "password123");
//     const someBookmark = "SOME_BOOKMARK";
//     await bookmarksHandler.addBookmark(user.id, someBookmark);
//     const someOtherBookmark = "SOME_OTHER_BOOKMARK";

//     const response = await request(app).delete(
//       `/users/${user.id}/bookmarks/${someOtherBookmark}`
//     );

//     expect(response.status).toBe(StatusCode.NOT_FOUND);
//     expect(response.body).toEqual({
//       message: `Bookmark with title \"${someOtherBookmark}\" not found`,
//     });
//   });

//   it("success case", async () => {
//     const user = await userHandler.createUser("email@email.com", "password123");
//     const bookmark = "SOME_BOOKMARK";
//     await bookmarksHandler.addBookmark(user.id, bookmark);

//     const response = await request(app).delete(
//       `/users/${user.id}/bookmarks/${bookmark}`
//     );

//     expect(response.status).toBe(StatusCode.OK);
//   });
// });
