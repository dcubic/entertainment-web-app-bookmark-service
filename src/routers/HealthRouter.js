const express = require("express");
const StatusCode = require("../utils/StatusCode");

class HealthRouter {
  #router = express.Router({ mergeParams: true });

  constructor() {
    this.#initializeRoutes()
  }

  #initializeRoutes() {
    this.#router.get(
      "/",
      this.getHealth.bind(this)
    );
  }

  getHealth(request, response) {
    response.status(StatusCode.OK).send()
  }

  getRouter() {
    return this.#router;
  }
}

module.exports = HealthRouter;
