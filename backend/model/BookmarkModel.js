const pool = require("../config/config");

const BookmarkModel = {
  addBookmark: async (user_id, category_type, key_column, created_date) => {
    try {
      const [isBookmark] = await pool.query(
        `SELECT id FROM bookmarks WHERE user_id = ? AND category_type = ? AND key_column = ?`,
        [user_id, category_type, key_column],
      );
      if (isBookmark.length > 0) {
        return 0;
      }
      const query = `INSERT INTO bookmarks (user_id, category_type, key_column, created_date) VALUES (?, ?, ?, ?)`;
      const result = await pool.query(query, [
        user_id,
        category_type,
        key_column,
        created_date,
      ]);
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  removeBookmark: async (bookmark_id, user_id, category_type, key_column) => {
    try {
      let query;
      let params;
      if (bookmark_id) {
        query = `DELETE FROM bookmarks WHERE id = ?`;
        params = [bookmark_id];
      } else {
        query = `DELETE FROM bookmarks WHERE user_id = ? AND category_type = ? AND key_column = ?`;
        params = [user_id, category_type, key_column];
      }
      const [result] = await pool.query(query, params);
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = BookmarkModel;
