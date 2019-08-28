exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};
exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code) {
    //console.log(err.code);
    if (err.code === "23502") {
      res.status(400).send({ msg: "Not null violation" });
    }
    if (err.code === "23503") {
      res.status(400).send({ msg: "Article_id not found" });
    }
    if (err.code === "42703") {
      res.status(400).send({ msg: "Query invalid, column not found" });
    }
    if (err.code === "22P02") {
      res.status(400).send({ msg: "Syntax error, input not valid" });
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
