const connection = require("../db/connection");

exports.selectUsers = (
  { username },
  { sort_by = "username", order = "asc", limit = 10, p = 1 }
) => {
  if (order != "asc" && order != "desc") {
    return Promise.reject({
      status: 400,
      msg: "Query error, order input should be asc or desc"
    });
  }
  return connection
    .select("*")
    .from("users")
    .modify(query => {
      if (username) query.where("username", username);
    })
    .orderBy(sort_by, order)
    .limit(limit)
    .offset(p * limit - limit)
    .then(rows => {
      if (!rows[0]) {
        return Promise.reject({ status: 404, msg: "User not found" });
      }
      return rows;
    });
};

exports.postUser = ({
  username,
  name,
  avatar_url = "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
  ...rest
}) => {
  if (Object.keys(rest).length) {
    return Promise.reject({
      status: 400,
      msg: "Unexpected properties on body"
    });
  }
  return connection("users")
    .insert({
      username,
      name,
      avatar_url
    })
    .returning("*")
    .then(article => {
      return article[0];
    });
};

exports.countUsers = () => {
  return connection("users")
    .count("*")
    .then(rows => {
      return rows[0].count;
    });
};
