const {
  selectArticles,
  updateVotes,
  insertComment,
  selectComments
} = require("../models/articles");

exports.getArticles = (req, res, next) => {
  selectArticles(req.params, req.query)
    .then(articles => {
      if (articles.length === 1) {
        res.status(200).send({ article: articles[0] });
      }
      res.status(200).send({ articles });
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
  selectArticles(req.params, req.query)
    .then(() => {
      return selectComments(req.params, req.query);
    })
    .then(comments => {
      res.status(200).send({ comments });
    })
    .catch(next);
};
