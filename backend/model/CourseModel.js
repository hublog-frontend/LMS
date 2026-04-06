const pool = require("../config/config");
const CommonModel = require("../model/CommonModel");

const CourseModel = {
  createCourse: async (course_name, image, description, outcomes) => {
    try {
      const [isExists] = await pool.query(
        `SELECT id FROM course WHERE course_name = ? AND is_active = 1`,
        [course_name],
      );

      if (isExists.length > 0)
        throw new Error("The course name already exists");

      const [insertCourse] = await pool.query(
        `INSERT INTO course(
            course_name,
            base64string,
            description,
            outcomes
        )
        VALUES(?, ?, ?, ?)`,
        [course_name, image, description, outcomes],
      );

      return insertCourse.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getCourses: async (course_id, searchName) => {
    try {
      const queryParams = [];
      let getQuery = `SELECT id, course_name, base64string, description, outcomes FROM course WHERE is_active = 1`;

      if (course_id) {
        getQuery += ` AND id = ?`;
        queryParams.push(course_id);
      }

      if (searchName) {
        getQuery += ` AND course_name LIKE ?`;
        queryParams.push(`%${searchName}%`);
      }

      getQuery += ` ORDER BY course_name ASC`;

      const [courses] = await pool.query(getQuery, queryParams);

      const courseIds = [...new Set(courses.map((x) => x.id))];

      let durationMap = new Map();
      if (courseIds.length > 0) {
        const [getDuration] = await pool.query(
          `SELECT
            IFNULL(SUM(cv.duration), 0) AS duration_period,
            c.id AS course_id
        FROM course AS c
        INNER JOIN module AS m ON
            m.course_id = c.id
            AND m.is_active = 1
        INNER JOIN course_videos AS cv ON
            cv.module_id = m.id
        WHERE cv.is_deleted = 0
          AND c.id IN (?)
        GROUP BY c.id `,
          [courseIds],
        );

        getDuration.forEach((d) => durationMap.set(d.course_id, d));
      }

      let moduleMap = new Map();
      if (courseIds.length > 0) {
        const [getModule] = await pool.query(
          `SELECT
              COUNT(m.id) AS module_count,
              c.id AS course_id
          FROM course AS c
          INNER JOIN module AS m ON
              m.course_id = c.id
          WHERE m.is_active = 1
            AND c.id IN (?)
          GROUP BY c.id`,
          [courseIds],
        );

        getModule.forEach((m) => moduleMap.set(m.course_id, m));
      }

      let res = courses.map((item) => {
        const duration = durationMap.get(item.id) || {};
        const module = moduleMap.get(item.id) || {};

        const duration_period = duration.duration_period || 0;
        const module_count = module.module_count || 0;

        return {
          ...item,
          duration_period: CommonModel.formatDuration(duration_period),
          module_count: module_count,
        };
      });

      return res;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  createModule: async (course_id, module_name, title) => {
    try {
      const [isExists] = await pool.query(
        `SELECT id FROM module WHERE module_name = ? AND course_id = ? AND is_active = 1`,
        [module_name, course_id],
      );

      if (isExists.length > 0)
        throw new Error("The module name already exists");

      const [insertModule] = await pool.query(
        `INSERT INTO module(
            course_id,
            module_name,
            title
        )
        VALUES(?, ?, ?)`,
        [course_id, module_name, title],
      );

      return insertModule.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getModules: async (course_id) => {
    try {
      let getQuery = `SELECT
                          m.id,
                          m.course_id,
                          c.course_name,
                          m.module_name,
                          m.title
                      FROM
                          module AS m
                      INNER JOIN course AS c ON
                          c.id = m.course_id
                      WHERE m.is_active = 1 
                          AND m.course_id = ?
                      ORDER BY m.id ASC`;

      const [modules] = await pool.query(getQuery, [course_id]);

      const moduleIds = [...new Set(modules.map((x) => x.id))];

      let moduleMap = new Map();
      if (moduleIds.length > 0) {
        const [result] = await pool.query(
          `SELECT
              COUNT(cv.id) AS video_count,
              IFNULL(SUM(cv.duration), 0) AS duration_period,
              cv.module_id
          FROM course_videos AS cv
          INNER JOIN module AS m ON
              cv.module_id = m.id AND m.is_active = 1
          WHERE cv.is_deleted = 0
            AND m.id IN (?)
          GROUP BY cv.module_id`,
          [moduleIds],
        );

        result.forEach((m) => moduleMap.set(m.module_id, m));
      }

      let res = modules.map((item) => {
        const module = moduleMap.get(item.id) || {};

        const video_count = module.video_count || 0;
        const duration_period = module.duration_period || 0;

        return {
          ...item,
          video_count: video_count,
          duration_period: CommonModel.formatDuration(duration_period),
        };
      });

      return res;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  insertReview: async (course_id, user_id, rating, review, created_date) => {
    try {
      if (!course_id || !user_id || !rating) {
        throw new Error("Missing required fields");
      }

      const [isExists] = await pool.query(
        `SELECT id FROM reviews WHERE user_id = ? AND course_id = ?`,
        [user_id, course_id],
      );

      if (isExists.length > 0) throw new Error("Review already updated");

      const [insertReview] = await pool.query(
        `INSERT INTO reviews (course_id, user_id, rating, review, created_at)
       VALUES (?, ?, ?, ?, ?)`,
        [course_id, user_id, rating, review, created_date],
      );

      return insertReview.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getReviews: async (course_id) => {
    try {
      const [review] = await pool.query(
        `SELECT 
            COUNT(*) as total_reviews,
            ROUND(AVG(rating), 1) as avg_rating,
            SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
            SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
            SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
            SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
            SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
        FROM reviews
        WHERE course_id = ?;`,
        [course_id],
      );

      const data = review[0];

      const total = data.total_reviews || 1; // prevent divide by zero

      const [getReviews] = await pool.query(
        `SELECT
            r.id,
            r.rating,
            r.review,
            r.created_at,
            r.user_id,
            u.user_name
        FROM
            reviews AS r
        INNER JOIN users AS u ON
            r.user_id = u.id
        WHERE r.course_id = ?
        ORDER BY r.id DESC;`,
        [course_id],
      );

      const [getDiscussions] = await pool.query(
        `SELECT
            d.id,
            d.course_id,
            d.user_id,
            u.user_name,
            d.comments,
            d.created_date
        FROM
            discussions AS d
        INNER JOIN users AS u ON
            d.user_id = u.id
        WHERE d.course_id = ?
        ORDER BY d.id DESC;`,
        [course_id],
      );

      const response = {
        average_rating: data.avg_rating || 0,
        total_reviews: data.total_reviews,
        distribution: {
          5: ((data.five_star / total) * 100).toFixed(1),
          4: ((data.four_star / total) * 100).toFixed(1),
          3: ((data.three_star / total) * 100).toFixed(1),
          2: ((data.two_star / total) * 100).toFixed(1),
          1: ((data.one_star / total) * 100).toFixed(1),
        },
        reviews: getReviews,
        discussions: getDiscussions,
      };

      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  insertDiscussion: async (course_id, user_id, comments, created_date) => {
    try {
      if (!course_id || !user_id || !comments) {
        throw new Error("Missing required fields");
      }

      const [result] = await pool.query(
        `INSERT INTO discussions(
            course_id,
            user_id,
            comments,
            created_date
        )
        VALUES(?, ?, ?, ?)`,
        [course_id, user_id, comments, created_date],
      );

      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = CourseModel;
