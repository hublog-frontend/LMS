const pool = require("../config/config");

const LoginModel = {
  login: async (email, password) => {
    try {
      const [isExists] = await pool.query(
        `SELECT
            u.id,
            u.email,
            u.user_name,
            u.password,
            u.role_id,
            r.role_name
        FROM
            users AS u
        INNER JOIN role AS r ON
          u.role_id = r.role_id
            AND	r.is_active = 1
        WHERE
            u.email = ? AND u.password = ? AND u.is_active = 1`,
        [email, password],
      );

      if (isExists.length <= 0) throw new Error("Invalid email or password");

      return isExists[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },

  checkUserByEmail: async (email) => {
    try {
      const [isExists] = await pool.query(
        `SELECT id, email FROM users WHERE email = ? AND is_active = 1`,
        [email],
      );
      return isExists[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },

  saveOTP: async (email, otp, expiry) => {
    try {
      const [result] = await pool.query(
        `UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?`,
        [otp, expiry, email],
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  verifyOTP: async (email, otp) => {
    try {
      const [isExists] = await pool.query(
        `SELECT id FROM users WHERE email = ? AND otp = ? AND otp_expiry > NOW()`,
        [email, otp],
      );
      return isExists[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updatePassword: async (email, password) => {
    try {
      const [result] = await pool.query(
        `UPDATE users SET password = ?, otp = NULL, otp_expiry = NULL WHERE email = ?`,
        [password, email],
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  updateActiveSession: async (email, token, socketId) => {
    try {
      const [isExists] = await pool.query(
        `SELECT id, socket_id FROM active_sessions WHERE email = ?`,
        [email],
      );

      if (isExists.length > 0) {
        // If socketId is not provided (e.g. from the API call) 
        // we keep the existing socket_id to allow the WebSocket server 
        // to find and logout the previous session.
        const currentSocketId = socketId !== undefined ? socketId : isExists[0].socket_id;
        
        await pool.query(
          `UPDATE active_sessions SET token = ?, socket_id = ? WHERE email = ?`,
          [token, currentSocketId, email],
        );
      } else {
        await pool.query(
          `INSERT INTO active_sessions (email, token, socket_id) VALUES (?, ?, ?)`,
          [email, token, socketId],
        );
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getActiveSession: async (email) => {
    try {
      const [rows] = await pool.query(
        `SELECT token, socket_id FROM active_sessions WHERE email = ?`,
        [email],
      );
      return rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = LoginModel;

