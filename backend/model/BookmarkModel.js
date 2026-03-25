const pool = require("../config/config");

const BookmarkModel = {
  addBookmark: async (category_type, key_column, created_date) => {
    try {
      const [isBookmark] = await pool.query(
        `SELECT id FROM bookmarks WHERE category_type = ? AND key_column = ?`,
        [category_type, key_column],
      );
      if (isBookmark.length > 0) {
        return 0;
      }
      const query = `INSERT INTO bookmarks (category_type, key_column, created_date) VALUES (?, ?, ?)`;
      const result = await pool.query(query, [
        category_type,
        key_column,
        created_date,
      ]);
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  removeBookmark: async (category_type, key_column) => {
    try {
      const query = `DELETE FROM bookmarks WHERE category_type = ? AND key_column = ?`;
      const result = await pool.query(query, [category_type, key_column]);
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = BookmarkModel;
