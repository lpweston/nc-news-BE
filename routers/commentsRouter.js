const { patchVotes, deleteComment } = require("../controllers/comments");
const { send405 } = require("../errors/index.js");
const commentsRouter = require("express").Router();

commentsRouter.route("/").all(send405);
commentsRouter
  .route("/:comment_id")
  .patch(patchVotes)
  .delete(deleteComment)
  .all(send405);

module.exports = commentsRouter;
