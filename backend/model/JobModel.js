const pool = require("../config/config");
const fs = require("fs/promises");
const path = require("path");

const JobModel = {
  createJob: async (jobData) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const {
        job_id,
        looking_for,
        location,
        service_agreement,
        salary,
        qualification,
        year_of_passing,
        interview_rounds,
        interview_date,
        interview_mode,
        shift,
        streams,
        gender_preference,
        min_required_percentage,
        skills_required,
        blocking_period,
        other_criterias,
        notes,
        expires_at,
        fileData,
        job_category,
        created_at,
      } = jobData;

      const jobQuery = `
        INSERT INTO job_master (
          job_id, looking_for, location, service_agreement, salary,
          qualification, interview_date, interview_mode, shift, gender_preference, 
          blocking_period, notes, file_name, original_name, file_size, 
          mime_type, file_path, expires_at, job_category, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const jobValues = [
        job_id || null,
        looking_for || null,
        Array.isArray(location) ? location.join(", ") : location || null,
        service_agreement || null,
        salary || null,
        Array.isArray(qualification)
          ? qualification.join(", ")
          : qualification || null,
        interview_date || null,
        interview_mode || null,
        shift || null,
        gender_preference || null,
        blocking_period || null,
        notes || null,
        fileData?.fileName || null,
        fileData?.originalName || null,
        fileData?.fileSize || null,
        fileData?.mimeType || null,
        fileData?.path || null,
        expires_at || null,
        job_category || "Technical drives",
        created_at || null,
      ];

      const [result] = await connection.query(jobQuery, jobValues);
      const insertId = result.insertId;

      // Insert relative data
      if (
        year_of_passing &&
        Array.isArray(year_of_passing) &&
        year_of_passing.length > 0
      ) {
        const yopValues = year_of_passing.map((y) => [insertId, String(y)]);
        await connection.query(
          `INSERT INTO job_years_of_passing (job_id, year) VALUES ?`,
          [yopValues],
        );
      }

      if (
        interview_rounds &&
        Array.isArray(interview_rounds) &&
        interview_rounds.length > 0
      ) {
        const roundValues = interview_rounds.map((r, index) => [
          insertId,
          r.round_number || index + 1,
          String(r.round_name),
        ]);
        await connection.query(
          `INSERT INTO job_interview_rounds (job_id, round_number, round_name) VALUES ?`,
          [roundValues],
        );
      }

      if (streams && Array.isArray(streams) && streams.length > 0) {
        let streamIds = [];
        for (const streamName of streams) {
          const [row] = await connection.query(
            `SELECT stream_id FROM streams WHERE stream_name = ?`,
            [streamName],
          );
          if (row.length > 0) {
            streamIds.push(row[0].stream_id);
          } else {
            const [res] = await connection.query(
              `INSERT INTO streams (stream_name) VALUES (?)`,
              [streamName],
            );
            streamIds.push(res.insertId);
          }
        }
        if (streamIds.length > 0) {
          const streamValues = streamIds.map((sid) => [insertId, sid]);
          await connection.query(
            `INSERT INTO job_streams (job_id, stream_id) VALUES ?`,
            [streamValues],
          );
        }
      }

      if (
        skills_required &&
        Array.isArray(skills_required) &&
        skills_required.length > 0
      ) {
        let skillIds = [];
        for (const skillName of skills_required) {
          const [row] = await connection.query(
            `SELECT skill_id FROM skills WHERE skill_name = ?`,
            [skillName],
          );
          if (row.length > 0) {
            skillIds.push(row[0].skill_id);
          } else {
            const [res] = await connection.query(
              `INSERT INTO skills (skill_name) VALUES (?)`,
              [skillName],
            );
            skillIds.push(res.insertId);
          }
        }
        if (skillIds.length > 0) {
          const skillValues = skillIds.map((sid) => [insertId, sid]);
          await connection.query(
            `INSERT INTO job_skills (job_id, skill_id) VALUES ?`,
            [skillValues],
          );
        }
      }

      if (
        min_required_percentage &&
        Array.isArray(min_required_percentage) &&
        min_required_percentage.length > 0
      ) {
        const minPercValues = min_required_percentage.map((m) => [
          insertId,
          m.education_level,
          m.percentage,
        ]);
        await connection.query(
          `INSERT INTO job_min_percentages (job_id, education_level, percentage) VALUES ?`,
          [minPercValues],
        );
      }

      if (
        other_criterias &&
        Array.isArray(other_criterias) &&
        other_criterias.length > 0
      ) {
        const criteriaValues = other_criterias.map((c) => [
          insertId,
          c.criteria_name,
          c.is_allowed ? 1 : 0,
        ]);
        await connection.query(
          `INSERT INTO job_other_criteria (job_id, criteria_name, is_allowed) VALUES ?`,
          [criteriaValues],
        );
      }

      await connection.commit();
      return insertId;
    } catch (error) {
      if (connection) await connection.rollback();
      throw new Error(error.message);
    } finally {
      if (connection) connection.release();
    }
  },

  getJobs: async (queryFilters = {}) => {
    try {
      let query = `
        SELECT DISTINCT j.id, j.job_id, j.looking_for, j.location, j.salary, 
               j.qualification, j.created_at, j.expires_at, j.job_category
        FROM job_master j
      `;
      const queryParams = [];
      const conditions = [];

      if (queryFilters.year_of_passing) {
        query += ` LEFT JOIN job_years_of_passing yop ON j.id = yop.job_id `;
        conditions.push(`yop.year = ?`);
        queryParams.push(String(queryFilters.year_of_passing));
      }

      if (queryFilters.category) {
        conditions.push(`j.job_category = ?`);
        queryParams.push(queryFilters.category);
      }

      if (queryFilters.status) {
        if (queryFilters.status === "Active") {
          conditions.push(`j.expires_at >= CURDATE()`);
        } else if (queryFilters.status === "Closed") {
          conditions.push(`j.expires_at < CURDATE()`);
        }
      }

      if (queryFilters.search) {
        conditions.push(`(j.job_id LIKE ? OR j.looking_for LIKE ?)`);
        const searchPattern = "%" + queryFilters.search + "%";
        queryParams.push(searchPattern, searchPattern);
      }

      if (queryFilters.qualification) {
        conditions.push(`j.qualification LIKE ?`);
        queryParams.push("%" + queryFilters.qualification + "%");
      }

      if (queryFilters.location) {
        conditions.push(`j.location LIKE ?`);
        queryParams.push("%" + queryFilters.location + "%");
      }

      if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(" AND ");
      }

      query += ` ORDER BY j.created_at DESC`;

      const [jobs] = await pool.query(query, queryParams);

      return jobs.map((job) => {
        let locationParsed = job.location;
        let qualificationParsed = job.qualification;
        if (
          job.location &&
          typeof job.location === "string" &&
          job.location.includes(",")
        )
          locationParsed = job.location.split(",").map((s) => s.trim());
        if (
          job.qualification &&
          typeof job.qualification === "string" &&
          job.qualification.includes(",")
        )
          qualificationParsed = job.qualification
            .split(",")
            .map((s) => s.trim());

        return {
          ...job,
          location: locationParsed,
          qualification: qualificationParsed,
        };
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getJobById: async (id) => {
    try {
      const query = `SELECT * FROM job_master WHERE id = ?`;
      const [jobs] = await pool.query(query, [id]);
      if (jobs.length === 0) return null;

      const job = jobs[0];

      const [yopRows] = await pool.query(
        `SELECT id, job_id, year FROM job_years_of_passing WHERE job_id = ?`,
        [id],
      );
      const [roundRows] = await pool.query(
        `SELECT round_id, job_id, round_number, round_name FROM job_interview_rounds WHERE job_id = ? ORDER BY round_number ASC`,
        [id],
      );
      const [minPercRows] = await pool.query(
        `SELECT id, job_id, education_level, percentage FROM job_min_percentages WHERE job_id = ?`,
        [id],
      );
      const [criteriaRows] = await pool.query(
        `SELECT id, job_id, criteria_name, is_allowed FROM job_other_criteria WHERE job_id = ?`,
        [id],
      );

      const [streamRows] = await pool.query(
        `
        SELECT js.id, js.job_id, js.stream_id, s.stream_name 
        FROM job_streams js 
        INNER JOIN streams s ON js.stream_id = s.stream_id 
        WHERE js.job_id = ?
      `,
        [id],
      );

      const [skillRows] = await pool.query(
        `
        SELECT js.id, js.job_id, js.skill_id, s.skill_name 
        FROM job_skills js 
        INNER JOIN skills s ON js.skill_id = s.skill_id 
        WHERE js.job_id = ?
      `,
        [id],
      );

      return {
        ...job,
        location:
          job.location && job.location.includes(",")
            ? job.location.split(",").map((s) => s.trim())
            : job.location,
        qualification:
          job.qualification && job.qualification.includes(",")
            ? job.qualification.split(",").map((s) => s.trim())
            : job.qualification,
        year_of_passing: yopRows.map((y) => ({
          id: y.id,
          job_id: y.job_id,
          year: Number(y.year),
        })),
        interview_rounds: roundRows.map((r) => ({
          id: r.round_id,
          job_id: r.job_id,
          round_number: r.round_number,
          round_name: r.round_name,
        })),
        streams: streamRows.map((s) => ({
          id: s.id,
          job_id: s.job_id,
          stream_id: s.stream_id,
          stream_name: s.stream_name,
        })),
        skills_required: skillRows.map((s) => ({
          id: s.id,
          job_id: s.job_id,
          skill_id: s.skill_id,
          skill_name: s.skill_name,
        })),
        min_required_percentage: minPercRows.map((m) => ({
          id: m.id,
          job_id: m.job_id,
          education_level: m.education_level,
          percentage: Number(m.percentage),
        })),
        other_criterias: criteriaRows.map((c) => ({
          id: c.id,
          job_id: c.job_id,
          criteria_name: c.criteria_name,
          is_allowed: !!c.is_allowed,
        })),
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateJob: async (id, jobData) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const {
        job_id,
        looking_for,
        location,
        service_agreement,
        salary,
        qualification,
        year_of_passing,
        interview_rounds,
        interview_date,
        interview_mode,
        shift,
        streams,
        gender_preference,
        min_required_percentage,
        skills_required,
        blocking_period,
        other_criterias,
        notes,
        expires_at,
        fileData,
        job_category,
        updated_at,
      } = jobData;

      let query = `
        UPDATE job_master SET
          job_id = COALESCE(?, job_id),
          looking_for = COALESCE(?, looking_for),
          location = COALESCE(?, location),
          service_agreement = COALESCE(?, service_agreement),
          salary = COALESCE(?, salary),
          qualification = COALESCE(?, qualification),
          interview_date = COALESCE(?, interview_date),
          interview_mode = COALESCE(?, interview_mode),
          shift = COALESCE(?, shift),
          gender_preference = COALESCE(?, gender_preference),
          blocking_period = COALESCE(?, blocking_period),
          notes = COALESCE(?, notes),
          expires_at = COALESCE(?, expires_at),
          job_category = COALESCE(?, job_category),
          updated_at = COALESCE(?, updated_at),
      `;

      const values = [
        job_id || null,
        looking_for || null,
        Array.isArray(location) ? location.join(", ") : location || null,
        service_agreement || null,
        salary || null,
        Array.isArray(qualification)
          ? qualification.join(", ")
          : qualification || null,
        interview_date || null,
        interview_mode || null,
        shift || null,
        gender_preference || null,
        blocking_period || null,
        notes || null,
        expires_at || null,
        job_category || null,
        updated_at || null,
      ];

      // If a new file is uploaded, update file fields
      if (fileData) {
        const [existingJobRows] = await connection.query(
          `SELECT file_name FROM job_master WHERE id = ?`,
          [id],
        );
        if (existingJobRows.length > 0 && existingJobRows[0].file_name) {
          try {
            const oldPath = path.join(
              __dirname,
              `../uploads/documents/${existingJobRows[0].file_name}`,
            );
            await fs.unlink(oldPath);
          } catch (e) {
            console.error("Failed to delete old job attachment:", e.message);
          }
        }

        query += `, file_name=?, original_name=?, file_size=?, mime_type=?, file_path=?`;
        values.push(
          fileData.fileName,
          fileData.originalName,
          fileData.fileSize,
          fileData.mimeType,
          fileData.path,
        );
      }

      query += ` WHERE id = ?`;
      values.push(id);

      const [result] = await connection.query(query, values);

      // Update relations if they exist in jobData
      if (year_of_passing) {
        await connection.query(
          `DELETE FROM job_years_of_passing WHERE job_id = ?`,
          [id],
        );
        if (Array.isArray(year_of_passing) && year_of_passing.length > 0) {
          const yopValues = year_of_passing.map((y) => [id, String(y)]);
          await connection.query(
            `INSERT INTO job_years_of_passing (job_id, year) VALUES ?`,
            [yopValues],
          );
        }
      }

      if (interview_rounds) {
        await connection.query(
          `DELETE FROM job_interview_rounds WHERE job_id = ?`,
          [id],
        );
        if (Array.isArray(interview_rounds) && interview_rounds.length > 0) {
          const roundValues = interview_rounds.map((r, index) => [
            id,
            r.round_number || index + 1,
            String(r.round_name),
          ]);
          await connection.query(
            `INSERT INTO job_interview_rounds (job_id, round_number, round_name) VALUES ?`,
            [roundValues],
          );
        }
      }

      if (streams) {
        await connection.query(`DELETE FROM job_streams WHERE job_id = ?`, [
          id,
        ]);
        if (Array.isArray(streams) && streams.length > 0) {
          let streamIds = [];
          for (const streamName of streams) {
            const [row] = await connection.query(
              `SELECT stream_id FROM streams WHERE stream_name = ?`,
              [streamName],
            );
            if (row.length > 0) {
              streamIds.push(row[0].stream_id);
            } else {
              const [res] = await connection.query(
                `INSERT INTO streams (stream_name) VALUES (?)`,
                [streamName],
              );
              streamIds.push(res.insertId);
            }
          }
          if (streamIds.length > 0) {
            const streamValues = streamIds.map((sid) => [id, sid]);
            await connection.query(
              `INSERT INTO job_streams (job_id, stream_id) VALUES ?`,
              [streamValues],
            );
          }
        }
      }

      if (skills_required) {
        await connection.query(`DELETE FROM job_skills WHERE job_id = ?`, [id]);
        if (Array.isArray(skills_required) && skills_required.length > 0) {
          let skillIds = [];
          for (const skillName of skills_required) {
            const [row] = await connection.query(
              `SELECT skill_id FROM skills WHERE skill_name = ?`,
              [skillName],
            );
            if (row.length > 0) {
              skillIds.push(row[0].skill_id);
            } else {
              const [res] = await connection.query(
                `INSERT INTO skills (skill_name) VALUES (?)`,
                [skillName],
              );
              skillIds.push(res.insertId);
            }
          }
          if (skillIds.length > 0) {
            const skillValues = skillIds.map((sid) => [id, sid]);
            await connection.query(
              `INSERT INTO job_skills (job_id, skill_id) VALUES ?`,
              [skillValues],
            );
          }
        }
      }

      if (min_required_percentage) {
        await connection.query(
          `DELETE FROM job_min_percentages WHERE job_id = ?`,
          [id],
        );
        if (
          Array.isArray(min_required_percentage) &&
          min_required_percentage.length > 0
        ) {
          const minPercValues = min_required_percentage.map((m) => [
            id,
            m.education_level,
            m.percentage,
          ]);
          await connection.query(
            `INSERT INTO job_min_percentages (job_id, education_level, percentage) VALUES ?`,
            [minPercValues],
          );
        }
      }

      if (other_criterias) {
        await connection.query(
          `DELETE FROM job_other_criteria WHERE job_id = ?`,
          [id],
        );
        if (Array.isArray(other_criterias) && other_criterias.length > 0) {
          const criteriaValues = other_criterias.map((c) => [
            id,
            c.criteria_name,
            c.is_allowed ? 1 : 0,
          ]);
          await connection.query(
            `INSERT INTO job_other_criteria (job_id, criteria_name, is_allowed) VALUES ?`,
            [criteriaValues],
          );
        }
      }

      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      if (connection) await connection.rollback();
      throw new Error(error.message);
    } finally {
      if (connection) connection.release();
    }
  },

  deleteJob: async (id) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [existingJobRows] = await connection.query(
        `SELECT file_name FROM job_master WHERE id = ?`,
        [id],
      );
      if (existingJobRows.length > 0 && existingJobRows[0].file_name) {
        try {
          const oldPath = path.join(
            __dirname,
            `../uploads/documents/${existingJobRows[0].file_name}`,
          );
          await fs.unlink(oldPath);
        } catch (e) {
          console.error("Failed to delete job attachment:", e.message);
        }
      }

      // Explicitly delete cascaded data since ON DELETE CASCADE is missing on the user schema definitions
      await connection.query(
        `DELETE FROM job_years_of_passing WHERE job_id = ?`,
        [id],
      );
      await connection.query(
        `DELETE FROM job_interview_rounds WHERE job_id = ?`,
        [id],
      );
      await connection.query(`DELETE FROM job_streams WHERE job_id = ?`, [id]);
      await connection.query(`DELETE FROM job_skills WHERE job_id = ?`, [id]);
      await connection.query(
        `DELETE FROM job_min_percentages WHERE job_id = ?`,
        [id],
      );
      await connection.query(
        `DELETE FROM job_other_criteria WHERE job_id = ?`,
        [id],
      );

      const query = `DELETE FROM job_master WHERE id = ?`;
      const [result] = await connection.query(query, [id]);

      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      if (connection) await connection.rollback();
      throw new Error(error.message);
    } finally {
      if (connection) connection.release();
    }
  },

  addStreams: async (stream_id, stream_name) => {
    try {
      let affectedRows = 0;
      const [isExists] = await pool.query(
        `SELECT  FROM streams WHERE stream_id = ?`,
        [stream_id],
      );
      if (isExists.length > 0) {
        return { message: "Stream already exists" };
      }

      if (!stream_id) {
        const [result] = await pool.query(
          `INSERT INTO streams (stream_name) VALUES (?)`,
          [stream_name],
        );
        affectedRows = result.affectedRows;
      } else {
        const [result] = await pool.query(
          `UPDATE streams SET stream_name = ? WHERE stream_id = ?`,
          [stream_name, stream_id],
        );
        affectedRows = result.affectedRows;
      }
      return affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getStreams: async (stream_name) => {
    try {
      let query = `SELECT stream_id, stream_name FROM streams WHERE 1 = 1`;
      let params = [];
      if (stream_name) {
        query += ` AND stream_name LIKE ?`;
        params.push(`%${stream_name}%`);
      }
      const [result] = await pool.query(query, params);
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteStream: async (stream_id) => {
    try {
      const [result] = await pool.query(
        `DELETE FROM streams WHERE stream_id = ?`,
        [stream_id],
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = JobModel;
