const connection = require("../db/connection");

exports.selectUser = ({ username }) => {
  return connection
    .select("*")
    .from("users")
    .where("username", username)
    .then(rows => {
      if (!rows[0]) {
        return Promise.reject({ status: 400, msg: "Bad input" });
      }
      return rows[0];
    });
};
