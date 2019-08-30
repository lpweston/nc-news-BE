const { selectUsers, postUser, countUsers } = require("../models/users.js");

exports.getUser = (req, res, next) => {
  selectUsers(req.params, req.query)
    .then(users => {
      res.status(200).send({ user: users[0] });
    })
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  const promises = [countUsers(), selectUsers(req.params, req.query)];
  Promise.all(promises)
    .then(([total_count, users]) => {
      total_count = parseInt(total_count);
      res.status(200).send({ users, total_count });
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
