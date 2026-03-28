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
    try {
      const questionIds = questions.map((q) => q.question_id);

      const uniqueIds = new Set(questionIds);

      if (uniqueIds.size !== questionIds.length) {
        throw new Error("Duplicate question_id found in request");
      }

      const [isExists] = await pool.query(
        `SELECT id FROM assignment_module_questions 
       WHERE assignment_module_id = ? 
       AND question_id IN (?) 
       AND is_active = 1`,
        [assignment_module_id, questionIds],
      );

      if (isExists.length > 0) {
        throw new Error("Assignment question already exists in DB");
      }

      const [insertAssignmentQuestion] = await pool.query(
        `INSERT INTO assignment_module_questions(assignment_module_id, question_id, marks) VALUES ?`,
        [questions.map((q) => [assignment_module_id, q.question_id, q.marks])],
      );

      return insertAssignmentQuestion.affectedRows;
    } catch (error) {
      throw new Error(error.message);
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
        `INSERT INTO assignment_attempts(user_id, module_question_id, number_of_attempt, created_date) VALUES(?, ?, ?, ?)`,
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
        `SELECT number_of_attempt FROM assignment_attempts WHERE user_id = ? AND module_question_id = ?`,
        [user_id, module_question_id],
      );

      if (getAttempts.length > 0) {
        const number_of_attempt = Number(getAttempts[0].number_of_attempt) + 1;

        const [updateAttempts] = await pool.query(
          `UPDATE assignment_attempts SET number_of_attempt = ? WHERE user_id = ? AND module_question_id = ?`,
          [number_of_attempt, user_id, module_question_id],
        );

        affectedRow += updateAttempts.affectedRows;
      } else {
        const [insertAttempts] = await pool.query(
          `INSERT INTO assignment_attempts(user_id, module_question_id, number_of_attempt, created_date) VALUES(?, ?, ?, ?)`,
          [user_id, module_question_id, 1, submitted_at],
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

      if (ids.length > 0) {
        const [modules] = await pool.query(
          `SELECT COUNT(id) as total_modules, assignment_id FROM assignment_module WHERE assignment_id IN (?) AND is_active = 1 GROUP BY assignment_id`,
          [ids],
        );

        const [totalResuls] = await pool.query(
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

        modules.forEach((r) => moduleMap.set(r.assignment_id, r));
        totalResuls.forEach((r) => totalResultsMap.set(r.assignment_id, r));
      }

      assignments.forEach((assignment) => {
        assignment.total_modules =
          moduleMap.get(assignment.id)?.total_modules || 0;
        assignment.total_questions =
          totalResultsMap.get(assignment.id)?.total_questions || 0;
        assignment.total_marks =
          totalResultsMap.get(assignment.id)?.total_marks || 0;
      });

      return {
        assignments,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = AssignmentModel;
