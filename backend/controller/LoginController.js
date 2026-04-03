const { request, response } = require("express");
const LoginModel = require("../model/LoginModel");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

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

const forgotPassword = async (request, response) => {
  const { email } = request.body;
  try {
    const user = await LoginModel.checkUserByEmail(email);
    if (!user) {
      return response.status(404).send({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await LoginModel.saveOTP(email, otp, expiry);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP for Password Reset",
      text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return response
          .status(500)
          .send({ message: "Error sending email", error: error.message });
      }
      return response.status(200).send({ message: "OTP sent to your email" });
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while processing request",
      details: error.message,
    });
  }
};

const verifyOTP = async (request, response) => {
  const { email, otp } = request.body;
  try {
    const user = await LoginModel.verifyOTP(email, otp);
    if (!user) {
      return response.status(400).send({ message: "Invalid or expired OTP" });
    }
    return response.status(200).send({ message: "OTP verified correctly" });
  } catch (error) {
    response.status(500).send({
      message: "Error while verifying OTP",
      details: error.message,
    });
  }
};

const resetPassword = async (request, response) => {
  const { email, otp, password } = request.body;
  try {
    // Re-verify OTP for security before updating password
    const user = await LoginModel.verifyOTP(email, otp);
    if (!user) {
      return response.status(400).send({ message: "Invalid or expired OTP" });
    }

    await LoginModel.updatePassword(email, password);
    return response
      .status(200)
      .send({ message: "Password updated successfully" });
  } catch (error) {
    response.status(500).send({
      message: "Error while resetting password",
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
  forgotPassword,
  verifyOTP,
  resetPassword,
};
