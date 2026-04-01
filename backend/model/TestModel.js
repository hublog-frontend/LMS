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
                      t.duration,
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

  createTest: async (test_id, topic_id, test_name, duration, created_date) => {
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
          `INSERT INTO tests(topic_id, test_name, duration, created_date) VALUES(?, ?, ?, ?)`,
          [topic_id, test_name, duration, created_date],
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
          `UPDATE tests SET test_name = ?, duration = ? WHERE id = ?`,
          [test_name, duration, test_id],
        );

        affectedRow += updateTest.affectedRows;
      }

      return affectedRow;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  insertTestResult: async (
    test_id,
    user_id,
    total_marks_scored,
    total_time_taken,
    test_results,
    created_date,
  ) => {
    try {
      const [insertHistory] = await pool.query(
        `INSERT INTO test_history(test_id, user_id, total_marks_scored, total_time_taken, created_date)
        VALUES(?, ?, ?, ?, ?)`,
        [test_id, user_id, total_marks_scored, total_time_taken, created_date],
      );

      const history_id = insertHistory.insertId;

      const values = test_results.map((item) => [
        history_id,
        item.question_id,
        item.submitted_code,
        item.language,
        item.selected_option,
        item.marks_scored,
        item.time_taken,
        item.is_solved,
        created_date,
      ]);

      const insertQuery = `INSERT INTO test_result(
                                history_id,
                                question_id,
                                submitted_code,
                                language,
                                selected_option,
                                marks_scored,
                                time_taken,
                                is_solved,
                                created_date
                            )
                            VALUES ?`;

      const [insertResult] = await pool.query(insertQuery, [values]);

      return insertResult.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getTestHistory: async (test_id, user_id, page, pageSize) => {
    try {
      const queryParams = [];
      const countParams = [];
      let query = `SELECT th.id, th.test_id, th.created_date, t.test_name, th.total_marks_scored, th.total_time_taken FROM test_history th JOIN tests t ON th.test_id = t.id WHERE th.test_id = ? AND th.user_id = ?`;
      let countQuery = `SELECT COUNT(*) as total FROM test_history WHERE test_id = ? AND user_id = ?`;

      queryParams.push(test_id, user_id);
      countParams.push(test_id, user_id);

      if (page && pageSize) {
        const offset = (page - 1) * pageSize;
        query += ` ORDER BY th.id DESC LIMIT ? OFFSET ?`;
        queryParams.push(parseInt(pageSize), parseInt(offset));
      } else {
        query += ` ORDER BY th.id DESC`;
      }

      const [[testHistory], [totalCount]] = await Promise.all([
        pool.query(query, queryParams),
        pool.query(countQuery, countParams),
      ]);

      const testIds = [...new Set(testHistory.map((test) => test.test_id))];

      let maxMarkMap = new Map();

      if (testIds.length > 0) {
        const [questionCounts] = await pool.query(
          `SELECT
              SUM(CASE WHEN q.question_type = 'MCQ' THEN 2 ELSE 0 END) AS mcq_questions,
              SUM(CASE WHEN q.question_type = 'CODING' THEN 10 ELSE 0 END) AS coding_questions,
              tq.test_id
          FROM
              test_questions AS tq
          INNER JOIN questions AS q ON
              tq.question_id = q.id
              AND q.is_active = 1
          WHERE tq.is_active = 1
            AND tq.test_id IN (?)
          GROUP BY tq.test_id`,
          [testIds],
        );

        questionCounts.forEach((r) => maxMarkMap.set(r.test_id, r));
      }

      return {
        testHistory: testHistory.map((test) => ({
          ...test,
          max_mark:
            Number(maxMarkMap.get(test.test_id)?.mcq_questions || 0) +
            Number(maxMarkMap.get(test.test_id)?.coding_questions || 0),
        })),
        total: totalCount[0].total,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  userWiseTestHistory: async (user_id, test_name) => {
    try {
      const queryParams = [user_id];

      let query = `SELECT 
                      th.id AS history_id, 
                      th.test_id, 
                      th.created_date, 
                      t.test_name, 
                      th.total_marks_scored, 
                      th.total_time_taken 
                  FROM test_history th 
                  JOIN tests t ON th.test_id = t.id 
                  WHERE th.user_id = ? AND t.is_active = 1`;

      if (test_name) {
        query += ` AND t.test_name LIKE ?`;
        queryParams.push(`%${test_name}%`);
      }

      query += ` ORDER BY th.id DESC`;

      const [testHistory] = await pool.query(query, queryParams);

      return {
        testHistory: testHistory.map((test) => ({
          ...test,
          test_type: "On Demand Test",
        })),
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getTestResult: async (history_id) => {
    try {
      const [testResult] = await pool.query(
        `SELECT
            tr.id,
            tr.history_id,
            tr.question_id,
            tr.submitted_code,
            tr.language,
            tr.selected_option,
            tr.marks_scored,
            tr.time_taken,
            tr.is_solved,
            tr.created_date,
            q.question,
            q.correct_answer,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.category_id,
            q.question_type,
            q.description,
            q.constraints,
            q.difficulty,
            q.sample_input,
            q.sample_output
        FROM test_result tr
        JOIN questions q ON
            tr.question_id = q.id
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
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check if any question already exists (preserving behavior)
      for (const question of questions) {
        const [isExistsResult] = await connection.query(
          `SELECT id FROM questions WHERE category_id = ? AND question = ? AND correct_answer = ? AND option_a = ? AND option_b = ? AND option_c = ? AND option_d = ? AND question_type = ? AND description = ? AND constraints = ? AND difficulty = ? AND sample_input = ? AND sample_output = ? AND is_active = 1`,
          [
            question.category_id,
            question.question,
            question.correct_answer,
            question.option_a,
            question.option_b,
            question.option_c,
            question.option_d,
            question.question_type,
            question.description,
            question.constraints,
            question.difficulty,
            question.sample_input,
            question.sample_output,
          ],
        );
        if (isExistsResult.length > 0) {
          throw new Error("Question already exists");
        }
      }

      let totalAffectedRows = 0;
      for (const question of questions) {
        const [insertResult] = await connection.query(
          `INSERT INTO questions(
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
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            question.category_id,
            question.question,
            question.correct_answer || null,
            question.option_a || null,
            question.option_b || null,
            question.option_c || null,
            question.option_d || null,
            question.question_type || "MCQ",
            question.description || null,
            question.constraints || null,
            question.difficulty || "EASY",
            question.sample_input || null,
            question.sample_output || null,
          ],
        );

        const questionId = insertResult.insertId;
        totalAffectedRows += insertResult.affectedRows;

        // Handle companies array if present
        if (
          question.companies &&
          Array.isArray(question.companies) &&
          question.companies.length > 0
        ) {
          const companyValues = question.companies.map((companyId) => [
            questionId,
            companyId,
          ]);
          await connection.query(
            `INSERT INTO question_companies (question_id, company_id) VALUES ?`,
            [companyValues],
          );
        }
      }

      await connection.commit();
      return totalAffectedRows;
    } catch (error) {
      await connection.rollback();
      throw new Error(error.message);
    } finally {
      connection.release();
    }
  },

  updateQuestion: async (
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
    sample_output,
    companies,
    id,
  ) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [isExists] = await connection.query(
        `SELECT id FROM questions WHERE category_id = ? AND question = ? AND correct_answer = ? AND option_a = ? AND option_b = ? AND option_c = ? AND option_d = ? AND question_type = ? AND description = ? AND constraints = ? AND difficulty = ? AND sample_input = ? AND sample_output = ? AND id != ? AND is_active = 1`,
        [
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
          sample_output,
          id,
        ],
      );

      if (isExists.length > 0) {
        throw new Error("Question already exists");
      }

      const [updateResult] = await connection.query(
        `UPDATE questions SET category_id = ?, question = ?, correct_answer = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, question_type = ?, description = ?, constraints = ?, difficulty = ?, sample_input = ?, sample_output = ? WHERE id = ?`,
        [
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
          sample_output,
          id,
        ],
      );

      if (companies && Array.isArray(companies)) {
        // Fetch current mappings
        const [currentCompanies] = await connection.query(
          `SELECT company_id FROM question_companies WHERE question_id = ?`,
          [id],
        );

        const currentCompanyIds = currentCompanies.map((c) => c.company_id);
        const newCompanyIds = companies.map((id) => parseInt(id));

        const companiesToRemove = currentCompanyIds.filter(
          (cid) => !newCompanyIds.includes(cid),
        );
        const companiesToAdd = newCompanyIds.filter(
          (cid) => !currentCompanyIds.includes(cid),
        );

        if (companiesToRemove.length > 0) {
          await connection.query(
            `DELETE FROM question_companies WHERE question_id = ? AND company_id IN (?)`,
            [id, companiesToRemove],
          );
        }

        if (companiesToAdd.length > 0) {
          const companyValues = companiesToAdd.map((companyId) => [
            id,
            companyId,
          ]);
          await connection.query(
            `INSERT INTO question_companies (question_id, company_id) VALUES ?`,
            [companyValues],
          );
        }
      }

      await connection.commit();
      return updateResult.affectedRows;
    } catch (error) {
      await connection.rollback();
      throw new Error(error.message);
    } finally {
      connection.release();
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
                      q.sample_output
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

      const [[questions], [totalCount]] = await Promise.all([
        pool.query(query, queryParams),
        pool.query(countQuery, countQueryParams),
      ]);

      const questionIds = questions.map((question) => question.id);

      let companyMap = new Map();

      if (questionIds.length > 0) {
        const [companyQuestions] = await pool.query(
          `SELECT
              qc.id,
              qc.question_id,
              qc.company_id,
              c.company_name,
              c.logo_image
          FROM
              question_companies AS qc
          LEFT JOIN company_questions AS c ON
              qc.company_id = c.id AND c.is_active = 1
          WHERE qc.question_id IN(?)`,
          [questionIds],
        );

        companyQuestions.forEach((companyQuestion) => {
          if (!companyMap.has(companyQuestion.question_id)) {
            companyMap.set(companyQuestion.question_id, []);
          }
          companyMap.get(companyQuestion.question_id).push({
            id: companyQuestion.id,
            question_id: companyQuestion.question_id,
            company_id: companyQuestion.company_id,
            company_name: companyQuestion.name,
            logo_image: companyQuestion.logo_image,
          });
        });
      }

      questions.forEach((question) => {
        question.companies = companyMap.get(question.id) || [];
      });

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
