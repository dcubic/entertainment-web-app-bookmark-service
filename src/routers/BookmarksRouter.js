const express = require("express");
const BookmarksHandler = require("../handlers/BookmarksHandler");
const StatusCode = require("../utils/StatusCode");
const {
  checkRequiredParameters,
  handleValidationErrors,
} = require("../utils/middleware");

const asyncWrapper = (operation) => {
  return (request, response, next) => {
    Promise.resolve(operation(request, response, next)).catch(next);
  };
};

class BookmarksRouter {
  #router = express.Router();
  #bookmarksHandler = new BookmarksHandler();

  constructor() {
    this.#initializeRoutes();
  }

  #initializeRoutes() {
    this.router.get("/", asyncWrapper(this.getBookmarks.bind(this)));
    this.router.post(
      "/",
      [body("title").notEmpty().withMessage("Bookmark title cannot be empty")],
      handleValidationErrors,
      asyncWrapper(this.addBookmark.bind(this))
    );
    this.router.delete(
      checkRequiredParameters(["title"]),
      "/:title",
      asyncWrapper(this.deleteBookmark.bind(this))
    );
  }

  async getBookmarks(request, response) {
    const bookmarks = await this.#bookmarksHandler.getBookmarks(
      request.params.userId
    );
    response.status(StatusCode.OK).json(bookmarks);
  }

  async addBookmark(request, response) {
    const { title } = request.body;

    await this.#bookmarksHandler.addBookmark(request.params.userId, title);
    response.status(StatusCode.OK);
  }

  async deleteBookmark(request, response) {
    await this.#bookmarksHandler.deleteBookmark(
      request.params.userId,
      request.params.title
    );
    response.status(StatusCode.OK);
  }

  getRouter() {
    return this.#router;
  }
}

module.exports = BookmarksRouter;
