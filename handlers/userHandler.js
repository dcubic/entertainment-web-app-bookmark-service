const UserModel = require("../models/user");

const createUser = async (email, password) => {
  try {
    const user = new UserModel({
      email: email,
      password: password,
    });

    const createdUser = await user.save();
    return {
      id: createdUser._id,
      email: createdUser.email,
    };
  } catch (error) {
    if (error.name === "ValidationError") {
      throw {
        status: 409,
        errors: Object.entries(error.errors).map(([fieldName, error]) => ({
          fieldName: fieldName,
          message: error.message,
          kind: error.kind,
        })),
      };
    } else {
      throw {
        status: 500,
        message: error.message,
      };
    }
  }
};

const deleteUser = async (userId) => {
  const deletedUser = await user.findByIdAndDelete(userId);

  if (deletedUser) {
    return {
      id: deletedUser._id,
      email: deletedUser.email,
    };
  } else {
    throw {
      status: 404,
      message: `User with id ${userId} not found`,
    };
  }
};

const getUserById = async (userId) => {
  try {
    const user = await user.findById;
    return {
      id: user._id,
      email: user.email,
    };
  } catch (error) {
    throw {
      status: 404,
      message: `User with id ${userId} not found`,
    };
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await user.findOne({ email: email });
    if (user) {
      return {
        id: user._id,
        email: user.email,
      };
    } else {
      throw {
        status: 404,
        message: `User with id ${userId} not found`,
      };
    }
  } catch (error) {
    throw {
      status: 500,
      message: error.message,
    };
  }
};

module.exports = {
  createUser: createUser,
  getUserById: getUserById,
  getUserByEmail: getUserByEmail,
};
