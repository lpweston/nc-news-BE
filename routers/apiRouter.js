const topicsRouter = require("./topicsRouter");
const usersRouter = require("./usersRouter");
const articlesRouter = require("./articlesRouter");
const commentsRouter = require("./commentsRouter");
const { getApi } = require("../controllers/api");
const { send405 } = require("../errors/index.js");
const apiRouter = require("express").Router();

apiRouter
  .route("/")
  .get(getApi)
  .all(send405);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentsRouter);

module.exports = { apiRouter };
