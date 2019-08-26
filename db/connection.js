const dbConfig = require("../knexfile");
const knex = require("knex");
const connection = knex(dbConfig);

module.exports = connection;
