const { getUser } = require("../controllers/users");
const { send405 } = require("../errors/index.js");
const usersRouter = require("express").Router();

usersRouter
  .route("/:username")
  .get(getUser)
  .all(send405);

module.exports = usersRouter;
