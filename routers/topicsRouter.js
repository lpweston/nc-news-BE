const { getTopics, postTopic } = require("../controllers/topics");
const topicsRouter = require("express").Router();
const { send405 } = require("../errors/index.js");

topicsRouter
  .route("/")
  .get(getTopics)
  .post(postTopic)
  .all(send405);

module.exports = topicsRouter;
