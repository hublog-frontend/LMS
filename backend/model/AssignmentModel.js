const pool = require("../config/config");

const AssignmentModel = {
  createAssignment: async (
    assignment_id,
    assignment_name,
    logo_image,
    description,
    difficulty,
    created_date,
  ) => {
    let affectedRow = 0;
    try {
      if (!assignment_id) {
        const [isExists] = await pool.query(
          `SELECT id FROM assignments WHERE assignment_name = ? AND is_active = 1`,
          [assignment_name],
        );

        if (isExists.length > 0) {
          throw new Error("Assignment already exists");
        }

        const [insertAssignment] = await pool.query(
          `INSERT INTO assignments(assignment_name, logo_image, description, difficulty, created_date) VALUES(?, ?, ?, ?, ?)`,
          [assignment_name, logo_image, description, difficulty, created_date],
        );

        affectedRow += insertAssignment.affectedRows;
      } else {
        const [isExists] = await pool.query(
          `SELECT id FROM assignments WHERE assignment_name = ? AND id != ? AND is_active = 1`,
          [assignment_name, assignment_id],
        );

        if (isExists.length > 0) {
          throw new Error("Assignment already exists");
        }

        const [updateAssignment] = await pool.query(
          `UPDATE assignments SET assignment_name = ?, logo_image = ?, description = ?, difficulty = ? WHERE id = ?`,
          [assignment_name, logo_image, description, difficulty, assignment_id],
        );

        affectedRow += updateAssignment.affectedRows;
      }

      return affectedRow;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAssignments: async (assignment_name) => {
    try {
      const queryParams = [];
      let query = `SELECT id, assignment_name, logo_image, description, difficulty FROM assignments WHERE is_active = 1`;

      if (assignment_name) {
        query += ` AND assignment_name LIKE ?`;
        queryParams.push(`%${assignment_name}%`);
      }

      query += ` ORDER BY id DESC`;

      const [assignments] = await pool.query(query, queryParams);

      const ids = [...new Set(assignments.map((assignment) => assignment.id))];

      let moduleMap = new Map();

      if (ids.length > 0) {
        const [modules] = await pool.query(
          `SELECT COUNT(id) as total_modules, assignment_id FROM assignment_module WHERE assignment_id IN (?) AND is_active = 1 GROUP BY assignment_id`,
          [ids],
        );

        modules.forEach((r) => moduleMap.set(r.assignment_id, r));
      }

      assignments.forEach((assignment) => {
        assignment.total_modules =
          moduleMap.get(assignment.id)?.total_modules || 0;
      });

      return {
        assignments,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  createAssignmentModule: async (
    module_id,
    assignment_id,
    module_number,
    module_name,
  ) => {
    let affectedRow = 0;
    try {
      if (!module_id) {
        const [isExists] = await pool.query(
          `SELECT id FROM assignment_module WHERE module_name = ? AND is_active = 1 AND assignment_id = ?`,
          [module_name, assignment_id],
        );

        if (isExists.length > 0) {
          throw new Error("Assignment module already exists");
        }

        const [insertAssignmentModule] = await pool.query(
          `INSERT INTO assignment_module(assignment_id, module_number, module_name) VALUES(?, ?, ?)`,
          [assignment_id, module_number, module_name],
        );

        affectedRow += insertAssignmentModule.affectedRows;
      } else {
        const [isExists] = await pool.query(
          `SELECT id FROM assignment_module WHERE module_name = ? AND assignment_id = ? AND id != ? AND is_active = 1`,
          [module_name, assignment_id, module_id],
        );

        if (isExists.length > 0) {
          throw new Error("Assignment module already exists");
        }

        const [updateAssignmentModule] = await pool.query(
          `UPDATE assignment_module SET module_number = ?, module_name = ? WHERE id = ?`,
          [module_number, module_name, module_id],
        );

        affectedRow += updateAssignmentModule.affectedRows;
      }

      return affectedRow;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAssignmentModule: async (assignment_id) => {
    try {
      let query = `SELECT
                      id,
                      assignment_id,
                      module_number,
                      module_name
                  FROM assignment_module
                  WHERE assignment_id = ? AND is_active = 1
                  ORDER BY module_number ASC`;
      let queryParams = [assignment_id];

      const [assignmentModules] = await pool.query(query, queryParams);

      const moduleIds = [
        ...new Set(assignmentModules.map((module) => module.id)),
      ];

      let questionMap = new Map();

      if (moduleIds.length > 0) {
        const [questions] = await pool.query(
          `SELECT
              mq.id,
              mq.question_id,
              mq.assignment_module_id,
              mq.marks,
              q.category_id,
              q.question,
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
              assignment_module_questions AS mq
          INNER JOIN questions AS q ON
            mq.question_id = q.id
              AND q.is_active = 1
          WHERE mq.assignment_module_id IN (?)`,
          [moduleIds],
        );

        questions.forEach((q) => {
          if (!questionMap.has(q.assignment_module_id)) {
            questionMap.set(q.assignment_module_id, {
              questions: [],
              count: 0,
              total_marks: 0,
            });
          }

          const moduleData = questionMap.get(q.assignment_module_id);
          moduleData.questions.push(q);
          moduleData.count++;
          moduleData.total_marks += q.marks || 0;
        });
      }

      let overall_total_marks = 0;
      let overall_total_questions = 0;

      const questionsData = assignmentModules.map((module) => {
        const moduleData = questionMap.get(module.id) || {
          questions: [],
          count: 0,
          total_marks: 0,
        };

        overall_total_marks += moduleData.total_marks;
        overall_total_questions += moduleData.count;

        return {
          ...module,
          questions_count: moduleData.count,
          total_marks: moduleData.total_marks,
          questions: moduleData.questions,
        };
      });

      return {
        questionsData,
        overall_data: {
          overall_total_marks,
          overall_total_questions,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  mapAssignmentQuestion: async (questions, assignment_module_id) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const questionIds = questions.map((q) => q.question_id);

      const uniqueIds = new Set(questionIds);

      if (uniqueIds.size !== questionIds.length) {
        throw new Error("Duplicate question_id found in request");
      }

      // Step 1: Deactivate existing questions for this module to handle removals
      await connection.query(
        `UPDATE assignment_module_questions SET is_active = 0 WHERE assignment_module_id = ?`,
        [assignment_module_id],
      );

      for (const q of questions) {
        const { question_id, marks } = q;

        // Step 2: Check if mapping already exists (even if inactive)
        const [isExists] = await connection.query(
          `SELECT id FROM assignment_module_questions 
           WHERE assignment_module_id = ? AND question_id = ?`,
          [assignment_module_id, question_id],
        );

        if (isExists.length > 0) {
          // Step 3: Mapping exists, re-activate and update marks
          await connection.query(
            `UPDATE assignment_module_questions SET is_active = 1, marks = ? WHERE id = ?`,
            [marks, isExists[0].id],
          );
        } else {
          // Step 4: Mapping doesn't exist, insert new
          await connection.query(
            `INSERT INTO assignment_module_questions (assignment_module_id, question_id, marks, is_active) VALUES (?, ?, ?, 1)`,
            [assignment_module_id, question_id, marks],
          );
        }
      }

      await connection.commit();
      return questions.length;
    } catch (error) {
      await connection.rollback();
      throw new Error(error.message);
    } finally {
      connection.release();
    }
  },

  addCompany: async (company_id, company_name, logo_image) => {
    try {
      let affectedRow = 0;

      if (!company_id) {
        const [isExists] = await pool.query(
          `SELECT company_id FROM companies WHERE company_name = ? AND is_active = 1`,
          [company_name],
        );

        if (isExists.length > 0) {
          throw new Error("Company already exists");
        }

        const [insertCompany] = await pool.query(
          `INSERT INTO companies(company_name, logo_image) VALUES(?, ?)`,
          [company_name, logo_image],
        );

        affectedRow += insertCompany.affectedRows;
      } else {
        const [isExists] = await pool.query(
          `SELECT id FROM companies WHERE company_name = ? AND id != ? AND is_active = 1`,
          [company_name, company_id],
        );

        if (isExists.length > 0) {
          throw new Error("Company already exists");
        }

        const [updateCompany] = await pool.query(
          `UPDATE companies SET company_name = ?, logo_image = ? WHERE id = ?`,
          [company_name, logo_image, company_id],
        );

        affectedRow += updateCompany.affectedRows;
      }

      return affectedRow;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getCompanies: async () => {
    try {
      const [companies] = await pool.query(
        `SELECT company_id, company_name, logo_image FROM companies WHERE is_active = 1`,
      );

      return companies;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteCompany: async (company_id) => {
    try {
      const [deleteCompany] = await pool.query(
        `DELETE FROM companies WHERE company_id = ?`,
        [company_id],
      );

      return deleteCompany.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  insertAssignmentAttempt: async (
    user_id,
    module_question_id,
    created_date,
  ) => {
    try {
      let affectedRow = 0;

      const [isExists] = await pool.query(
        `SELECT id FROM assignment_attempts WHERE user_id = ? AND module_question_id = ?`,
        [user_id, module_question_id],
      );

      if (isExists.length > 0) {
        return 0;
      }

      const [insertAssignmentAttempt] = await pool.query(
        `INSERT INTO assignment_attempts(user_id, module_question_id, num_of_attempt, created_date) VALUES(?, ?, ?, ?)`,
        [user_id, module_question_id, 0, created_date],
      );

      affectedRow += insertAssignmentAttempt.affectedRows;

      return affectedRow;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  insertAssignmentAnswer: async (
    attempt_id,
    user_id,
    module_question_id,
    submitted_code,
    result_output,
    language,
    score_obtained,
    submitted_at,
    time_taken,
  ) => {
    try {
      let affectedRow = 0;

      if (!attempt_id) {
        const [insertAssignmentAnswer] = await pool.query(
          `INSERT INTO assignment_results(user_id, module_question_id, submitted_code, result_output, language, score_obtained, submitted_at) VALUES(?, ?, ?, ?, ?, ?, ?)`,
          [
            user_id,
            module_question_id,
            submitted_code,
            result_output,
            language,
            score_obtained,
            submitted_at,
          ],
        );

        affectedRow += insertAssignmentAnswer.affectedRows;
      } else {
        const [updateAssignmentAnswer] = await pool.query(
          `UPDATE assignment_results SET submitted_code = ?, result_output = ?, language = ?, score_obtained = ?, submitted_at = ? WHERE attempt_id = ?`,
          [
            submitted_code,
            result_output,
            language,
            score_obtained,
            submitted_at,
            attempt_id,
          ],
        );

        affectedRow += updateAssignmentAnswer.affectedRows;
      }

      const [getAttempts] = await pool.query(
        `SELECT num_of_attempt, time_taken FROM assignment_attempts WHERE user_id = ? AND module_question_id = ?`,
        [user_id, module_question_id],
      );

      if (getAttempts.length > 0) {
        const number_of_attempt = Number(getAttempts[0].num_of_attempt) + 1;
        const time_taken = Number(getAttempts[0].time_taken) + time_taken;

        const [updateAttempts] = await pool.query(
          `UPDATE assignment_attempts SET num_of_attempt = ?, time_taken = ? WHERE user_id = ? AND module_question_id = ?`,
          [number_of_attempt, time_taken, user_id, module_question_id],
        );

        affectedRow += updateAttempts.affectedRows;
      } else {
        const [insertAttempts] = await pool.query(
          `INSERT INTO assignment_attempts(user_id, module_question_id, num_of_attempt, time_taken, created_date) VALUES(?, ?, ?, ?, ?)`,
          [user_id, module_question_id, 1, time_taken, submitted_at],
        );

        affectedRow += insertAttempts.affectedRows;
      }

      return affectedRow;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  userWiseAssignments: async (assignment_name, user_id) => {
    try {
      const queryParams = [];
      let query = `SELECT id, assignment_name, logo_image, description, difficulty FROM assignments WHERE is_active = 1`;

      if (assignment_name) {
        query += ` AND assignment_name LIKE ?`;
        queryParams.push(`%${assignment_name}%`);
      }

      query += ` ORDER BY id DESC`;

      const [assignments] = await pool.query(query, queryParams);

      const ids = [...new Set(assignments.map((assignment) => assignment.id))];

      let moduleMap = new Map();
      let totalResultsMap = new Map();
      let userPerformanceMap = new Map();

      if (ids.length > 0) {
        // Fetch total modules per assignment
        const [modules] = await pool.query(
          `SELECT COUNT(id) as total_modules, assignment_id FROM assignment_module WHERE assignment_id IN (?) AND is_active = 1 GROUP BY assignment_id`,
          [ids],
        );

        // Fetch total questions and total marks per assignment
        const [totalResults] = await pool.query(
          `SELECT
              COUNT(amq.question_id) AS total_questions,
              SUM(amq.marks) AS total_marks,
              a.id AS assignment_id
          FROM
              assignments AS a
          INNER JOIN assignment_module AS am ON
              a.id = am.assignment_id AND am.is_active = 1
          INNER JOIN assignment_module_questions AS amq ON
              am.id = amq.assignment_module_id AND amq.is_active = 1
          WHERE a.is_active = 1 AND a.id IN (?)
          GROUP BY a.id`,
          [ids],
        );

        // Fetch user performance (solved, attempted, marks scored) per assignment
        const [userPerformance] = await pool.query(
          `SELECT
              assignment_id,
              COUNT(DISTINCT attempted_mq_id) AS attempted_questions,
              COUNT(DISTINCT solved_mq_id) AS solved_questions,
              IFNULL(SUM(max_score), 0) AS marks_scored
          FROM (
              SELECT
                  a.id AS assignment_id,
                  amq.id AS mq_id,
                  aa.module_question_id AS attempted_mq_id,
                  CASE WHEN ar.score_obtained > 0 THEN ar.module_question_id END AS solved_mq_id,
                  MAX(ar.score_obtained) AS max_score
              FROM
                  assignments AS a
              INNER JOIN assignment_module AS am ON
                  a.id = am.assignment_id AND am.is_active = 1
              INNER JOIN assignment_module_questions AS amq ON
                  am.id = amq.assignment_module_id AND amq.is_active = 1
              LEFT JOIN assignment_attempts AS aa ON
                  amq.id = aa.module_question_id AND aa.user_id = ?
              LEFT JOIN assignment_results AS ar ON
                  amq.id = ar.module_question_id AND ar.user_id = ?
              WHERE a.is_active = 1 AND a.id IN (?)
              GROUP BY a.id, amq.id
          ) AS performance_data
          GROUP BY assignment_id`,
          [user_id, user_id, ids],
        );

        modules.forEach((r) => moduleMap.set(r.assignment_id, r));
        totalResults.forEach((r) => totalResultsMap.set(r.assignment_id, r));
        userPerformance.forEach((r) =>
          userPerformanceMap.set(r.assignment_id, r),
        );
      }

      let overall_total_questions = 0;
      let overall_solved = 0;
      let overall_attempted = 0;
      let overall_marks_obtained = 0;
      let overall_total_marks = 0;

      assignments.forEach((assignment) => {
        const totalData = totalResultsMap.get(assignment.id) || {};
        const userData = userPerformanceMap.get(assignment.id) || {};

        assignment.total_modules =
          Number(moduleMap.get(assignment.id)?.total_modules) || 0;
        assignment.total_questions = Number(totalData.total_questions) || 0;
        assignment.total_marks = Number(totalData.total_marks) || 0;

        assignment.attempted_questions =
          Number(userData.attempted_questions) || 0;
        assignment.solved_questions = Number(userData.solved_questions) || 0;
        assignment.marks_scored = Number(userData.marks_scored) || 0;

        // Progress percentage for the progress bar shown in the image
        assignment.progress =
          assignment.total_questions > 0
            ? Math.round(
                (assignment.solved_questions / assignment.total_questions) *
                  100,
              )
            : 0;

        overall_total_questions += assignment.total_questions;
        overall_solved += assignment.solved_questions;
        overall_attempted += assignment.attempted_questions;
        overall_marks_obtained += assignment.marks_scored;
        overall_total_marks += assignment.total_marks;
      });

      return {
        assignments,
        overall_stats: {
          total_questions: overall_total_questions,
          solved: overall_solved,
          attempted: overall_attempted,
          marks_obtained: overall_marks_obtained,
          total_marks: overall_total_marks,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  userWiseModules: async (assignment_id, user_id) => {
    try {
      const [assignmentModules] = await pool.query(
        `SELECT
            id,
            assignment_id,
            module_number,
            module_name
        FROM assignment_module
        WHERE assignment_id = ? AND is_active = 1
        ORDER BY module_number ASC`,
        [assignment_id],
      );

      const moduleIds = [
        ...new Set(assignmentModules.map((module) => module.id)),
      ];

      let questionMap = new Map();
      let userStatusMap = new Map();

      if (moduleIds.length > 0) {
        // Fetch questions for all modules
        const [questions] = await pool.query(
          `SELECT
              mq.id AS mq_id,
              mq.question_id,
              mq.assignment_module_id,
              mq.marks,
              q.question,
              q.question_type,
              q.difficulty,
              q.sample_input,
              q.sample_output
          FROM
              assignment_module_questions AS mq
          INNER JOIN questions AS q ON
            mq.question_id = q.id
              AND q.is_active = 1
          WHERE mq.assignment_module_id IN (?) AND mq.is_active = 1`,
          [moduleIds],
        );

        // Fetch user attempts and results for these questions
        const [userStats] = await pool.query(
          `SELECT
              aa.module_question_id,
              aa.num_of_attempt,
              aa.time_taken,
              ar.score_obtained,
              ar.submitted_code,
              ar.result_output,
              ar.language,
              ar.submitted_at
          FROM
              assignment_attempts AS aa
          LEFT JOIN assignment_results AS ar ON
              aa.module_question_id = ar.module_question_id AND aa.user_id = ar.user_id
          WHERE aa.user_id = ? AND aa.module_question_id IN (
              SELECT id FROM assignment_module_questions WHERE assignment_module_id IN (?)
          )`,
          [user_id, moduleIds],
        );

        userStats.forEach((stat) =>
          userStatusMap.set(stat.module_question_id, stat),
        );

        questions.forEach((q) => {
          if (!questionMap.has(q.assignment_module_id)) {
            questionMap.set(q.assignment_module_id, []);
          }
          const user_q_status = userStatusMap.get(q.mq_id) || {
            num_of_attempt: 0,
            score_obtained: 0,
            submitted_code: "",
            result_output: "",
            language: "",
            submitted_at: "",
          };
          questionMap.get(q.assignment_module_id).push({
            ...q,
            user_status: user_q_status,
          });
        });
      }

      let assignment_total_questions = 0;
      let assignment_total_marks = 0;
      let assignment_solved = 0;
      let assignment_attempted = 0;
      let assignment_marks_scored = 0;
      let assignment_time_taken = 0;

      const modulesData = assignmentModules.map((module) => {
        const questionsInModule = questionMap.get(module.id) || [];
        const total_questions_count = questionsInModule.length;
        const total_marks_count = questionsInModule.reduce(
          (sum, q) => sum + (q.marks || 0),
          0,
        );
        const attempted_count = questionsInModule.filter(
          (q) => q.user_status.num_of_attempt > 0,
        ).length;
        const solved_count = questionsInModule.filter(
          (q) => q.user_status.score_obtained > 0,
        ).length;
        const marks_scored_count = questionsInModule.reduce(
          (sum, q) => sum + (q.user_status.score_obtained || 0),
          0,
        );
        const time_taken_count = questionsInModule.reduce(
          (sum, q) => sum + (q.user_status.time_taken || 0),
          0,
        );

        assignment_total_questions += total_questions_count;
        assignment_total_marks += total_marks_count;
        assignment_solved += solved_count;
        assignment_attempted += attempted_count;
        assignment_marks_scored += marks_scored_count;
        assignment_time_taken += time_taken_count;

        return {
          ...module,
          total_questions: total_questions_count,
          total_marks: total_marks_count,
          attempted_questions: attempted_count,
          solved_questions: solved_count,
          marks_scored: marks_scored_count,
          questions: questionsInModule,
          time_taken: time_taken_count,
        };
      });

      return {
        modules: modulesData,
        overall_assignment_results: {
          total_questions: assignment_total_questions,
          total_marks: assignment_total_marks,
          solved: assignment_solved,
          attempted: assignment_attempted,
          marks_obtained: assignment_marks_scored,
          time_taken: assignment_time_taken,
          progress:
            assignment_total_questions > 0
              ? Math.round(
                  (assignment_solved / assignment_total_questions) * 100,
                )
              : 0,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = AssignmentModel;
