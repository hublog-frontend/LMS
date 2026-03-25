const pool = require("../config/config");

const LoginModel = {
  login: async (email, password) => {
    try {
      const [isExists] = await pool.query(
        `SELECT id, email, user_name, password FROM users WHERE email = ? AND password = ? AND is_active = 1`,
        [email, password],
      );

      if (isExists.length <= 0) throw new Error("Invalid email or password");

      return isExists[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = LoginModel;
