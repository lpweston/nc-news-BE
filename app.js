const express = require("express");
const app = express();
const { apiRouter } = require("./routers/apiRouter.js");
const {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
  handleRouteError
} = require("./errors/index.js");

app.use(express.json());
app.use("/api", apiRouter);

app.all("/*", handleRouteError);
app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = app;
