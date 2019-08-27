const {
  selectArticle,
  countComments,
  updateVotes
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
  updateVotes(req.body, req.params)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(next);
};
