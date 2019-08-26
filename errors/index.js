exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};
exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code) {
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