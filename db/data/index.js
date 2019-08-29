const ENV = process.env.NODE_ENV || "development";
const test = require("./test-data");
const development = require("./development-data");

const data = {
  development,
  test,
  production: development
};

module.exports = data[ENV];
