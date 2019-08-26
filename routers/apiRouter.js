const topicsRouter = require("./topicsRouter");
const usersRouter = require("./usersRouter");
const apiRouter = require("express").Router();

apiRouter.use("/topics", topicsRouter);
apiRouter.use("/users", usersRouter);

module.exports = { apiRouter };
