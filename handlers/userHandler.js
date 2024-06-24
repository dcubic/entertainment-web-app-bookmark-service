const UserModel = require("../models/user");

const createUser = async (email, password) => {
  try {
    const user = new UserModel({
      email: email,
      password: password,
    });

    const createdUser = await user.save();
    return {
      id: createdUser._id.toString(),
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
  const notFoundError = {
    status: 404,
    message: `User with id \"${userId}\" not found`,
  };

  try {
    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (deletedUser) {
      return {
        id: deletedUser._id.toString(),
        email: deletedUser.email,
      };
    } else {
      throw notFoundError;
    }
  } catch (error) {
    if (error.message === notFoundError.message) {
      throw error;
    }

    throw {
      status: 500,
      message: error.message,
    };
  }
};

const getUserById = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    return {
      id: user._id.toString(),
      email: user.email,
    };
  } catch (error) {
    throw {
      status: 404,
      message: `User with id \"${userId}\" not found`,
    };
  }
};

// TODO Come back to this later
const getUserByEmail = async (email) => {
  try {
    const user = await UserModel.findOne({ email: email });
    if (user) {
      return {
        id: user._id.toString(),
        email: user.email,
      };
    } else {
      throw {
        status: 404,
        message: `User with email \"${email}\" not found`,
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
  deleteUser: deleteUser,
  getUserById: getUserById,
  getUserByEmail: getUserByEmail,
};
