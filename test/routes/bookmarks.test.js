const request = require("supertest");
const app = require("../../app/app");
const dbConnector = require("../../database/database");
const StatusCode = require("../../utils/statuscode");
const userHandler = require("../../handlers/userHandler");
const bookmarksHandler = require("../../handlers/bookmarksHandler");

beforeAll(async () => await dbConnector.connect());

afterEach(async () => await dbConnector.clearDatabase());

afterAll(async () => await dbConnector.closeDatabase());

describe("getBookmarks", () => {
  it("failure case - no such user exists", () => {
    return request(app)
    .get(`/users/FAKE/bookmarks`)
    .then((response) => {
        expect(response.status).toBe(StatusCode.NOT_FOUND)
        expect(response.body.message).toBe('User with id \"FAKE\" not found')
    })
  });

  it("success case - 0 bookmarks retrieved", () => {
    return userHandler
      .createUser("email@email.com", "password")
      .then((createdUser) => {
        return request(app)
          .get(`/users/${createdUser.id}/bookmarks`)
          .then((response) => {
            expect(response.status).toBe(StatusCode.OK);
            expect(response.body.bookmarks).toHaveLength(0);
          });
      });
  });

  it("success case - multiple bookmarks retrieved", async () => {
    const user = await userHandler.createUser("email@pizza.com", "password");
    const bookmarks = [
      "ABC",
      "DEF",
      "GHI",
      "JKL",
      "MNO",
      "PQR",
      "STU",
      "VXW",
      "YZ",
    ];
    for (const bookmark of bookmarks) {
      await bookmarksHandler.addBookmark(user.id, bookmark);
    }

    const response = await request(app).get(`/users/${user.id}/bookmarks`);

    expect(response.status).toBe(StatusCode.OK);
    expect(response.body.bookmarks).toEqual(bookmarks);
  });
});

describe("createBookmark", () => {
  it("error case - no user matches userId", () => {
    
  });

  it("success case", async () => {});

  it("error case - a bookmark with the given title already exists for the user", async () => {});
});

describe("deleteBookmarkById", () => {
    it("error case - no such user exists", () => {});

    it("error case - no such bookmark exists", () => {});

    it("success case", () => {});
})
