const express = require("express");
const bodyParser = require("body-parser");

const router = express.Router();
const { checkRequiredParameters } = require("../utils/middleware");
const userHandler = require("../handlers/userHandler");

router.post(
  "/",
  (req, res) => {
    const { email, password } = req.body;
    // userHandler.getUserByEmail(email)
    userHandler.createUser(email, password)
  }
);

router.get(
    "/:userId",
    checkRequiredParameters(["userId"]),
    (req, res) => {
        const userId = req.params.userId;
    }
)

module.exports = router;
