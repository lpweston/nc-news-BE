const connection = require("../db/connection");

exports.selectArticles = (
  { article_id },
  { sort_by = "created_at", order = "desc", author, topic }
) => {
  if (order != "asc" && order != "desc") {
    return Promise.reject({
      status: 400,
      msg: "Query error, order input should be asc or desc"
    });
  }
  return connection("articles")
    .modify(query => {
      if (article_id) {
        query.select("articles.*").where("articles.article_id", article_id);
      } else {
        query.select(
          "articles.author",
          "title",
          "articles.article_id",
          "topic",
          "articles.created_at",
          "articles.votes"
        );
      }
    })
    .modify(query => {
      if (author) query.where("articles.author", author);
      if (topic) query.where("articles.topic", topic);
    })
    .count("comment_id", { as: "comment_count" })
    .leftJoin("comments", "articles.article_id", "comments.article_id")
    .groupBy("articles.article_id")
    .orderBy(sort_by, order)
    .then(rows => {
      if (!rows[0]) {
        return Promise.reject({ status: 404, msg: "Article/s not found" });
      }
      return rows;
    });
};

exports.updateVotes = ({ article_id }, { inc_votes, ...rest }) => {
  if (!inc_votes) {
    return Promise.reject({
      status: 400,
      msg: "Could not find inc_votes on body"
    });
  }
  if (typeof inc_votes != "number") {
    return Promise.reject({
      status: 400,
      msg: "Inc_votes syntax error, expected number"
    });
  }
  if (Object.keys(rest).length) {
    return Promise.reject({
      status: 400,
      msg: "Unexpected properties on body"
    });
  }
  return connection("articles")
    .where("article_id", article_id)
    .increment("votes", inc_votes)
    .returning("*")
    .then(article => {
      if (!article.length) {
        return Promise.reject({
          status: 404,
          msg: "Article not found"
        });
      }
      return article[0];
    });
};

exports.insertComment = ({ article_id }, { username, body, ...rest }) => {
  if (!username) {
    return Promise.reject({
      status: 400,
      msg: "Missing username"
    });
  }
  if (!body) {
    return Promise.reject({
      status: 400,
      msg: "Missing comment body"
    });
  }
  if (Object.keys(rest).length) {
    return Promise.reject({
      status: 400,
      msg: "Unexpected properties on body"
    });
  }
  return connection("comments")
    .insert({ author: username, body, article_id })
    .returning("*")
    .then(comment => {
      return comment[0];
    });
};

exports.selectComments = (
  { article_id },
  { sort_by = "created_at", order = "desc" }
) => {
  if (order != "asc" && order != "desc") {
    return Promise.reject({
      status: 400,
      msg: "Query error, order input should be asc or desc"
    });
  }
  return connection("comments")
    .select("comment_id", "author", "votes", "created_at", "body")
    .where("article_id", article_id)
    .orderBy(sort_by, order)
    .then(comments => {
      return comments;
    });
};
