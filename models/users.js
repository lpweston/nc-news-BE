const connection = require("../db/connection");

exports.selectUser = ({ username }) => {
  return connection
    .select("*")
    .from("users")
    .where("username", username)
    .then(rows => {
      if (!rows[0]) {
        return Promise.reject({ status: 404, msg: "User not found" });
      }
      return rows[0];
    });
};
