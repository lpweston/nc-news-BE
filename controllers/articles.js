const {
  selectArticles,
  countComments,
  updateVotes,
  insertComment,
  selectComments
} = require("../models/articles");

exports.getArticles = (req, res, next) => {
  const promises = Promise.all([
    selectArticles(req.params, req.query),
    countComments(req.params)
  ]);
  return promises
    .then(([articles, countRef]) => {
      if (articles.length === 1) {
        articles[0].comment_count = countRef[articles[0].article_id] || 0;
        res.status(200).send({ article: articles[0] });
      }
      articles.forEach(article => {
        article.comment_count = countRef[article.article_id] || 0;
        delete article.body;
      });
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
  selectComments(req.params, req.query)
    .then(comments => {
      res.status(200).send({ comments });
    })
    .catch(next);
};
