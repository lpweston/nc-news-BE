const {
  getArticle,
  patchVotes,
  postComment,
  getComments
} = require("../controllers/articles");
const { send405 } = require("../errors/index.js");
const articlesRouter = require("express").Router();

articlesRouter
  .route("/:article_id")
  .get(getArticle)
  .patch(patchVotes)
  .all(send405);
articlesRouter
  .route("/:article_id/comments")
  .post(postComment)
  .get(getComments)
  .all(send405);

module.exports = articlesRouter;
