exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};
exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code) {
    //console.log(err.code);
    // console.log(err.message);
    const psqlErrors400 = {
      "2201W": "Limit must not be negative",
      "23502": "Missing information on body",
      "23503": "Foreign_key_violation: one of your inputs was not found",
      "42703": "Query invalid, column not found",
      "22P02": "Syntax error, input not valid",
      "42803": "Query invalid, column not found"
    };
    if (psqlErrors400.hasOwnProperty(err.code)) {
      res.status(400).send({ msg: psqlErrors400[err.code] });
    }
    if (err.code === "23505") {
      res.status(422).send({ msg: "This item already exists" });
    }
    res.status(400).send({ msg: err.message });
  }
  next(err);
};
exports.handleServerErrors = (err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
};

exports.handleRouteError = (req, res, next) => {
  res.status(404).send({ msg: "Path not found" });
};

exports.send405 = (req, res, next) => {
  res.status(405).send({ msg: "method not allowed" });
};
