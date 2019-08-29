const ENV = process.env.NODE_ENV || "development";
const testData = require("./test-data");
const development = require("./development-data");

const data = {
  development,
  test: testData,
  production: development
};

module.exports = data[ENV];
