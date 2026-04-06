const pool = require("../config/config");

const DashboardModel = {
  getDashboardData: async (user_id) => {
    try {
      // 1. Ensure banners table exists and has dummy data (Lazy Migration)
      await pool.query(`
        CREATE TABLE IF NOT EXISTS dashboard_banners (
          id INT AUTO_INCREMENT PRIMARY KEY,
          image_url VARCHAR(255) NOT NULL,
          is_active TINYINT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Check if banners exist, if not add dummy
      const [bannersCount] = await pool.query(
        "SELECT COUNT(*) as count FROM dashboard_banners",
      );
      if (bannersCount[0].count === 0) {
        await pool.query(`
          INSERT INTO dashboard_banners (image_url) VALUES 
          ('https://img.freepik.com/premium-photo/online-learning-banner-set-design-website-social-media_1253202-39075.jpg'),
          ('https://img.freepik.com/premium-photo/online-learning-banner-set-design-website-social-media_1253202-39071.jpg')
        `);
      }

      // 2. Fetch Banners
      const [banners] = await pool.query(
        "SELECT image_url FROM dashboard_banners WHERE is_active = 1",
      );

      // 3. Fetch Leaderboard (Top performers by total test marks)
      const [leaderboard] = await pool.query(`
        SELECT 
          u.user_name, 
          u.profile_image,
          COALESCE(SUM(th.total_marks_scored), 0) as total_score
        FROM users u
        LEFT JOIN test_history th ON u.id = th.user_id
        GROUP BY u.id
        ORDER BY total_score DESC
        LIMIT 10
      `);

      // 3.1 Fetch Logged-in User's Rank
      const [userRankResult] = await pool.query(
        `
        SELECT rank_val FROM (
          SELECT u.id as user_id, 
                 RANK() OVER (ORDER BY COALESCE(SUM(th.total_marks_scored), 0) DESC) as rank_val
          FROM users u
          LEFT JOIN test_history th ON u.id = th.user_id
          GROUP BY u.id
        ) as rankings WHERE user_id = ?
        `,
        [user_id],
      );

      const user_rank = userRankResult.length > 0 ? userRankResult[0].rank_val : 0;
      const user_score_result = await pool.query(
        "SELECT COALESCE(SUM(total_marks_scored), 0) as score FROM test_history WHERE user_id = ?",
        [user_id],
      );
      const user_total_score = user_score_result[0][0]?.score || 0;

      // 4. Calculate Progress (Same logic as UserModel)
      // Assignment Progress
      const [[{ total_questions }]] = await pool.query(
        `SELECT COUNT(*) AS total_questions 
         FROM assignment_module_questions AS mq
         INNER JOIN assignments AS a ON (SELECT assignment_id FROM assignment_module WHERE id = mq.assignment_module_id) = a.id
         WHERE mq.is_active = 1 AND a.is_active = 1`,
      );

      const [[{ solved_questions }]] = await pool.query(
        `SELECT COUNT(DISTINCT module_question_id) AS solved_questions 
         FROM assignment_results 
         WHERE user_id = ? AND score_obtained > 0`,
        [user_id],
      );

      const assignmentProgress =
        total_questions > 0
          ? Math.round((solved_questions / total_questions) * 100)
          : 0;

      // Course Progress
      const [[{ total_videos }]] = await pool.query(
        "SELECT COUNT(*) AS total_videos FROM course_videos WHERE is_deleted = 0",
      );

      const [[{ watched_videos }]] = await pool.query(
        "SELECT COUNT(*) AS watched_videos FROM video_progress WHERE user_id = ? AND is_completed = 1",
        [user_id],
      );

      const courseProgress =
        total_videos > 0
          ? Math.round((watched_videos / total_videos) * 100)
          : 0;

      // Test Progress (Tests completed / Total active tests)
      const [[{ total_tests }]] = await pool.query(
        "SELECT COUNT(*) AS total_tests FROM tests WHERE is_active = 1",
      );

      const [[{ completed_tests }]] = await pool.query(
        "SELECT COUNT(DISTINCT test_id) AS completed_tests FROM test_history WHERE user_id = ?",
        [user_id],
      );

      const testProgress =
        total_tests > 0 ? Math.round((completed_tests / total_tests) * 100) : 0;

      return {
        banners,
        leaderboard,
        userRank: user_rank,
        userTotalScore: user_total_score,
        progress: {
          course: courseProgress,
          assignment: assignmentProgress,
          test: testProgress,
        },
      };
    } catch (error) {
      throw new Error("Dashboard data fetch failed: " + error.message);
    }
  },
};

module.exports = DashboardModel;
