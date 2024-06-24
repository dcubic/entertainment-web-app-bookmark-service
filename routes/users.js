const express = require("express");
const { body, validationResult } = require("express-validator");

const router = express.Router();
const { checkRequiredParameters } = require("../utils/middleware");
const userHandler = require("../handlers/userHandler");
const StatusCode = require("../utils/statuscode");

router.post(
  "/",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password cannot be empty"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    userHandler
      .createUser(email, password)
      .then((createdUser) => {
        res.status(StatusCode.OK).json(createdUser);
      })
      .catch((error) => {
        res.status(error.status).json({ message: error.message });
      });
  }
);

router.get("/:userId", checkRequiredParameters(["userId"]), (req, res) => {
  userHandler
    .getUserById(req.params.userId)
    .then((user) => {
      res.status(StatusCode.OK).json(user);
    })
    .catch((error) => {
      res.status(error.status).json({ message: error.message });
    });
});

router.delete("/:userId", checkRequiredParameters(["userId"]), (req, res) => {
  userHandler
    .deleteUser(req.params.userId)
    .then((user) => {
      res.status(StatusCode.OK).json(user);
    })
    .catch((error) => {
      res.status(error.status).json({ message: error.message });
    });
});

module.exports = router;
