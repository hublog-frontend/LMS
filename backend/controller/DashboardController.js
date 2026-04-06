const DashboardModel = require("../model/DashboardModel");

class DashboardController {
  static async getDashboardData(request, response) {
    const { user_id } = request.query;

    try {
      if (!user_id) {
        return response.status(400).send({
          message: "Missing user_id",
        });
      }

      const dashboardData = await DashboardModel.getDashboardData(user_id);

      return response.status(200).send({
        message: "Dashboard data fetched successfully",
        data: dashboardData,
      });
    } catch (error) {
      console.error("Dashboard controller error:", error);
      return response.status(500).send({
        message: "Failed to fetch dashboard data",
        details: error.message,
      });
    }
  }
}

module.exports = DashboardController;
