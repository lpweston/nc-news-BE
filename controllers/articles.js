const {
  selectArticles,
  updateVotes,
  insertComment,
  selectComments,
  countArticles,
  checkArticle,
  countComments,
  insertArticle,
  removeArticle,
  checkTopic,
  checkAuthor
} = require("../models/articles");

exports.getArticles = (req, res, next) => {
  if (req.params.article_id) {
    selectArticles(req.params, req.query)
      .then(articles => {
        if (!articles[0]) {
          return Promise.reject({ status: 404, msg: "Article/s not found" });
        }
        res.status(200).send({ article: articles[0] });
      })
      .catch(next);
  } else {
    const promises = [
      selectArticles(req.params, req.query),
      countArticles(req.query),
      checkTopic(req.query),
      checkAuthor(req.query)
    ];
    Promise.all(promises)
      .then(([articles, total_count, topicBool, authorBool]) => {
        if (!topicBool) {
          return Promise.reject({
            status: 404,
            msg: "Topic not found"
          });
        }
        if (!authorBool) {
          return Promise.reject({
            status: 404,
            msg: "Author not found"
          });
        }
        res.status(200).send({ articles, total_count });
      })
      .catch(next);
  }
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
  const promises = [
    checkArticle(req.params),
    selectComments(req.params, req.query),
    countComments(req.params)
  ];
  Promise.all(promises)
    .then(([bool, comments, total_count]) => {
      if (!bool) {
        return Promise.reject({
          status: 404,
          msg: "Article/s not found"
        });
      }
      res.status(200).send({ comments, total_count });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  insertArticle(req.body)
    .then(article => {
      res.status(201).send({ article });
    })
    .catch(next);
};

exports.deleteArticle = (req, res, next) => {
  removeArticle(req.params)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};
