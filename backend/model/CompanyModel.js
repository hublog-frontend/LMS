const { log } = require("console");
const pool = require("../config/config");
const fs = require("fs/promises");
const path = require("path");

const CompanyModel = {
  addCompanyQuestions: async (
    company_id,
    company_name,
    company_logo,
    skills,
    created_date,
    attachment_title,
    contentDataList,
    existing_attachments,
  ) => {
    try {
      let affectedRows = 0;
      if (!company_id) {
        const query = `INSERT INTO company_questions (company_name, company_logo, skills, created_date) VALUES (?, ?, ?, ?)`;
        const [insertQuestion] = await pool.query(query, [
          company_name,
          company_logo,
          JSON.stringify(skills),
          created_date,
        ]);
        affectedRows += insertQuestion.affectedRows;

        if (contentDataList && contentDataList.length > 0) {
          const attachmentsValues = contentDataList.map((contentData) => [
            insertQuestion.insertId,
            contentData.type,
            attachment_title,
            contentData.fileName,
            contentData.originalName,
            contentData.fileSize,
            contentData.mimeType,
            contentData.path,
            created_date,
          ]);
          const query = `INSERT INTO company_attachments(
                            company_id,
                            content_type,
                            title,
                            file_name,
                            original_name,
                            size,
                            mime_type,
                            file_path,
                            created_date
                        )
                        VALUES ?`;
          const [insertAttachment] = await pool.query(query, [
            attachmentsValues,
          ]);
          affectedRows += insertAttachment.affectedRows;
        }
      } else {
        const [isCompanyExist] = await pool.query(
          `SELECT * FROM company_questions WHERE id = ?`,
          [company_id],
        );

        if (isCompanyExist.length <= 0) {
          throw new Error("Company not found");
        }
        const query = `UPDATE company_questions SET company_name = ?, company_logo = ?, skills = ? WHERE id = ?`;
        const [updateQuestion] = await pool.query(query, [
          company_name,
          company_logo,
          JSON.stringify(skills),
          company_id,
        ]);
        affectedRows += updateQuestion.affectedRows;

        // Sync attachments
        const [currentAttachments] = await pool.query(
          `SELECT id, file_name FROM company_attachments WHERE company_id = ?`,
          [company_id],
        );

        let keepIds = [];
        if (existing_attachments) {
          keepIds = Array.isArray(existing_attachments)
            ? existing_attachments.map((id) => parseInt(id))
            : [parseInt(existing_attachments)];
        }

        const toDelete = currentAttachments.filter(
          (att) => !keepIds.includes(parseInt(att.id)),
        );

        if (toDelete.length > 0) {
          for (const att of toDelete) {
            if (att.file_name) {
              const filePath = path.join(
                __dirname,
                `../uploads/documents/${att.file_name}`,
              );
              try {
                await fs.unlink(filePath);
              } catch (err) {
                console.error("Failed to delete attachment: ", err.message);
              }
            }
          }
          const deleteIds = toDelete.map((att) => att.id);
          const [deleteResult] = await pool.query(
            `DELETE FROM company_attachments WHERE id IN (?)`,
            [deleteIds],
          );
          affectedRows += deleteResult.affectedRows;
        }

        if (contentDataList && contentDataList.length > 0) {
          const attachmentsValues = contentDataList.map((contentData) => [
            company_id,
            contentData.type,
            attachment_title,
            contentData.fileName,
            contentData.originalName,
            contentData.fileSize,
            contentData.mimeType,
            contentData.path,
            created_date || new Date(),
          ]);
          const insertQuery = `INSERT INTO company_attachments(
                            company_id,
                            content_type,
                            title,
                            file_name,
                            original_name,
                            size,
                            mime_type,
                            file_path,
                            created_date
                        )
                        VALUES ?`;
          const [insertAttachment] = await pool.query(insertQuery, [
            attachmentsValues,
          ]);
          affectedRows += insertAttachment.affectedRows;
        }
      }
      return affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getCompanyQuestions: async (company_name, skills) => {
    try {
      let query = `SELECT
                        id,
                        company_name,
                        company_logo,
                        skills,
                        is_active,
                        created_date
                    FROM
                        company_questions
                    WHERE 1 = 1`;
      if (company_name) {
        query += ` AND company_name LIKE '%${company_name}%'`;
      }
      if (skills) {
        query += ` AND skills LIKE '%${skills}%'`;
      }
      query += ` ORDER BY created_date DESC`;
      const [result] = await pool.query(query);

      const ids = [...new Set(result.map((item) => item.id))];

      let attachmentsMap = new Map();
      if (ids.length > 0) {
        const [attachments] = await pool.query(
          `SELECT id, company_id, content_type, title, file_name, original_name, size, mime_type, file_path, created_date FROM company_attachments WHERE company_id IN (?)`,
          [ids],
        );
        attachments.forEach((attachment) => {
          if (!attachmentsMap.has(attachment.company_id)) {
            attachmentsMap.set(attachment.company_id, []);
          }
          attachmentsMap.get(attachment.company_id).push(attachment);
        });
      }

      const combinedResult = result.map((item) => {
        const itemAttachments = attachmentsMap.get(item.id) || [];
        return {
          ...item,
          skills: JSON.parse(item.skills),
          attachments: itemAttachments,
        };
      });
      return combinedResult;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  userWiseCompanyQuestions: async (company_name, skills, user_id) => {
    try {
      const queryParams = [];
      let query = `SELECT
                        cq.id,
                        cq.company_name,
                        cq.company_logo,
                        cq.skills,
                        cq.is_active,
                        cq.created_date,
                        CASE WHEN cf.user_id = ? THEN 1 ELSE 0 END AS is_favourite
                    FROM company_questions AS cq
                    LEFT JOIN company_favorites AS cf ON
                    	cq.id = cf.company_id
                    WHERE 1 = 1`;
      queryParams.push(user_id);
      if (company_name) {
        query += ` AND company_name LIKE '%${company_name}%'`;
      }
      if (skills) {
        query += ` AND skills LIKE '%${skills}%'`;
      }
      query += ` ORDER BY created_date DESC`;
      const [result] = await pool.query(query, queryParams);

      const ids = [...new Set(result.map((item) => item.id))];

      let attachmentsMap = new Map();
      if (ids.length > 0) {
        const [attachments] = await pool.query(
          `SELECT id, company_id, content_type, title, file_name, original_name, size, mime_type, file_path, created_date FROM company_attachments WHERE company_id IN (?)`,
          [ids],
        );
        attachments.forEach((attachment) => {
          if (!attachmentsMap.has(attachment.company_id)) {
            attachmentsMap.set(attachment.company_id, []);
          }
          attachmentsMap.get(attachment.company_id).push(attachment);
        });
      }

      const combinedResult = result.map((item) => {
        const itemAttachments = attachmentsMap.get(item.id) || [];
        return {
          ...item,
          skills: JSON.parse(item.skills),
          attachments: itemAttachments,
        };
      });
      return combinedResult;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteCompanyQuestion: async (company_id) => {
    try {
      let affectedRows = 0;
      const [existingAttachments] = await pool.query(
        `SELECT file_name FROM company_attachments WHERE company_id = ?`,
        [company_id],
      );

      if (existingAttachments.length > 0) {
        for (const attachment of existingAttachments) {
          if (attachment.file_name) {
            const filePath = path.join(
              __dirname,
              `../uploads/documents/${attachment.file_name}`,
            );
            try {
              await fs.unlink(filePath);
            } catch (err) {
              console.error("Failed to delete old attachment: ", err.message);
            }
          }
        }
      }

      const query = `DELETE FROM company_questions WHERE id = ?`;
      const [result] = await pool.query(query, [company_id]);

      affectedRows += result.affectedRows;

      const [deleteAttachments] = await pool.query(
        `DELETE FROM company_attachments WHERE company_id = ?`,
        [company_id],
      );

      affectedRows += deleteAttachments.affectedRows;

      return affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteAttachment: async (attachment_id) => {
    try {
      const [existingAttachment] = await pool.query(
        `SELECT file_name FROM company_attachments WHERE id = ?`,
        [attachment_id],
      );

      if (existingAttachment.length > 0) {
        if (existingAttachment[0].file_name) {
          const filePath = path.join(
            __dirname,
            `../uploads/documents/${existingAttachment[0].file_name}`,
          );
          try {
            await fs.unlink(filePath);
          } catch (err) {
            console.error("Failed to delete old attachment: ", err.message);
          }
        }
      }

      const query = `DELETE FROM company_attachments WHERE id = ?`;
      const [result] = await pool.query(query, [attachment_id]);

      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addToFavorite: async (company_id, user_id) => {
    try {
      const [isAlreadyFavorite] = await pool.query(
        `SELECT id FROM company_favorites WHERE company_id = ? AND user_id = ?`,
        [company_id, user_id],
      );
      if (isAlreadyFavorite.length > 0) {
        return 0;
      }
      const query = `INSERT INTO company_favorites (company_id, user_id) VALUES (?, ?)`;
      const result = await pool.query(query, [company_id, user_id]);
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  removeFromFavorite: async (company_id, user_id) => {
    try {
      const query = `DELETE FROM company_favorites WHERE company_id = ? AND user_id = ?`;
      const result = await pool.query(query, [company_id, user_id]);
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getFavoriteCompanies: async (user_id, company_name) => {
    try {
      const queryParams = [];
      let query = `SELECT
                        cf.id AS favorite_id,
                        cf.company_id,
                        cf.user_id,
                        cq.company_name,
                        cq.company_logo,
                        cq.skills,
                        cq.created_date
                    FROM company_favorites AS cf
                    INNER JOIN company_questions AS cq ON
                        cf.company_id = cq.id
                    WHERE 1 = 1
                        AND cf.user_id = ?`;
      queryParams.push(user_id);
      if (company_name) {
        query += ` AND cq.company_name LIKE ?`;
        queryParams.push(`%${company_name}%`);
      }
      query += ` ORDER BY cq.created_date DESC`;
      const [result] = await pool.query(query, queryParams);

      const companyIds = [...new Set(result.map((item) => item.company_id))];

      let attachmentsMap = new Map();
      if (companyIds.length > 0) {
        const [attachments] = await pool.query(
          `SELECT id, company_id, content_type, title, file_name, original_name, size, mime_type, file_path, created_date FROM company_attachments WHERE company_id IN (?)`,
          [companyIds],
        );
        attachments.forEach((attachment) => {
          if (!attachmentsMap.has(attachment.company_id)) {
            attachmentsMap.set(attachment.company_id, []);
          }
          attachmentsMap.get(attachment.company_id).push(attachment);
        });
      }

      const combinedResult = result.map((item) => {
        const itemAttachments = attachmentsMap.get(item.company_id) || [];
        return {
          ...item,
          skills: JSON.parse(item.skills),
          attachments: itemAttachments,
        };
      });
      return combinedResult;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addCategory: async (category_id, category_name) => {
    try {
      let affectedRows = 0;
      if (!category_id) {
        const [isCategory] = await pool.query(
          `SELECT id FROM question_category WHERE category_name = ?`,
          [category_name],
        );
        if (isCategory.length > 0) {
          throw new Error("Category already exists");
        }
        const query = `INSERT INTO question_category (category_name) VALUES (?)`;
        const [result] = await pool.query(query, [category_name]);
        affectedRows += result.affectedRows;
      } else {
        const query = `UPDATE question_category SET category_name = ? WHERE id = ?`;
        const [result] = await pool.query(query, [category_name, category_id]);
        affectedRows += result.affectedRows;
      }
      return affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getCategory: async (category_name) => {
    try {
      let query = `SELECT id, category_name AS name FROM question_category WHERE is_active = 1`;
      if (category_name) {
        query += ` AND category_name LIKE '%${category_name}%'`;
      }
      query += ` ORDER BY category_name ASC`;
      const [result] = await pool.query(query);
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteCategory: async (category_id) => {
    try {
      const query = `DELETE FROM question_category WHERE id = ?`;
      const result = await pool.query(query, [category_id]);
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addSkill: async (skill_id, skill_name) => {
    try {
      let affectedRows = 0;
      if (!skill_id) {
        const [isSkill] = await pool.query(
          `SELECT skill_id FROM skills WHERE skill_name = ?`,
          [skill_name],
        );
        if (isSkill.length > 0) {
          throw new Error("Skill already exists");
        }
        const query = `INSERT INTO skills (skill_name) VALUES (?)`;
        const [result] = await pool.query(query, [skill_name]);
        affectedRows += result.affectedRows;
      } else {
        const query = `UPDATE skills SET skill_name = ? WHERE skill_id = ?`;
        const [result] = await pool.query(query, [skill_name, skill_id]);
        affectedRows += result.affectedRows;
      }
      return affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getSkill: async (skill_name) => {
    try {
      let query = `SELECT skill_id, skill_name AS name FROM skills WHERE is_active = 1`;
      if (skill_name) {
        query += ` AND skill_name LIKE '%${skill_name}%'`;
      }
      query += ` ORDER BY skill_name ASC`;
      const [result] = await pool.query(query);
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteSkill: async (skill_id) => {
    try {
      const query = `DELETE FROM skills WHERE skill_id = ?`;
      const result = await pool.query(query, [skill_id]);
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = CompanyModel;
