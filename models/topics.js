const connection = require("../db/connection");

exports.selectTopics = () => {
  return connection.select("*").from("topics");
};

exports.insertTopic = ({ slug, description, ...rest }) => {
  if (Object.keys(rest).length) {
    return Promise.reject({
      status: 400,
      msg: "Unexpected properties on body"
    });
  }
  return connection("topics")
    .insert({ slug, description })
    .returning("*")
    .then(article => {
      return article[0];
    });
};
