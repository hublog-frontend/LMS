const AssignmentModel = require("../model/AssignmentModel");

const createAssignment = async (req, res) => {
  try {
    const {
      assignment_id,
      assignment_name,
      logo_image,
      description,
      difficulty,
      created_date,
    } = req.body;
    const result = await AssignmentModel.createAssignment(
      assignment_id,
      assignment_name,
      logo_image,
      description,
      difficulty,
      created_date,
    );
    res.status(201).json({
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
    const { assignment_name } = req.query;
    const result = await AssignmentModel.getAssignments(assignment_name);
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
    const { module_id, assignment_id, module_number, module_name } = req.body;
    const result = await AssignmentModel.createAssignmentModule(
      module_id,
      assignment_id,
      module_number,
      module_name,
    );
    res.status(201).json({
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
    const { assignment_id } = req.query;
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

const mapAssignmentQuestion = async (req, res) => {
  try {
    const { questions, assignment_module_id } = req.body;
    const result = await AssignmentModel.mapAssignmentQuestion(
      questions,
      assignment_module_id,
    );
    res.status(201).json({
      success: true,
      message: "Assignment question mapped successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addCompany = async (req, res) => {
  try {
    const { company_id, company_name, logo_image } = req.body;
    const result = await AssignmentModel.addCompany(
      company_id,
      company_name,
      logo_image,
    );
    res.status(201).json({
      success: true,
      message: "Company added successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCompanies = async (req, res) => {
  try {
    const result = await AssignmentModel.getCompanies();
    res.status(200).json({
      success: true,
      message: "Companies fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const { company_id } = req.body;
    const result = await AssignmentModel.deleteCompany(company_id);
    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const insertAssignmentAttempt = async (req, res) => {
  try {
    const { user_id, module_question_id, created_date } = req.body;
    const result = await AssignmentModel.insertAssignmentAttempt(
      user_id,
      module_question_id,
      created_date,
    );
    if (result === 0) {
      res.status(200).json({
        success: true,
        message: "Assignment attempt already exists",
        data: result,
      });
    }
    res.status(201).json({
      success: true,
      message: "Assignment attempt inserted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const insertAssignmentAnswer = async (req, res) => {
  try {
    const {
      attempt_id,
      user_id,
      module_question_id,
      submitted_code,
      result_output,
      language,
      score_obtained,
      submitted_at,
      time_taken,
    } = req.body;
    const result = await AssignmentModel.insertAssignmentAnswer(
      attempt_id,
      user_id,
      module_question_id,
      submitted_code,
      result_output,
      language,
      score_obtained,
      submitted_at,
      time_taken,
    );
    res.status(201).json({
      success: true,
      message: "Assignment answer inserted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const userWiseAssignments = async (req, res) => {
  try {
    const { assignment_name, user_id } = req.body;
    const result = await AssignmentModel.userWiseAssignments(
      assignment_name,
      user_id,
    );
    res.status(200).json({
      success: true,
      message: "User wise assignments fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const userWiseModules = async (req, res) => {
  try {
    const { assignment_id, user_id } = req.body;
    const result = await AssignmentModel.userWiseModules(
      assignment_id,
      user_id,
    );
    res.status(200).json({
      success: true,
      message: "User wise modules fetched successfully",
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
  mapAssignmentQuestion,
  addCompany,
  getCompanies,
  deleteCompany,
  insertAssignmentAttempt,
  insertAssignmentAnswer,
  userWiseAssignments,
  userWiseModules,
};
