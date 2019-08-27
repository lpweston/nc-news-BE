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

exports.updateVotes = ({ inc_votes, ...rest }, { article_id }) => {
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
