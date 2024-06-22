const UserModel = require('../models/user');

const createUser = (email, password) => {
  const user = new UserModel({
    email: email,
    password: password
  })
  user.save().then(result => {
    console.log(result);
  }).catch(error => {
    console.log(error);
  })
};

const getUserById = (userId) => {};

const getUserByEmail = (email) => {};

module.exports = {
  createUser: createUser,
  getUserById: getUserById,
  getUserByEmail: getUserByEmail,
};
