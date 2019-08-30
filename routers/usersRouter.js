const { getUser, getUsers, postUser } = require("../controllers/users");
const { send405 } = require("../errors/index.js");
const usersRouter = require("express").Router();

usersRouter
  .route("/")
  .get(getUsers)
  .post(postUser)
  .all(send405);
usersRouter
  .route("/:username")
  .get(getUser)
  .all(send405);

module.exports = usersRouter;
