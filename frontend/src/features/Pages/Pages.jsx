import React, { useState, useEffect } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { Layout, Drawer, Button, Grid, Divider } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import ActeLogo from "../../assets/acte-logo.png";
import Login from "../Login/Login";
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
      path.startsWith("/test-attempt")
    );
  };

  useEffect(() => {
    //handle navigate to login page when token expire
    const handleTokenExpire = () => {
      localStorage.clear();
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
    const converAsJson = JSON.parse(getloginUserDetails);
    setUserName(converAsJson?.user_name);
    setUserEmail(converAsJson?.email);

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

  if (isPublicRoute(location.pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/test-attempt/:testName/:testId"
          element={<TestAttempt />}
        />
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
            transition: "all 0.3s ease-in-out",
            overflowX: "hidden",
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
                          navigate("/login");
                          localStorage.clear();
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
          transition: "all 0.3s ease-in-out",
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
            <Route element={<Courses />} path="/courses" />
            <Route element={<Questions />} path="/questions" />
            <Route element={<CourseVideos />} path="/course-videos" />
            <Route element={<Tests />} path="/tests" />
            <Route path="/tests/:testType/:topicId" element={<TestTopics />} />
            <Route path="/testresult" element={<TestResult />} />
            <Route element={<Assignments />} path="/assignments" />
            <Route
              path="/assignments/:testType/:id"
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
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
