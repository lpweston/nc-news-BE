const {
  selectArticle,
  countComments,
  updateVotes,
  insertComment,
  selectComments
} = require("../models/articles");

exports.getArticle = (req, res, next) => {
  const promises = Promise.all([
    selectArticle(req.params),
    countComments(req.params)
  ]);
  return promises
    .then(([article, { count }]) => {
      article.comment_count = count;
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.patchVotes = (req, res, next) => {
  updateVotes(req.params, req.body)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  insertComment(req.params, req.body)
    .then(comment => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.getComments = (req, res, next) => {
  selectComments(req.params, req.query)
    .then(comments => {
      res.status(200).send({ comments });
    })
    .catch(next);
};
