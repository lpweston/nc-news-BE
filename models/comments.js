const connection = require("../db/connection");
exports.updateVotes = ({ comment_id }, { inc_votes, ...rest }) => {
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
  return connection("comments")
    .where("comment_id", comment_id)
    .increment("votes", inc_votes)
    .returning("*")
    .then(comment => {
      if (!comment.length) {
        return Promise.reject({
          status: 404,
          msg: "Comment not found"
        });
      }
      return comment[0];
    });
};

exports.removeComment = ({ comment_id }) => {
  return connection("comments")
    .where({ comment_id })
    .del()
    .then(count => {
      if (count === 0) {
        return Promise.reject({
          status: 404,
          msg: "Comment not found"
        });
      }
      return;
    });
};
