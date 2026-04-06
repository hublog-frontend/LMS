const express = require("express");
const router = express.Router();

const { verifyToken } = require("../validation/Validation");
const LoginController = require("../controller/LoginController");
const CourseController = require("../controller/CourseController");
const UserController = require("../controller/UserController");
const VideoController = require("../controller/VideoController");
const upload = require("../validation/UploadMiddleware");
const TestController = require("../controller/TestController");
const AssignmentController = require("../controller/AssignmentController");
const CompanyController = require("../controller/CompanyController");
const BookmarkController = require("../controller/BookmarkController");
const CompilerController = require("../controller/CompilerController");
const JobController = require("../controller/JobController");
const DashboardController = require("../controller/DashboardController");

router.post("/login", LoginController.login);
router.post("/forgotPassword", LoginController.forgotPassword);
router.post("/verifyOTP", LoginController.verifyOTP);
router.post("/resetPassword", LoginController.resetPassword);
router.post("/updateFirebaseToken", LoginController.updateFirebaseToken);

router.get(
  "/getDashboardData",
  verifyToken,
  DashboardController.getDashboardData,
);

router.post("/createCourse", verifyToken, CourseController.createCourse);
router.get("/getCourses", verifyToken, CourseController.getCourses);
router.post("/createModule", verifyToken, CourseController.createModule);
router.get("/getModules", verifyToken, CourseController.getModules);
router.post("/insertReview", verifyToken, CourseController.insertReview);
router.get("/getReviews", verifyToken, CourseController.getReviews);
router.post(
  "/insertDiscussion",
  verifyToken,
  CourseController.insertDiscussion,
);

router.post("/updateExperience", verifyToken, UserController.updateExperience);
router.post("/updateEducation", verifyToken, UserController.updateEducation);
router.post("/updateProject", verifyToken, UserController.updateProject);
router.post(
  "/updateCertificate",
  verifyToken,
  UserController.updateCertificate,
);
router.post("/updateUser", verifyToken, UserController.updateUser);
router.get("/getUserById", verifyToken, UserController.getUserById);
router.post("/getAllUsers", verifyToken, UserController.getAllUsers);
router.delete(
  "/deleteExperience",
  verifyToken,
  UserController.deleteExperience,
);
router.delete("/deleteProject", verifyToken, UserController.deleteProject);

router.post(
  "/uploadContent",
  upload.uploadCourseVideo.single("content"),
  VideoController.uploadContent,
);
router.get("/getVideos", VideoController.getCourseVideos);
router.delete("/deleteContent", VideoController.deleteContent);
router.delete(
  "/deleteCertificate",
  verifyToken,
  UserController.deleteCertificate,
);

router.post("/createTopic", verifyToken, TestController.createTopic);
router.post("/createTest", verifyToken, TestController.createTest);
router.get("/getTopics", verifyToken, TestController.getTopics);
router.get("/getTests", verifyToken, TestController.getTests);
router.post("/insertTestResult", verifyToken, TestController.insertTestResult);
router.get("/getTestHistory", verifyToken, TestController.getTestHistory);
router.get("/getTestResult", verifyToken, TestController.getTestResult);
router.post("/addQuestions", verifyToken, TestController.addQuestions);
router.post("/updateQuestion", verifyToken, TestController.updateQuestion);
router.post("/getQuestions", verifyToken, TestController.getQuestions);
router.post("/mapTestQuestions", verifyToken, TestController.mapTestQuestions);
router.get("/getTestQuestions", verifyToken, TestController.getTestQuestions);
router.get("/getUpcomingTests", verifyToken, TestController.getUpcomingTests);
router.get("/getCompletedTests", verifyToken, TestController.getCompletedTests);

router.post(
  "/createAssignment",
  verifyToken,
  AssignmentController.createAssignment,
);
router.get("/getAssignments", verifyToken, AssignmentController.getAssignments);
router.post(
  "/createAssignmentModule",
  verifyToken,
  AssignmentController.createAssignmentModule,
);
router.get(
  "/getAssignmentModule",
  verifyToken,
  AssignmentController.getAssignmentModule,
);

router.delete("/deleteTopic", verifyToken, TestController.deleteTopic);
router.delete("/deleteQuestion", verifyToken, TestController.deleteQuestion);

router.post(
  "/addCompanyQuestion",
  upload.uploadDocument.array("content", 10),
  verifyToken,
  CompanyController.addCompanyQuestion,
);
router.get(
  "/getCompanyQuestions",
  verifyToken,
  CompanyController.getCompanyQuestions,
);
router.delete(
  "/deleteCompanyQuestion",
  verifyToken,
  CompanyController.deleteCompanyQuestion,
);
router.delete(
  "/deleteAttachment",
  verifyToken,
  CompanyController.deleteAttachment,
);
router.post("/addToFavorite", verifyToken, CompanyController.addToFavorite);
router.post(
  "/removeFromFavorite",
  verifyToken,
  CompanyController.removeFromFavorite,
);
router.get(
  "/getFavoriteCompanies",
  verifyToken,
  CompanyController.getFavoriteCompanies,
);

router.post("/addBookmark", verifyToken, BookmarkController.addBookmark);
router.post("/removeBookmark", verifyToken, BookmarkController.removeBookmark);

router.post("/addCategory", verifyToken, CompanyController.addCategory);
router.get("/getCategory", verifyToken, CompanyController.getCategory);
router.delete("/deleteCategory", verifyToken, CompanyController.deleteCategory);

router.post("/runCode", verifyToken, CompilerController.executeCode);
router.post("/submitCode", verifyToken, CompilerController.executeCode);

router.post(
  "/createJob",
  upload.uploadDocument.single("job_description"),
  verifyToken,
  JobController.createJob,
);
router.get("/getJobs", verifyToken, JobController.getJobs);
router.get("/getJobById/:id", verifyToken, JobController.getJobById);
router.put(
  "/updateJob/:id",
  upload.uploadDocument.single("job_description"),
  verifyToken,
  JobController.updateJob,
);
router.delete("/deleteJob/:id", verifyToken, JobController.deleteJob);

router.post("/addSkill", verifyToken, CompanyController.addSkill);
router.get("/getSkill", verifyToken, CompanyController.getSkill);
router.delete("/deleteSkill", verifyToken, CompanyController.deleteSkill);

router.post("/addStream", verifyToken, JobController.addStreams);
router.get("/getStreams", verifyToken, JobController.getStreams);
router.delete("/deleteStream", verifyToken, JobController.deleteStream);

router.post(
  "/userWiseCompanyQuestions",
  verifyToken,
  CompanyController.userWiseCompanyQuestions,
);

router.post(
  "/mapAssignmentQuestion",
  verifyToken,
  AssignmentController.mapAssignmentQuestion,
);

router.post("/addCompany", verifyToken, AssignmentController.addCompany);
router.get("/getCompanies", verifyToken, AssignmentController.getCompanies);
router.delete(
  "/deleteCompany",
  verifyToken,
  AssignmentController.deleteCompany,
);

router.post(
  "/insertAssignmentAttempt",
  verifyToken,
  AssignmentController.insertAssignmentAttempt,
);

router.post(
  "/insertAssignmentAnswer",
  verifyToken,
  AssignmentController.insertAssignmentAnswer,
);

router.post(
  "/userWiseAssignments",
  verifyToken,
  AssignmentController.userWiseAssignments,
);

router.post(
  "/userWiseModules",
  verifyToken,
  AssignmentController.userWiseModules,
);

router.post(
  "/userWiseTestHistory",
  verifyToken,
  TestController.userWiseTestHistory,
);

router.post(
  "/userWiseBookmarks",
  verifyToken,
  BookmarkController.userWiseBookmarks,
);

router.post("/addUser", UserController.addUser);

router.get("/getRegion", UserController.getRegion);
router.get("/getBranches", UserController.getBranches);
router.get("/getUserProgress", verifyToken, UserController.getUserProgress);
router.post("/setVideoProgress", verifyToken, VideoController.setVideoProgress);

module.exports = router;
