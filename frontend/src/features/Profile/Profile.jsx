import React, { useState, useEffect } from "react";
import { Row, Col, Progress } from "antd";
import ProfileCoverImage from "../../assets/profile_cover.jpeg";
import "./styles.css";
import { Tabs } from "antd";
import PersonalInfo from "./PersonalInfo";
import Experience from "./Experience";
import Projects from "./Projects";
import Certificates from "./Certificates";
import Education from "./Education";
import { getUserById, getUserProgress } from "../ApiService/action";
import { Dropdown, Menu, Space, Modal, Button, Pagination } from "antd";
import { pdf } from "@react-pdf/renderer";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ClassicResume,
  ModernResume,
  MinimalistResume,
} from "./ResumeTemplates";
import {
  AiOutlineFilePdf,
  AiOutlineDownload,
  AiOutlineClose,
  AiOutlineZoomIn,
  AiOutlineZoomOut,
} from "react-icons/ai";
import { LuEye } from "react-icons/lu";
import { CommonMessage } from "../Common/CommonMessage";
import { isAdmin } from "../Common/Validation";

export default function Profile() {
  const [userFulldetails, setUserFullDetails] = useState(null);
  const [userName, setUserName] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedResumeType, setSelectedResumeType] = useState(null);
  const [resumePreviewComponent, setResumePreviewComponent] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const [progressData, setProgressData] = useState({
    courseProgress: 0,
    assignmentProgress: 0,
  });

  useEffect(() => {
    getUserByIdData();
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    if (converAsJson?.id) {
      try {
        const response = await getUserProgress(converAsJson.id);
        setProgressData(
          response?.data?.data || { courseProgress: 0, assignmentProgress: 0 },
        );
      } catch (error) {
        console.error("Error fetching progress:", error);
      }
    }
  };

  const getUserByIdData = async () => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log("getloginUserDetails", converAsJson);
    setUserName(converAsJson?.user_name);

    try {
      const response = await getUserById(converAsJson?.id);
      console.log("get userby id response", response);
      setUserFullDetails(response?.data?.data || null);
    } catch (error) {
      setUserFullDetails(null);
      console.log("get user by id error", error);
    }
  };

  const handleResumePreview = async (type) => {
    if (!userFulldetails) return;

    const hasActeCertificate = userFulldetails.certificates?.some((cert) =>
      cert.issuing_organization?.toLowerCase().includes("acte technologies"),
    );

    if (!hasActeCertificate) {
      CommonMessage(
        "error",
        "Please add at least one certificate issued by ACTE Technologies before generating your resume.",
      );
      return;
    }

    let ResumeComponent;
    switch (type) {
      case "Classic":
        ResumeComponent = <ClassicResume data={userFulldetails} />;
        break;
      case "Modern":
        ResumeComponent = <ModernResume data={userFulldetails} />;
        break;
      case "Minimalist":
        ResumeComponent = <MinimalistResume data={userFulldetails} />;
        break;
      default:
        ResumeComponent = <ClassicResume data={userFulldetails} />;
    }

    setResumePreviewComponent(ResumeComponent);
    setSelectedResumeType(type);
    setPageNumber(1);
    setScale(1.0);

    try {
      const blob = await pdf(ResumeComponent).toBlob();
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error("Error creating preview URL:", error);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const downloadSelectedResume = async () => {
    if (!previewBlobUrl) return;

    const fileName = `Resume_${userName.replace(/\s+/g, "_")}_${selectedResumeType}.pdf`;
    const link = document.createElement("a");
    link.href = previewBlobUrl;
    link.download = fileName;
    link.click();
  };

  const resumeMenuItems = [
    {
      key: "Classic",
      label: "Classic ATS",
      icon: <AiOutlineFilePdf />,
      onClick: () => handleResumePreview("Classic"),
    },
    {
      key: "Modern",
      label: "Modern Professional",
      icon: <AiOutlineFilePdf />,
      onClick: () => handleResumePreview("Modern"),
    },
    {
      key: "Minimalist",
      label: "Executive Minimalist",
      icon: <AiOutlineFilePdf />,
      onClick: () => handleResumePreview("Minimalist"),
    },
  ];

  return (
    <div>
      <Row className="questions_header_row">
        <Col xs={12} sm={12} md={12} lg={12}>
          <p className="common_heading questions_heading_margin">Profile</p>
        </Col>

        <Col
          xs={12}
          sm={12}
          md={12}
          lg={12}
          className="courses_createmodule_button_container"
        >
          {/* <div className="questions_create_button_col_inner"> */}
          <Dropdown
            menu={{ items: resumeMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <button className="courses_createcourse_button">
              <Space>
                Generate Resume
                <AiOutlineDownload size={18} />
              </Space>
            </button>
          </Dropdown>
          {/* </div> */}
        </Col>
      </Row>
      <Row gutter={28} style={{ marginTop: "30px" }}>
        <Col xs={24} sm={24} md={24} lg={9}>
          <div className="profile_leftcontainer">
            <div className="profile_left_header_container">
              <img src={ProfileCoverImage} className="profile_cover_image" />
            </div>

            <div className="profile_avatar_container">
              <div className="profilepage_avatar">
                <h6 className="profilepage_avatar_name_first_letter">
                  {userName.charAt(0)}
                </h6>
              </div>
              <p className="profilepage_name_text">{userName}</p>
              <div className="profilepage_studenttag">
                <p>{isAdmin() ? "Admin" : "Student"}</p>
              </div>
            </div>

            <div className="profilepage_progress_container">
              <div className="profilepage_progress_sub_container">
                <Progress
                  type="circle"
                  percent={progressData.courseProgress}
                  size={65}
                />
                <p className="profilepage_progress_text">Course Progress</p>
              </div>

              <div className="profilepage_progress_sub_container">
                <Progress
                  type="circle"
                  percent={progressData.assignmentProgress}
                  size={65}
                />
                <p className="profilepage_progress_text">Assignment Progress</p>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={15}>
          <div className="profilepage_right_container">
            <p className="profilepage_profilesetting_heading">
              Profile Setting
            </p>

            <Tabs
              className="profilepage_tabs"
              defaultActiveKey="1"
              items={[
                {
                  label: "Personal Info",
                  key: "1",
                  children: (
                    <PersonalInfo
                      userFulldetails={userFulldetails}
                      setUserFullDetails={setUserFullDetails}
                    />
                  ),
                },
                {
                  label: "Experiences",
                  key: "2",
                  children: (
                    <Experience
                      userFulldetails={userFulldetails}
                      setUserFullDetails={setUserFullDetails}
                    />
                  ),
                },
                {
                  label: "Education",
                  key: "3",
                  children: (
                    <Education
                      userFulldetails={userFulldetails}
                      setUserFullDetails={setUserFullDetails}
                    />
                  ),
                },
                {
                  label: "Projects",
                  key: "4",
                  children: (
                    <Projects
                      userFulldetails={userFulldetails}
                      setUserFullDetails={setUserFullDetails}
                    />
                  ),
                },
                {
                  label: "Certifications",
                  key: "5",
                  children: (
                    <Certificates
                      userFulldetails={userFulldetails}
                      setUserFullDetails={setUserFullDetails}
                    />
                  ),
                },
              ]}
            />
          </div>
        </Col>
      </Row>

      {/* Premium Resume Preview Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "12px",
              borderBottom: "1px solid #f0f0f0",
              marginRight: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AiOutlineFilePdf size={24} color="#2160ad" />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#1a1a1a",
                  }}
                >
                  {selectedResumeType} Resume Preview
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "400",
                    color: "#8c8c8c",
                  }}
                >
                  ATS-Friendly Professional Layout
                </span>
              </div>
            </div>
          </div>
        }
        open={isPreviewModalOpen}
        onCancel={() => setIsPreviewModalOpen(false)}
        width={"75%"}
        centered
        footer={null}
        style={{ top: 20 }}
        styles={{
          body: {
            height: "85vh",
            padding: "0",
            background: "#f0f2f5",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        }}
        // closeIcon={
        //   <div className="modal_close_btn_circle">
        //     <AiOutlineClose size={18} />
        //   </div>
        // }
      >
        {/* Document Tools */}
        <div
          style={{
            background: "#fff",
            padding: "10px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button
              icon={<AiOutlineZoomOut />}
              onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
              disabled={scale <= 0.5}
            />
            <span
              style={{
                minWidth: "50px",
                textAlign: "center",
                fontSize: "12px",
              }}
            >
              {Math.round(scale * 100)}%
            </span>
            <Button
              icon={<AiOutlineZoomIn />}
              onClick={() => setScale((prev) => Math.min(2.0, prev + 0.1))}
              disabled={scale >= 2.0}
            />
          </div>

          {numPages > 1 && (
            <Pagination
              simple
              current={pageNumber}
              total={numPages * 10}
              onChange={(page) => setPageNumber(page)}
              style={{ fontSize: "12px" }}
            />
          )}
        </div>

        <div
          style={{
            flex: 1,
            padding: "40px",
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
            background: "#525659", // Standard PDF viewer background color
          }}
        >
          {previewBlobUrl && (
            <div style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}>
              <Document
                file={previewBlobUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div style={{ color: "#fff" }}>Loading Preview...</div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  loading=""
                />
              </Document>
            </div>
          )}
        </div>

        {/* Floating / Bottom Action Bar */}
        <div
          style={{
            padding: "16px 30px",
            background: "#fff",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ color: "#666", fontSize: "13px" }}>
            Professional 1-Page Summary
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Button onClick={() => setIsPreviewModalOpen(false)} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={downloadSelectedResume}
              icon={<AiOutlineDownload />}
              size="large"
              className="courses_createcourse_button"
              style={{ height: "auto", display: "flex", alignItems: "center" }}
            >
              Download PDF
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
