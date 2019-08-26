const {
  topicData,
  articleData,
  commentData,
  userData
} = require("../data/index.js");

const { formatDates, formatComments, makeRefObj } = require("../utils/utils");

exports.seed = function(knex) {
  return knex.migrate
    .rollback()
    .then(() => knex.migrate.latest())
    .then(() => {
      const topicsInsertions = knex("topics").insert(topicData);
      const userInsertions = knex("users").insert(userData);
      return Promise.all([topicsInsertions, userInsertions]);
    })
    .then(() => {
      const articleDataFormated = formatDates(articleData);
      return knex("articles")
        .insert(articleDataFormated)
        .returning("*");
    })
    .then(articleRows => {
      const articleRef = makeRefObj(articleRows, "title", "article_id");
      const formattedComments = formatComments(commentData, articleRef);
      return knex("comments").insert(formattedComments);
    });
  // .then(() => {
  //   return knex("topics").select("*");
  // })
  // .then(topics => {
  //   console.log(topics);
  // });
};
