const { selectUsers, postUser } = require("../models/users.js");

exports.getUser = (req, res, next) => {
  selectUsers(req.params, req.query)
    .then(users => {
      res.status(200).send({ user: users[0] });
    })
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  selectUsers(req.params, req.query)
    .then(users => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.postUser = (req, res, next) => {
  postUser(req.body)
    .then(user => {
      res.status(201).send({ user });
    })
    .catch(next);
};
