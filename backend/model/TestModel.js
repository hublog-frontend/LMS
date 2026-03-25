const pool = require("../config/config");

const TestModel = {
  createTopic: async (topic_id, topic_name, logo_image, created_date) => {
    let affectedRow = 0;
    try {
      if (!topic_id) {
        const [isExists] = await pool.query(
          `SELECT id FROM topics WHERE topic_name = ? AND is_active = 1`,
          [topic_name],
        );

        if (isExists.length > 0) {
          throw new Error("Topic already exists");
        }

        const [insertTopic] = await pool.query(
          `INSERT INTO topics(topic_name, logo_image, created_date) VALUES(?, ?, ?)`,
          [topic_name, logo_image, created_date],
        );

        affectedRow += insertTopic.affectedRows;
      } else {
        const [isExists] = await pool.query(
          `SELECT id FROM topics WHERE topic_name = ? AND id != ? AND is_active = 1`,
          [topic_name, topic_id],
        );

        if (isExists.length > 0) {
          throw new Error("Topic already exists");
        }

        const [updateTopic] = await pool.query(
          `UPDATE topics SET topic_name = ?, logo_image = ? WHERE id = ?`,
          [topic_name, logo_image, topic_id],
        );

        affectedRow += updateTopic.affectedRows;
      }

      return affectedRow;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getTopics: async (page, pageSize) => {
    try {
      let query = `SELECT id, topic_name, logo_image FROM topics WHERE is_active = 1`;
      let countQuery = `SELECT COUNT(*) as total FROM topics WHERE is_active = 1`;
      let queryParams = [];

      if (page && pageSize) {
        const offset = (page - 1) * pageSize;
        query += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
        queryParams.push(parseInt(pageSize), parseInt(offset));
      } else {
        query += ` ORDER BY id DESC`;
      }

      const [topics] = await pool.query(query, queryParams);
      const [totalCount] = await pool.query(countQuery);

      return {
        topics,
        total: totalCount[0].total,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteTopic: async (topic_id) => {
    try {
      const [isExists] = await pool.query(
        `SELECT id FROM tests WHERE topic_id = ? AND is_active = 1`,
        [topic_id],
      );
      if (isExists.length > 0) {
        throw new Error("Topic cannot be deleted as it has tests");
      }
      const [deleteTopic] = await pool.query(
        `DELETE FROM topics WHERE id = ?`,
        [topic_id],
      );
      return deleteTopic.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getTests: async (topic_id, page, pageSize) => {
    try {
      let query = `SELECT
                      t.id,
                      t.topic_id,
                      t.test_name,
                      t.created_date,
                      tp.topic_name,
                      tp.logo_image,
                      GROUP_CONCAT(tq.question_id) AS question_ids,
                      COUNT(tq.question_id) AS question_count
                  FROM
                      tests t
                  JOIN topics tp ON
                      t.topic_id = tp.id
                  LEFT JOIN test_questions tq ON
                    t.id = tq.test_id AND tq.is_active = 1
                  WHERE
                      t.topic_id = ? AND t.is_active = 1
                  GROUP BY t.id`;
      let countQuery = `SELECT COUNT(*) as total FROM tests WHERE topic_id = ? AND is_active = 1`;
      let queryParams = [topic_id];

      if (page && pageSize) {
        const offset = (page - 1) * pageSize;
        query += ` ORDER BY t.id DESC LIMIT ? OFFSET ?`;
        queryParams.push(parseInt(pageSize), parseInt(offset));
      } else {
        query += ` ORDER BY t.id DESC`;
      }

      const [[tests], [totalCount]] = await Promise.all([
        pool.query(query, queryParams),
        pool.query(countQuery, [topic_id]),
      ]);

      const testIds = [...new Set(tests.map((test) => test.id))];

      let questionCountMap = new Map();

      if (testIds.length > 0) {
        const [questionCounts] = await pool.query(
          `SELECT COUNT(id) as total_questions, test_id FROM test_questions WHERE test_id IN (?) AND is_active = 1 GROUP BY test_id`,
          [testIds],
        );

        questionCounts.forEach((r) => questionCountMap.set(r.test_id, r));
      }

      return {
        tests: tests.map((test) => ({
          ...test,
          total_questions: questionCountMap.get(test.id)?.total_questions || 0,
        })),
        total: totalCount[0].total,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  createTest: async (test_id, topic_id, test_name, created_date) => {
    let affectedRow = 0;
    try {
      if (!test_id) {
        const [isExists] = await pool.query(
          `SELECT id FROM tests WHERE topic_id = ? AND test_name = ? AND is_active = 1`,
          [topic_id, test_name],
        );

        if (isExists.length > 0) {
          throw new Error("Test already exists");
        }

        const [insertTest] = await pool.query(
          `INSERT INTO tests(topic_id, test_name, created_date) VALUES(?, ?, ?)`,
          [topic_id, test_name, created_date],
        );

        affectedRow += insertTest.affectedRows;
      } else {
        const [isExists] = await pool.query(
          `SELECT id FROM tests WHERE topic_id = ? AND test_name = ? AND id != ? AND is_active = 1`,
          [topic_id, test_name, test_id],
        );

        if (isExists.length > 0) {
          throw new Error("Test already exists");
        }

        const [updateTest] = await pool.query(
          `UPDATE tests SET test_name = ? WHERE id = ?`,
          [test_name, test_id],
        );

        affectedRow += updateTest.affectedRows;
      }

      return affectedRow;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  insertTestResult: async (test_id, test_results, created_date) => {
    try {
      const [insertHistory] = await pool.query(
        `INSERT INTO test_history(test_id, created_date)
        VALUES(?, ?)`,
        [test_id, created_date],
      );

      const history_id = insertHistory.insertId;

      const values = test_results.map((item) => [
        history_id,
        item.question_id,
        item.selected_option,
        item.mark,
        item.is_attended,
        created_date,
      ]);

      const insertQuery = `INSERT INTO test_result(
                                history_id,
                                question_id,
                                selected_option,
                                mark,
                                is_attended,
                                created_date
                            )
                            VALUES ?`;

      const [insertResult] = await pool.query(insertQuery, [values]);

      return insertResult.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getTestHistory: async (test_id, page, pageSize) => {
    try {
      let query = `SELECT th.id, th.test_id, th.created_date, t.test_name FROM test_history th JOIN tests t ON th.test_id = t.id WHERE th.test_id = ? AND th.is_active = 1`;
      let countQuery = `SELECT COUNT(*) as total FROM test_history WHERE test_id = ? AND is_active = 1`;
      let queryParams = [test_id];

      if (page && pageSize) {
        const offset = (page - 1) * pageSize;
        query += ` ORDER BY th.id ASC LIMIT ? OFFSET ?`;
        queryParams.push(parseInt(pageSize), parseInt(offset));
      } else {
        query += ` ORDER BY th.id ASC`;
      }

      const [testHistory] = await pool.query(query, queryParams);
      const [totalCount] = await pool.query(countQuery, [test_id]);

      return {
        testHistory,
        total: totalCount[0].total,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getTestResult: async (history_id) => {
    try {
      const [testResult] = await pool.query(
        `SELECT tr.id, tr.history_id, tr.question_id, tr.selected_option, tr.mark, tr.is_attended, tr.created_date, q.question, q.correct_answer, q.option_a, q.option_b, q.option_c, q.option_d 
         FROM test_result tr 
         JOIN questions q ON tr.question_id = q.id 
         WHERE tr.history_id = ? AND tr.is_active = 1 
         ORDER BY tr.id ASC`,
        [history_id],
      );

      const summary = {
        total_questions: testResult.length,
        attended_questions: testResult.filter(
          (r) => r.is_attended == 1 || r.is_attended == true,
        ).length,
        total_marks: testResult.reduce(
          (sum, r) => sum + (parseFloat(r.mark) || 0),
          0,
        ),
      };

      return {
        testResult,
        summary,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addQuestions: async (questions) => {
    try {
      let isExists = false;
      for (const question of questions) {
        const [isExistsResult] = await pool.query(
          `SELECT id FROM questions WHERE category_id = ? AND question = ? AND correct_answer = ? AND option_a = ? AND option_b = ? AND option_c = ? AND option_d = ? AND is_active = 1`,
          [
            question.category_id,
            question.question,
            question.correct_answer,
            question.option_a,
            question.option_b,
            question.option_c,
            question.option_d,
          ],
        );
        if (isExists.length > 0) {
          isExists = true;
          break;
        }
      }
      if (isExists) {
        throw new Error("Question already exists");
      }
      const values = questions.map((item) => [
        item.category_id,
        item.question,
        item.correct_answer || null,
        item.option_a || null,
        item.option_b || null,
        item.option_c || null,
        item.option_d || null,
        item.question_type || "MCQ",
        item.description || null,
        item.constraints || null,
        item.difficulty || "EASY",
        item.sample_input || null,
        item.sample_output || null,
      ]);

      const insertQuery = `INSERT INTO questions(
                                category_id,
                                question,
                                correct_answer,
                                option_a,
                                option_b,
                                option_c,
                                option_d,
                                question_type,
                                description,
                                constraints,
                                difficulty,
                                sample_input,
                                sample_output
                            )
                            VALUES ?`;

      const [insertResult] = await pool.query(insertQuery, [values]);

      return insertResult.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getQuestions: async (page, pageSize, category_id, question_type) => {
    try {
      let query = `SELECT
                      q.id,
                      q.category_id,
                      qc.category_name,
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
                      q.sample_output,
                      q.test_cases
                  FROM questions AS q
                  LEFT JOIN question_category AS qc ON
                    qc.id = q.category_id
                  WHERE q.is_active = 1`;
      let countQuery = `SELECT COUNT(*) AS total
                        FROM questions AS q
                        LEFT JOIN question_category AS qc ON
                          qc.id = q.category_id
                        WHERE q.is_active = 1`;
      let queryParams = [];
      let countQueryParams = [];

      if (category_id) {
        query += ` AND q.category_id = ?`;
        countQuery += ` AND q.category_id = ?`;
        queryParams.push(category_id);
        countQueryParams.push(category_id);
      }

      if (question_type) {
        query += ` AND q.question_type = ?`;
        countQuery += ` AND q.question_type = ?`;
        queryParams.push(question_type);
        countQueryParams.push(question_type);
      }

      const pageNumber = parseInt(page, 10) || 1;
      const limitNumber = parseInt(pageSize, 10) || 10;
      const offset = (pageNumber - 1) * limitNumber;

      query += ` ORDER BY q.id ASC LIMIT ? OFFSET ?`;
      queryParams.push(limitNumber, offset);

      const [questions] = await pool.query(query, queryParams);
      const [totalCount] = await pool.query(countQuery, countQueryParams);

      return {
        questions,
        total: totalCount[0].total,
        pagination: {
          total: totalCount[0].total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalCount[0].total / limitNumber),
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteQuestion: async (question_id) => {
    try {
      const [isExists] = await pool.query(
        `SELECT id FROM test_questions WHERE question_id = ? AND is_active = 1`,
        [question_id],
      );
      if (isExists.length > 0) {
        throw new Error("Question is mapped to some test");
      }
      const [result] = await pool.query(`DELETE FROM questions WHERE id = ?`, [
        question_id,
      ]);
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  mapTestQuestions: async (test_id, questions, created_date) => {
    try {
      // First, remove existing mappings for this test to perform a fresh sync
      await pool.query(
        "UPDATE test_questions SET is_active = 0 WHERE test_id = ?",
        [test_id],
      );

      if (questions.length === 0) return 0;

      const values = questions.map((item) => [
        test_id,
        item.question_id,
        created_date,
      ]);

      const insertQuery = `INSERT INTO test_questions(
                                test_id,
                                question_id,
                                created_date
                            )
                            VALUES ?`;

      const [insertResult] = await pool.query(insertQuery, [values]);

      return insertResult.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getTestQuestions: async (test_id) => {
    try {
      const query = `
        SELECT 
          tq.id as mapping_id, 
          tq.test_id, 
          tq.question_id, 
          q.*,
          qc.category_name
        FROM test_questions tq 
        JOIN questions q ON tq.question_id = q.id 
        LEFT JOIN question_category qc ON q.category_id = qc.id
        WHERE tq.test_id = ? AND tq.is_active = 1 
        ORDER BY tq.id ASC
      `;
      const [testQuestions] = await pool.query(query, [test_id]);
      return testQuestions;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = TestModel;
