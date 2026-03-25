const { request, response } = require("express");
const LoginModel = require("../model/LoginModel");
const jwt = require("jsonwebtoken");

const login = async (request, response) => {
  const { email, password } = request.body;
  try {
    const user = await LoginModel.login(email, password);

    if (user) {
      const token = generateToken(user);
      return response.status(200).send({
        message: "Login successful",
        token: token,
        data: user,
      });
    }
  } catch (error) {
    response.status(500).send({
      message: "Error while login",
      details: error.message,
    });
  }
};

const generateToken = (user) => {
  // Verify JWT_SECRET exists and is valid
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("Invalid JWT secret configuration");
  }

  return jwt.sign(
    {
      id: user.id,
      position: user.position_id,
    },
    process.env.JWT_SECRET, // From .env file
    { expiresIn: "3d" },
  );
};

module.exports = {
  login,
};
