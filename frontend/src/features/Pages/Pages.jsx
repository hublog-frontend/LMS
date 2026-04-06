import React, { useState, useEffect } from "react";
import {
  Route,
  Routes,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Layout, Drawer, Button, Grid, Divider } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import ActeLogo from "../../assets/acte-logo.png";
import Login from "../Login/Login";
import ForgotPassword from "../Login/ForgotPassword";
import Courses from "../Courses/Courses";
import SideMenu from "./SideMenu";
import CourseVideos from "../Courses/CourseVideos";
import Tests from "../Tests/Tests";
import "./styles.css";
import { FiUser } from "react-icons/fi";
import { RiShutDownLine } from "react-icons/ri";
import { Tooltip } from "antd";
import Profile from "../Profile/Profile";
import Assignments from "../Assignments/Assigenments";
import TestTopics from "../Tests/TestTopics";
import ParticularAssignments from "../Assignments/ParticularAssignments";
import Questions from "../Questions/Questions";
import CompanyQuestionsTab from "../CompanyQuestions/CompanyQuestionsTab";
import CompanyDocuments from "../CompanyQuestions/CompanyDocuments";
import Bookmarks from "../Bookmarks/Bookmarks";
import TestAttempt from "../TestAttempt/TestAttempt";
import TestResult from "../Tests/TestResult";
import Jobs from "../Jobs/Jobs";
import DriveDetails from "../Jobs/DriveDetails";
import AssignmentPractice from "../Assignments/AssignmentPractice";
import FullTestHistory from "../Tests/FullTestHistory";
import Students from "../Students/Students";
import { initiateSocket, disconnectSocket } from "../../socket";
import { auth } from "../../firebase";
import { CommonMessage } from "../Common/CommonMessage";
import Dashboard from "../Dashboard/Dashboard";

const { Sider, Content, Header } = Layout;
const { useBreakpoint } = Grid;

export default function Pages() {
  const navigate = useNavigate();
  const location = useLocation();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [collapsed, setCollapsed] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const screens = useBreakpoint();
  const isMobile = !screens.md; // < 768px

  const isPublicRoute = (path) => {
    return (
      path === "/login" ||
      path.startsWith("/trainer-registration") ||
      path.startsWith("/customer-registration") ||
      path === "/success" ||
      path === "/helpdesk" ||
      path === "/forgot-password" ||
      path.startsWith("/test-attempt") ||
      path.startsWith("/assignment-practice")
    );
  };

  useEffect(() => {
    //handle navigate to login page when token expire
    const handleTokenExpire = () => {
      setCollapsed(true);
      setMobileOpen(false);
      // Clear auth but keep deviceId for session stability across tabs
      Object.keys(localStorage).forEach((key) => {
        if (key !== "deviceId") localStorage.removeItem(key);
      });
      navigate("/login");
    };

    window.addEventListener("tokenExpireUpdated", handleTokenExpire);

    // Initial load
    // handleTokenExpire();

    return () => {
      window.removeEventListener("tokenExpireUpdated", handleTokenExpire);
    };
  }, []);

  useEffect(() => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    if (getloginUserDetails) {
      const converAsJson = JSON.parse(getloginUserDetails);
      setUserName(converAsJson?.user_name);
      setUserEmail(converAsJson?.email);
    }

    const token = localStorage.getItem("AccessToken");
    const path = location.pathname;

    if (isPublicRoute(path)) {
      setShowSidebar(false);
      return;
    }

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setShowSidebar(true);
  }, [location.pathname, navigate]);

  // Separate effect for Socket Initialization - runs only when tokens change
  useEffect(() => {
    const fbToken = localStorage.getItem("FirebaseToken");
    const deviceId = localStorage.getItem("deviceId");

    // Only initiate if we are NOT on a public route and have tokens
    if (!isPublicRoute(location.pathname) && fbToken && deviceId) {
      initiateSocket(fbToken, deviceId);
    }
  }, [location.pathname]); // We keep location.pathname here just to catch the transition from public to private, but initiateSocket is now idempotent.

  useEffect(() => {
    // Show logout message if set
    const forceLogoutMsg = localStorage.getItem("logoutMessage");
    if (forceLogoutMsg) {
      CommonMessage("warning", forceLogoutMsg);
      localStorage.removeItem("logoutMessage");
    }
  }, []);

  if (isPublicRoute(location.pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/test-attempt/:testName/:testId"
          element={<TestAttempt />}
        />

        <Route path="/assignment-practice" element={<AssignmentPractice />} />
      </Routes>
    );
  }

  if (!showSidebar && !isPublicRoute(location.pathname)) return null;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* ================= Desktop Sidebar ================= */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          collapsedWidth={72}
          width={280}
          onMouseEnter={() => setCollapsed(false)}
          onMouseLeave={() => setCollapsed(true)}
          style={{
            position: "fixed",
            height: "100vh",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
            background: "#ffffff",
            borderRight: "1px solid #eaecf0",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            overflowX: "hidden",
            whiteSpace: "nowrap",
          }}
          theme="light"
        >
          <div className="pages_sidebar_innercontainer">
            <img
              src={ActeLogo}
              alt="Logo"
              className={
                collapsed ? "sidebar_logo_collapsed" : "sidebar_logo_expanded"
              }
            />

            <SideMenu />

            <div className="pages_sidebar_footer_container">
              <Divider className="tests_completedtests_divider" />
              <div className="pages_sidebar_footer_sub_container">
                <div style={{ display: "flex", gap: "10px" }}>
                  <div className="pages_sidebar_footer_avatar_div">
                    <FiUser size={20} color="#333" />
                  </div>

                  {!collapsed && (
                    <div>
                      <p className="pages_sidebar_login_username">{userName}</p>
                      <p className="pages_sidebar_login_useremail">
                        {userEmail}
                      </p>
                    </div>
                  )}
                </div>

                {!collapsed && (
                  <div>
                    <Tooltip placement="right" title="Logout">
                      <RiShutDownLine
                        size={24}
                        color="gray"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setCollapsed(true);
                          setMobileOpen(false);
                          // Clear auth but keep deviceId for session stability across tabs
                          Object.keys(localStorage).forEach((key) => {
                            if (key !== "deviceId")
                              localStorage.removeItem(key);
                          });
                          disconnectSocket();
                          auth.signOut();
                          navigate("/login");
                        }}
                      />
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Sider>
      )}

      {/* ================= Mobile Header ================= */}
      {isMobile && (
        <Header
          style={{
            background: "#ffffff",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #eaecf0",
            position: "sticky",
            top: 0,
            zIndex: 1000,
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 20 }} />}
            onClick={() => setMobileOpen(true)}
          />

          <img src={ActeLogo} alt="Logo" height={32} />
        </Header>
      )}

      {/* ================= Mobile Drawer ================= */}
      {isMobile && (
        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          bodyStyle={{ padding: 0 }}
          width={260}
        >
          <SideMenu onMenuClick={() => setMobileOpen(false)} />
        </Drawer>
      )}

      {/* ================= Main Content ================= */}
      <Layout
        style={{
          marginLeft: isMobile ? 0 : 72,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Content
          style={{
            padding: isMobile ? "16px" : "24px",
            minHeight: "100vh",
            // background: "#f9fafb",
          }}
        >
          <Routes>
            <Route element={<Dashboard />} path="/dashboard" />
            <Route element={<Courses />} path="/courses" />
            <Route element={<Questions />} path="/questions" />
            <Route element={<CourseVideos />} path="/course-videos" />
            <Route element={<Tests />} path="/tests" />
            <Route path="/tests/:testType/:topicId" element={<TestTopics />} />
            <Route path="/tests/testHistory" element={<FullTestHistory />} />
            <Route
              path="/testresult/:testName/:history_id"
              element={<TestResult />}
            />
            <Route element={<Assignments />} path="/assignments" />
            <Route
              path="/assignments/:assignment_id"
              element={<ParticularAssignments />}
            />
            <Route
              element={<CompanyQuestionsTab />}
              path="/company-questions"
            />
            <Route
              element={<CompanyDocuments />}
              path="/company-questions/:company_id"
            />
            <Route element={<Bookmarks />} path="/bookmarks" />
            <Route element={<Profile />} path="/profile" />
            <Route element={<Jobs />} path="/jobs" />
            <Route element={<DriveDetails />} path="/jobs/:job_id" />
            <Route element={<Students />} path="/students" />
            <Route element={<Navigate to={"/dashboard"} />} path="*" />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
