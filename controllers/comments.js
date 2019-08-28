const { updateVotes, removeComment } = require("../models/comments");

exports.patchVotes = (req, res, next) => {
  updateVotes(req.params, req.body)
    .then(comment => {
      res.status(200).send({ comment });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  removeComment(req.params)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};
