const connection = require("../db/connection");

exports.selectArticles = (
  { article_id },
  { sort_by = "created_at", order = "desc", author, topic }
) => {
  if (order != "asc" && order != "desc") {
    return Promise.reject({
      status: 400,
      msg: "Syntax error, order input should be asc or desc"
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
      return article[0];
    });
};

exports.insertComment = ({ article_id }, { username, body, ...rest }) => {
  if (!username || !body) {
    return Promise.reject({
      status: 400,
      msg: "Missing either username or body"
    });
  }
  if (Object.keys(rest).length) {
    return Promise.reject({
      status: 400,
      msg: "Unexpected properties on body"
    });
  }
  return connection("comments")
    .where("article_id", article_id)
    .insert({ author: username, body })
    .returning("*")
    .then(comment => {
      return comment[0];
    });
};

exports.selectComments = (
  { article_id },
  { sort_by = "created_at", order = "desc" }
) => {
  return connection("comments")
    .select("comment_id", "author", "votes", "created_at", "body")
    .where("article_id", article_id)
    .orderBy(sort_by, order)
    .then(comments => {
      if (!comments[0]) {
        return Promise.reject({ status: 404, msg: "Comments not found" });
      }
      return comments;
    });
};
