const connection = require("../db/connection");

exports.selectArticle = ({ article_id }) => {
  return connection
    .select("*")
    .from("articles")
    .where("article_id", article_id)
    .then(rows => {
      if (!rows[0]) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.countComments = ({ article_id }) => {
  return connection("comments")
    .count("*")
    .where("article_id", article_id)
    .then(result => {
      return result[0];
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
    .select("*")
    .where("article_id", article_id)
    .orderBy(sort_by, order)
    .then(comments => {
      if (!comments[0]) {
        return Promise.reject({ status: 404, msg: "Comments not found" });
      }
      return comments;
    });
};
