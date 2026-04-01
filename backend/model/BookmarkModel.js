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

  userWiseBookmarks: async (user_id, category_type) => {
    try {
      if (category_type === "Question") {
        const query = `SELECT
                          b.id AS bookmark_id,
                          b.user_id,
                          b.category_type,
                          b.key_column,
                          b.created_date,
                          amq.assignment_module_id,
                          amq.question_id,
                          q.question,
                          q.correct_answer,
                          q.option_a,
                          q.option_b,
                          q.option_c,
                          q.option_d,
                          q.question_type,
                          q.description,
                          q.constraints,
                          q.difficulty,
                          q.sample_input,
                          q.sample_output
                      FROM
                          bookmarks AS b
                      INNER JOIN assignment_module_questions AS amq ON
                        b.key_column = amq.id
                          AND amq.is_active = 1
                      INNER JOIN questions AS q ON
                        amq.question_id = q.id
                          AND q.is_active = 1
                      WHERE
                          b.user_id = ? AND b.category_type = ?`;
        const params = [user_id, category_type];
        const [result] = await pool.query(query, params);
        return result;
      } else if (category_type === "Video") {
        const query = `SELECT
                          b.id AS bookmark_id,
                          b.user_id,
                          b.category_type,
                          b.key_column,
                          b.created_date,
                          cv.id AS video_id,
                          cv.title AS video_title,
                          cv.content_type,
                          cv.filename,
                          cv.original_name,
                          cv.size,
                          cv.mime_type,
                          cv.file_path,
                          cv.duration,
                          cv.created_at

                      FROM
                          bookmarks AS b
                      INNER JOIN course_videos AS cv ON
                        b.key_column = cv.id
                          AND cv.is_deleted = 0
                      WHERE
                          b.user_id = ? AND b.category_type = ?`;
        const params = [user_id, category_type];
        const [result] = await pool.query(query, params);
        return result;
      } else if (category_type === "Lecture") {
        const query = `SELECT
                          b.id AS bookmark_id,
                          b.user_id,
                          b.category_type,
                          b.key_column,
                          b.created_date,
                          ca.id AS attachment_id,
                          ca.content_type,
                          ca.title,
                          ca.file_name,
                          ca.original_name,
                          ca.size,
                          ca.mime_type,
                          ca.file_path,
                          ca.created_date

                      FROM
                          bookmarks AS b
                      INNER JOIN company_attachments AS ca ON
                        b.key_column = ca.id
                          AND ca.is_active = 1
                      WHERE
                          b.user_id = ? AND b.category_type = ?`;
        const params = [user_id, category_type];
        const [result] = await pool.query(query, params);
        return result;
      } else {
        return [];
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = BookmarkModel;
