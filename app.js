const express = require("express");
const cors = require("cors");
const app = express();
const { apiRouter } = require("./routers/apiRouter.js");
const {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
  handleRouteError
} = require("./errors/index.js");

app.use(cors());
app.use(express.json());
app.use("/api", apiRouter);

app.all("/*", handleRouteError);
app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = app;
