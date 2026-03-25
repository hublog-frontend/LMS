const pool = require("../config/config");

const UserModel = {
  updateExperience: async (
    user_id,
    company_name,
    job_title,
    year_of_experience,
    location,
    start_month,
    start_year,
    end_month,
    end_year,
    is_present,
    responsibility,
    created_date,
    experience_id,
  ) => {
    try {
      let affectedRows = 0;
      const insertQuery = `INSERT INTO experiences(
                                user_id,
                                company_name,
                                job_title,
                                years_of_experience,
                                location,
                                start_month,
                                start_year,
                                end_month,
                                end_year,
                                responsibility,
                                is_present_company,
                                created_date
                            )
                            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const insertValues = [
        user_id,
        company_name,
        job_title,
        year_of_experience,
        location,
        start_month,
        start_year,
        end_month,
        end_year,
        responsibility,
        is_present,
        created_date,
      ];

      const updateQuery = `UPDATE
                                experiences
                            SET
                                company_name = ?,
                                job_title = ?,
                                years_of_experience = ?,
                                location = ?,
                                start_month = ?,
                                start_year = ?,
                                end_month = ?,
                                end_year = ?,
                                responsibility = ?,
                                is_present_company = ?
                            WHERE id = ?`;

      const updateValues = [
        company_name,
        job_title,
        year_of_experience,
        location,
        start_month,
        start_year,
        end_month,
        end_year,
        responsibility,
        is_present,
        experience_id,
      ];

      if (!experience_id) {
        const [insertResult] = await pool.query(insertQuery, insertValues);

        affectedRows += insertResult.affectedRows;
      } else if (experience_id) {
        const [updateResult] = await pool.query(updateQuery, updateValues);

        affectedRows += updateResult.affectedRows;
      }

      return affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateEducation: async (
    user_id,
    education,
    register_number,
    passed_year,
    college_name,
    board_name,
    percentage,
    branch,
    backlog,
    year_gap,
    created_date,
    education_id,
    is_pg,
  ) => {
    try {
      let affectedRows = 0;
      const insertQuery = `INSERT INTO educations(
                                user_id,
                                education,
                                register_number,
                                passed_year,
                                college_name,
                                board_name,
                                percentage,
                                branch,
                                backlog,
                                year_gap,
                                is_pg,
                                created_date
                            )
                            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const insertValues = [
        user_id,
        education,
        register_number,
        passed_year,
        college_name,
        board_name,
        percentage,
        branch,
        backlog,
        year_gap,
        is_pg,
        created_date,
      ];

      const updateQuery = `UPDATE
                                educations
                            SET
                                education = ?,
                                register_number = ?,
                                passed_year = ?,
                                college_name = ?,
                                board_name = ?,
                                percentage = ?,
                                branch = ?,
                                backlog = ?,
                                year_gap = ?,
                                is_pg = ?
                            WHERE
                                id = ?`;

      const updateValues = [
        education,
        register_number,
        passed_year,
        college_name,
        board_name,
        percentage,
        branch,
        backlog,
        year_gap,
        is_pg,
        education_id,
      ];

      if (!education_id) {
        const [insertResult] = await pool.query(insertQuery, insertValues);

        affectedRows += insertResult.affectedRows;
      } else if (education_id) {
        const [updateResult] = await pool.query(updateQuery, updateValues);

        affectedRows += updateResult.affectedRows;
      }

      return affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateProject: async (
    user_id,
    project_name,
    link,
    description,
    created_date,
    project_id,
  ) => {
    try {
      let affectedRows = 0;
      const insertQuery = `INSERT INTO projects(
                                user_id,
                                project_name,
                                link,
                                description,
                                created_date
                            )
                            VALUES(?, ?, ?, ?, ?)`;

      const insertValues = [
        user_id,
        project_name,
        link,
        description,
        created_date,
      ];

      const updateQuery = `UPDATE
                                projects
                            SET
                                project_name = ?,
                                link = ?,
                                description = ?
                            WHERE
                                id = ?`;

      const updateValues = [project_name, link, description, project_id];

      if (!project_id) {
        const [insertResult] = await pool.query(insertQuery, insertValues);

        affectedRows += insertResult.affectedRows;
      } else if (project_id) {
        const [updateResult] = await pool.query(updateQuery, updateValues);

        affectedRows += updateResult.affectedRows;
      }

      return affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateCertificate: async (
    user_id,
    title,
    issuing_organization,
    issued_year,
    description,
    created_date,
    certificate_id,
  ) => {
    try {
      let affectedRows = 0;
      const insertQuery = `INSERT INTO certificates(
                                user_id,
                                title,
                                issuing_organization,
                                issued_year,
                                description,
                                created_date
                            )
                            VALUES(?, ?, ?, ?, ?, ?)`;

      const insertValues = [
        user_id,
        title,
        issuing_organization,
        issued_year,
        description,
        created_date,
      ];

      const updateQuery = `UPDATE
                                certificates
                            SET
                                title = ?,
                                issuing_organization = ?,
                                issued_year = ?,
                                description = ?
                            WHERE
                                id = ?`;

      const updateValues = [
        title,
        issuing_organization,
        issued_year,
        description,
        certificate_id,
      ];

      if (!certificate_id) {
        const [insertResult] = await pool.query(insertQuery, insertValues);

        affectedRows += insertResult.affectedRows;
      } else if (certificate_id) {
        const [updateResult] = await pool.query(updateQuery, updateValues);

        affectedRows += updateResult.affectedRows;
      }

      return affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateUser: async (
    user_name,
    email,
    password,
    phone_code,
    phone,
    whatsapp_code,
    whatsapp_number,
    guardian_phone_code,
    guardian_phone,
    gender,
    dob,
    linked_in,
    instagram,
    current_state,
    current_city,
    native_state,
    native_city,
    permanent_address,
    pincode,
    academic_gap,
    enrolled_mode,
    ready_for_relocate,
    github_link,
    portfolio_link,
    portfolio_title,
    summary,
    skills,
    hobbies,
    languages,
    service_agreement,
    placed,
    profile_image,
    resume,
    user_id,
  ) => {
    try {
      const updateQuery = `UPDATE
                                users
                            SET
                                user_name = ?,
                                email = ?,
                                password = ?,
                                phone_code = ?,
                                phone = ?,
                                whatsapp_code = ?,
                                whatsapp_number = ?,
                                guardian_phone_code = ?,
                                guardian_phone = ?,
                                gender = ?,
                                dob = ?,
                                linked_in = ?,
                                instagram = ?,
                                current_state = ?,
                                current_city = ?,
                                native_state = ?,
                                native_city = ?,
                                permanent_address = ?,
                                pincode = ?,
                                academic_gap = ?,
                                enrolled_mode = ?,
                                ready_for_relocate = ?,
                                github_link = ?,
                                portfolio_link = ?,
                                portfolio_title = ?,
                                summary = ?,
                                skills = ?,
                                hobbies = ?,
                                languages = ?,
                                service_agreement = ?,
                                placed = ?,
                                profile_image = ?,
                                resume = ?
                            WHERE
                                id = ?`;

      const values = [
        user_name,
        email,
        password,
        phone_code,
        phone,
        whatsapp_code,
        whatsapp_number,
        guardian_phone_code,
        guardian_phone,
        gender,
        dob,
        linked_in,
        instagram,
        current_state,
        current_city,
        native_state,
        native_city,
        permanent_address,
        pincode,
        academic_gap,
        enrolled_mode,
        ready_for_relocate,
        github_link,
        portfolio_link,
        portfolio_title,
        summary,
        skills,
        hobbies,
        languages,
        service_agreement,
        placed,
        profile_image,
        resume,
        user_id,
      ];

      const [updateResult] = await pool.query(updateQuery, values);

      return updateResult.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getUserById: async (user_id) => {
    try {
      const queryParams = [];
      let userQuery = `SELECT
                            id,
                            user_name,
                            email,
                            password,
                            phone_code,
                            phone,
                            whatsapp_code,
                            whatsapp_number,
                            guardian_phone_code,
                            guardian_phone,
                            gender,
                            dob,
                            linked_in,
                            instagram,
                            current_state,
                            current_city,
                            native_state,
                            native_city,
                            permanent_address,
                            pincode,
                            academic_gap,
                            enrolled_mode,
                            ready_for_relocate,
                            github_link,
                            portfolio_link,
                            portfolio_title,
                            summary,
                            skills,
                            hobbies,
                            languages,
                            service_agreement,
                            placed,
                            profile_image,
                            resume,
                            is_active,
                            created_date
                        FROM
                            users
                        WHERE 1 = 1`;

      userQuery += ` AND id = ?`;
      queryParams.push(user_id);

      const [[user]] = await pool.query(userQuery, queryParams);

      const [getExperience] = await pool.query(
        `SELECT
            id,
            user_id,
            company_name,
            job_title,
            years_of_experience,
            location,
            start_month,
            start_year,
            end_month,
            end_year,
            responsibility,
            is_present_company,
            created_date
        FROM
            experiences
        WHERE
            user_id = ?
        ORDER BY id ASC;`,
        [user_id],
      );

      const [getEducation] = await pool.query(
        `SELECT
            id,
            user_id,
            education,
            register_number,
            passed_year,
            college_name,
            board_name,
            percentage,
            branch,
            backlog,
            year_gap,
            is_pg,
            created_date
        FROM
            educations
        WHERE
            user_id = ?
        ORDER BY id ASC;`,
        [user_id],
      );

      const [getProjects] = await pool.query(
        `SELECT
            id,
            user_id,
            project_name,
            link,
            description,
            created_date
        FROM
            projects
        WHERE
            user_id = ?
        ORDER BY id ASC`,
        [user_id],
      );

      const [getCertificates] = await pool.query(
        `SELECT
            id,
            user_id,
            title,
            issuing_organization,
            issued_year,
            description,
            created_date
        FROM
            certificates
        WHERE
            user_id = ?
        ORDER BY id ASC`,
        [user_id],
      );

      return {
        ...user,
        skills: JSON.parse(user.skills),
        hobbies: JSON.parse(user.hobbies),
        languages: JSON.parse(user.languages),
        experience: getExperience,
        education: getEducation,
        projects: getProjects,
        certificates: getCertificates,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAllUsers: async (user_name, mobile, email, page, limit) => {
    try {
      const queryParams = [];
      let getQuery = `SELECT
                        id,
                        user_name,
                        email,
                        password,
                        phone_code,
                        phone,
                        whatsapp_code,
                        whatsapp_number,
                        guardian_phone_code,
                        guardian_phone,
                        gender,
                        dob,
                        is_active,
                        created_date
                    FROM users
                    WHERE 1 = 1`;

      let totalQuery = `SELECT
                        COUNT(id) AS total
                    FROM users
                    WHERE 1 = 1`;

      if (user_name) {
        getQuery += ` AND user_name LIKE '%${user_name}%'`;
        totalQuery += ` AND user_name LIKE '%${user_name}%'`;
      }

      if (mobile) {
        getQuery += ` AND phone LIKE '%${mobile}%'`;
        totalQuery += ` AND phone LIKE '%${mobile}%'`;
      }

      if (email) {
        getQuery += ` AND email LIKE '%${email}%'`;
        totalQuery += ` AND email LIKE '%${email}%'`;
      }

      const [totalResult] = await pool.query(totalQuery);

      const total = totalResult[0]?.total || 0;
      const pageNumber = parseInt(page, 10) || 1;
      const limitNumber = parseInt(limit, 10) || 10;
      const offset = (pageNumber - 1) * limitNumber;

      getQuery += ` ORDER BY user_name ASC LIMIT ? OFFSET ?`;
      queryParams.push(limitNumber, offset);

      const [users] = await pool.query(getQuery, queryParams);

      return {
        users: users,
        pagination: {
          total: parseInt(total),
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteExperience: async (experience_id) => {
    try {
      const [result] = await pool.query(
        `DELETE FROM experiences WHERE id = ?`,
        [experience_id],
      );

      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteProject: async (project_id) => {
    try {
      const [result] = await pool.query(`DELETE FROM projects WHERE id = ?`, [
        project_id,
      ]);

      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteCertificate: async (certificate_id) => {
    try {
      const [result] = await pool.query(
        `DELETE FROM certificates WHERE id = ?`,
        [certificate_id],
      );

      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = UserModel;
