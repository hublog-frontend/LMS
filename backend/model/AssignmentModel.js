const pool = require("../config/config");

const AssignmentModel = {
  createAssignment: async (
    assignment_id,
    assignment_name,
    logo_image,
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
          `INSERT INTO assignments(assignment_name, logo_image, created_date) VALUES(?, ?, ?)`,
          [assignment_name, logo_image, created_date],
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
          `UPDATE assignments SET assignment_name = ?, logo_image = ? WHERE id = ?`,
          [assignment_name, logo_image, assignment_id],
        );

        affectedRow += updateAssignment.affectedRows;
      }

      return affectedRow;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAssignments: async () => {
    try {
      let query = `SELECT id, assignment_name, logo_image FROM assignments WHERE is_active = 1 ORDER BY id DESC`;

      const [assignments] = await pool.query(query);

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
        assignment.total_modules = moduleMap.get(assignment.id) || 0;
      });

      return {
        assignments,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  createAssignmentModule: async (module_id, assignment_id, module_name) => {
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
          `INSERT INTO assignment_module(assignment_id, module_name) VALUES(?, ?)`,
          [assignment_id, module_name],
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
          `UPDATE assignment_module SET module_name = ? WHERE id = ?`,
          [module_name, module_id],
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
      let query = `SELECT id, assignment_id, module_name FROM assignment_module WHERE assignment_id = ? AND is_active = 1 ORDER BY id DESC`;
      let queryParams = [assignment_id];

      const [assignmentModules] = await pool.query(query, queryParams);

      return {
        assignmentModules,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = AssignmentModel;
