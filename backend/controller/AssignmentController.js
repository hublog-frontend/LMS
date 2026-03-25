const AssignmentModel = require("../model/AssignmentModel");

const createAssignment = async (req, res) => {
  try {
    const { assignment_id, assignment_name, logo_image, created_date } =
      req.body;
    const result = await AssignmentModel.createAssignment(
      assignment_id,
      assignment_name,
      logo_image,
      created_date,
    );
    res.status(200).json({
      success: true,
      message: "Assignment created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssignments = async (req, res) => {
  try {
    const { page, pageSize } = req.query;
    const result = await AssignmentModel.getAssignments(page, pageSize);
    res.status(200).json({
      success: true,
      message: "Assignments fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAssignmentModule = async (req, res) => {
  try {
    const { module_id, assignment_id, module_name } = req.body;
    const result = await AssignmentModel.createAssignmentModule(
      module_id,
      assignment_id,
      module_name,
    );
    res.status(200).json({
      success: true,
      message: "Assignment module created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssignmentModule = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const result = await AssignmentModel.getAssignmentModule(assignment_id);
    res.status(200).json({
      success: true,
      message: "Assignment modules fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  createAssignmentModule,
  getAssignmentModule,
};
