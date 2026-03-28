const CompanyModel = require("../model/CompanyModel");
const fs = require("fs/promises");
const path = require("path");

const addCompanyQuestion = async (req, res) => {
  const {
    company_id,
    company_name,
    company_logo,
    skills,
    created_date,
    attachment_title,
    existing_attachments,
  } = req.body;
  try {
    if (!company_id && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const contentDataList = req.files
      ? req.files.map((file) => ({
          type: "document",
          fileName: file.filename,
          originalName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          path: `/uploads/documents/${file.filename}`,
        }))
      : [];
    const result = await CompanyModel.addCompanyQuestions(
      company_id,
      company_name,
      company_logo,
      skills,
      created_date,
      attachment_title,
      contentDataList,
      existing_attachments,
    );
    return res
      .status(200)
      .json({ message: "Company question added successfully", result });
  } catch (error) {
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          // multer stores the full/relative path in file.path
          await fs.unlink(file.path);
        } catch (unlinkErr) {
          console.error(
            "Failed to delete local file after error:",
            unlinkErr.message,
          );
        }
      }
    }
    return res.status(500).json({ message: error.message });
  }
};

const getCompanyQuestions = async (req, res) => {
  try {
    const { company_name, skills } = req.query;
    const result = await CompanyModel.getCompanyQuestions(company_name, skills);
    return res
      .status(200)
      .json({ message: "Company questions fetched successfully", result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const userWiseCompanyQuestions = async (req, res) => {
  try {
    const { company_name, skills, user_id } = req.body;
    const result = await CompanyModel.userWiseCompanyQuestions(
      company_name,
      skills,
      user_id,
    );
    return res
      .status(200)
      .json({ message: "Company questions fetched successfully", result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteCompanyQuestion = async (req, res) => {
  try {
    const { company_id } = req.query;
    const result = await CompanyModel.deleteCompanyQuestion(company_id);
    return res
      .status(200)
      .json({ message: "Company question has been deleted", data: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteAttachment = async (req, res) => {
  try {
    const { attachment_id } = req.query;
    const result = await CompanyModel.deleteAttachment(attachment_id);
    return res
      .status(200)
      .json({ message: "Attachment has been deleted", data: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addToFavorite = async (req, res) => {
  try {
    const { company_id, user_id } = req.body;
    const result = await CompanyModel.addToFavorite(company_id, user_id);
    return res
      .status(200)
      .json({ message: "Company added to favorite successfully", result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const removeFromFavorite = async (req, res) => {
  try {
    const { company_id, user_id } = req.body;
    const result = await CompanyModel.removeFromFavorite(company_id, user_id);
    return res
      .status(200)
      .json({ message: "Company removed from favorite successfully", result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getFavoriteCompanies = async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await CompanyModel.getFavoriteCompanies(user_id);
    return res
      .status(200)
      .json({ message: "Favorite companies fetched successfully", result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addCategory = async (req, res) => {
  try {
    const { category_id, category_name } = req.body;
    const result = await CompanyModel.addCategory(category_id, category_name);
    return res
      .status(200)
      .json({ message: "Category added successfully", data: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCategory = async (req, res) => {
  try {
    const { category_name } = req.query;
    const result = await CompanyModel.getCategory(category_name);
    return res
      .status(200)
      .json({ message: "Category fetched successfully", result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { category_id } = req.query;
    const result = await CompanyModel.deleteCategory(category_id);
    return res
      .status(200)
      .json({ message: "Category deleted successfully", result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addSkill = async (req, res) => {
  try {
    const { skill_id, skill_name } = req.body;
    const result = await CompanyModel.addSkill(skill_id, skill_name);
    return res
      .status(200)
      .json({ message: "Skill added successfully", data: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getSkill = async (req, res) => {
  try {
    const { skill_name } = req.query;
    const result = await CompanyModel.getSkill(skill_name);
    return res
      .status(200)
      .json({ message: "Skill fetched successfully", result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteSkill = async (req, res) => {
  try {
    const { skill_id } = req.query;
    const result = await CompanyModel.deleteSkill(skill_id);
    return res
      .status(200)
      .json({ message: "Skill deleted successfully", result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addCompanyQuestion,
  getCompanyQuestions,
  deleteCompanyQuestion,
  addToFavorite,
  removeFromFavorite,
  getFavoriteCompanies,
  addCategory,
  getCategory,
  deleteCategory,
  deleteAttachment,
  addSkill,
  getSkill,
  deleteSkill,
  userWiseCompanyQuestions,
};
