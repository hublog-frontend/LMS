import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Drawer,
  Button,
  Tag,
  Space,
  Card,
  Descriptions,
  Divider,
  Avatar,
  Skeleton,
  Empty,
  Modal,
  Pagination,
  Tooltip,
  Row,
  Col,
} from "antd";
import {
  FiEye,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiBriefcase,
  FiAward,
  FiBook,
  FiDownload,
  FiFileText,
  FiCheck,
} from "react-icons/fi";
import {
  AiOutlineFilePdf,
  AiOutlineDownload,
  AiOutlineZoomIn,
  AiOutlineZoomOut,
} from "react-icons/ai";
import { pdf } from "@react-pdf/renderer";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ClassicResume,
  ModernResume,
  MinimalistResume,
} from "../Profile/ResumeTemplates";
import {
  addUser,
  getAllUsers,
  getBranches,
  getRegion,
  getUserById,
} from "../ApiService/action";
import CommonTable from "../Common/CommonTable";
import { CommonMessage } from "../Common/CommonMessage";
import "./Students.css";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import {
  emailValidator,
  isAdmin,
  nameValidator,
  selectValidator,
} from "../Common/Validation";
import CommonInputField from "../Common/CommonInputField";
import CommonSpinner from "../Common/CommonSpinner";
import CommonSelectField from "../Common/CommonSelectField";
import { IoMdInformationCircleOutline } from "react-icons/io";

// Use CDN worker for maximum compatibility
const PDF_WORKER_URL = `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

const Students = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Resume Preview State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedResumeType, setSelectedResumeType] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  //drawer
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [regionData, setRegionData] = useState([]);
  const [regionId, setRegionId] = useState("");
  const [regionIdError, setRegionIdError] = useState("");
  const [branchesData, setBranchesData] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [branchIdError, setBranchIdError] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isCrmChecked, setIsCrmChecked] = useState(false);
  const [crmLoading, setCrmLoading] = useState(false);

  useEffect(() => {
    getRegionData();
  }, []);

  const getRegionData = async () => {
    try {
      const response = await getRegion();
      console.log("region response", response);
      setRegionData(response?.data?.data || []);
    } catch (error) {
      setRegionData([]);
      console.log("get region error", error);
    } finally {
      fetchUsers();
    }
  };

  const fetchUsers = async (
    page = pagination.page,
    limit = pagination.limit,
  ) => {
    setLoading(true);
    try {
      const response = await getAllUsers({ page, limit });
      if (response.data?.success || response.status === 200) {
        const data = response.data.data;
        setUsers(data.users || []);
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = (pageConfig) => {
    fetchUsers(pageConfig.page, pageConfig.limit);
  };

  const handleViewDetails = async (record) => {
    setDrawerVisible(true);
    setDetailsLoading(true);
    try {
      const response = await getUserById(record.id);
      if (response.data?.success || response.status === 200) {
        setSelectedUser(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleResumePreview = async (type, userData = selectedUser) => {
    if (!userData) return;

    // Check for ACTE Technologies certificate
    const hasActeCertificate = userData.certificates?.some((cert) =>
      cert.issuing_organization?.toLowerCase().includes("acte technologies"),
    );

    if (!hasActeCertificate) {
      CommonMessage(
        "error",
        "Student must have at least one certificate issued by ACTE Technologies before generating or viewing their resume.",
      );
      return;
    }

    let ResumeComponent;
    switch (type) {
      case "Classic":
        ResumeComponent = <ClassicResume data={userData} />;
        break;
      case "Modern":
        ResumeComponent = <ModernResume data={userData} />;
        break;
      case "Minimalist":
        ResumeComponent = <MinimalistResume data={userData} />;
        break;
      default:
        ResumeComponent = <ClassicResume data={userData} />;
    }

    setIsPreviewModalOpen(true);
    setSelectedResumeType(type);
    setPageNumber(1);
    setScale(1.0);

    try {
      const blob = await pdf(ResumeComponent).toBlob();
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    } catch (error) {
      console.error("Error creating preview URL:", error);
    }
  };

  const handleUploadedResumePreview = (base64String) => {
    if (!base64String) return;

    // const hasActeCertificate = selectedUser?.certificates?.some((cert) =>
    //   cert.issuing_organization?.toLowerCase().includes("acte technologies"),
    // );

    // if (!hasActeCertificate) {
    //   CommonMessage(
    //     "error",
    //     "Student must have at least one certificate issued by ACTE Technologies before generating or viewing their resume.",
    //   );
    //   return;
    // }

    let mimeType = "application/pdf";
    if (base64String.startsWith("UEsDB")) {
      mimeType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    try {
      const byteCharacters = atob(base64String.split(",")[1] || base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const url = URL.createObjectURL(blob);

      if (mimeType === "application/pdf") {
        setPreviewBlobUrl(url);
        setSelectedResumeType("Uploaded");
        setPageNumber(1);
        setScale(1.0);
        setIsPreviewModalOpen(true);
      } else {
        // For docx, just download
        const link = document.createElement("a");
        link.href = url;
        link.download = "Resume.docx";
        link.click();
      }
    } catch (e) {
      console.error("Error handling uploaded resume:", e);
    }
  };

  const downloadResume = () => {
    if (!previewBlobUrl) return;
    const link = document.createElement("a");
    link.href = previewBlobUrl;
    link.download = `Resume_${selectedUser?.user_name || "Student"}_${selectedResumeType}.pdf`;
    link.click();
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "user_name",
      key: "user_name",
      render: (text, record) => (
        // <Space>

        //   <span style={{ fontWeight: 500, color: "#101828" }}>{text}</span>
        // </Space>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <Avatar src={record.profile_image} icon={<FiUser />} />
          <EllipsisTooltip text={text} />
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => (
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <FiMail size={14} style={{ color: "#667085", flexShrink: 0 }} />
          <EllipsisTooltip text={text} />
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (text, record) => (
        <Space>
          <FiPhone style={{ color: "#667085" }} />
          <span>
            {record.phone_code ? `${record.phone_code} ` : ""}
            {text ? text : "-"}
          </span>
        </Space>
      ),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Joined",
      dataIndex: "created_date",
      key: "created_date",
      render: (date) => (
        <Space>
          <FiCalendar style={{ color: "#667085" }} />
          <span>{date ? new Date(date).toLocaleDateString() : "-"}</span>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (active) => (
        <Tag
          color={active ? "success" : "error"}
          style={{ borderRadius: "12px" }}
        >
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          type="text"
          icon={<FiEye size={18} style={{ color: "#5b69ca" }} />}
          onClick={() => handleViewDetails(record)}
          className="view-details-btn"
        />
      ),
    },
  ];

  const renderSection = (title, icon, content) => (
    <div className="detail-section">
      <div className="section-header">
        {icon}
        <h3>{title}</h3>
      </div>
      <div className="section-content">{content}</div>
      <Divider />
    </div>
  );

  const getBranchesData = async (region_id) => {
    try {
      const response = await getBranches(region_id);
      console.log("branhes response", response);
      setBranchesData(response?.data?.data || []);
    } catch (error) {
      setBranchesData([]);
      console.log("get region error", error);
    }
  };

  const handleSubmit = async () => {
    const nameValidate = nameValidator(name);
    const emailValidate = emailValidator(email);
    const regionIdValidate = selectValidator(regionId);
    const branchIdValidate = selectValidator(branchId);

    setNameError(nameValidate);
    setEmailError(emailValidate);
    setRegionIdError(regionIdValidate);
    setBranchIdError(branchIdValidate);

    if (nameValidate || emailValidate || regionIdValidate || branchIdValidate)
      return;

    if (!isCrmChecked) {
      CommonMessage(
        "error",
        "Please check the email register in CRM before submitting.",
      );
      return;
    }

    setButtonLoading(true);
    const payload = {
      branch_id: branchId,
      user_name: name,
      email: email,
    };

    try {
      const response = await addUser(payload);
      if (response.status === 201 || response.data?.success) {
        CommonMessage("success", "User added successfully!");
        setIsOpenAddDrawer(false);
        formReset();
        fetchUsers(1, pagination.limit);
      }
    } catch (error) {
      CommonMessage(
        "error",
        error.response?.data?.message || "Error while adding user",
      );
      console.log(error);
    } finally {
      setButtonLoading(false);
    }
  };

  const formReset = () => {
    setIsOpenAddDrawer(false);
    setIsCrmChecked(false);
    setCrmLoading(false);
    setName("");
    setEmail("");
    setRegionId("");
    setBranchId("");
    setNameError("");
    setEmailError("");
    setRegionIdError("");
    setBranchIdError("");
  };

  const checkRegisteredInCrm = async () => {
    const emailValidate = emailValidator(email);
    if (emailValidate) {
      setEmailError(emailValidate);
      return;
    }

    setCrmLoading(true);
    const token = localStorage.getItem("AccessToken");

    const payload = {
      email: email,
      page: 1,
      limit: 10,
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_CRM_API_URL}/api/getCustomersV1`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log(res.data);
      const customer = res.data?.data?.[0];
      if (customer) {
        CommonMessage("success", "Candidate found in CRM!");
        setName(customer.user_name || customer.name || "");
        setIsCrmChecked(true);
      } else {
        CommonMessage("error", "Candidate is not registered in CRM.");
        setIsCrmChecked(false);
      }
    } catch (err) {
      console.error(err);
      CommonMessage("error", "Error checking CRM details.");
      setIsCrmChecked(false);
    } finally {
      setCrmLoading(false);
    }
  };

  return (
    <div className="students-page-container">
      {/* <div className="students-header">
        <div>
          <p className="common_heading">Students</p>
          <p className="page-subtitle">
            Manage and view all registered students details
          </p>
        </div>
      </div> */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p className="common_heading" style={{ margin: 0 }}>
            Students
          </p>
          <p className="page-subtitle">
            Manage and view all registered students details
          </p>
        </div>

        <div>
          {isAdmin() && (
            <button
              className="courses_createcourse_button"
              onClick={() => {
                setIsOpenAddDrawer(true);
              }}
            >
              Add User
            </button>
          )}
        </div>
      </div>
      <div className="questions_table_container">
        <CommonTable
          columns={columns}
          dataSource={users.map((u) => ({ ...u, key: u.id }))}
          size={"small"}
          loading={loading}
          totalPageNumber={pagination.total}
          page_number={pagination.page}
          limit={pagination.limit}
          onPaginationChange={handlePaginationChange}
          checkBox="false"
        />
      </div>

      <Drawer
        title={null}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
        closable={true}
        className="user-details-drawer"
      >
        {detailsLoading ? (
          <div style={{ padding: "24px" }}>
            <Skeleton avatar active paragraph={{ rows: 4 }} />
            <Skeleton active paragraph={{ rows: 4 }} />
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ) : selectedUser ? (
          <div className="drawer-content">
            <div className="user-profile-header">
              <Avatar
                size={100}
                src={selectedUser.profile_image}
                icon={<FiUser />}
                className="user-avatar"
              />
              <div className="user-header-info">
                <h2>{selectedUser.user_name}</h2>
                <Tag color={selectedUser.is_active ? "success" : "error"}>
                  {selectedUser.is_active ? "Active" : "Inactive"}
                </Tag>
                <p className="user-summary">
                  {selectedUser.summary || "No summary provided."}
                </p>
              </div>
            </div>

            <Divider />

            {renderSection(
              "Personal Info",
              <FiUser />,
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Email">
                  <EllipsisTooltip text={selectedUser.email} />
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {selectedUser.phone_code ? `${selectedUser.phone_code} ` : ""}
                  {selectedUser.phone ? selectedUser.phone : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="WhatsApp">
                  {selectedUser.whatsapp_code
                    ? `${selectedUser.whatsapp_code} `
                    : ""}
                  {selectedUser.whatsapp_number || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Gender">
                  {selectedUser.gender || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="DOB">
                  {selectedUser.dob
                    ? new Date(selectedUser.dob).toLocaleDateString()
                    : "N/A"}
                </Descriptions.Item>
                {/* <Descriptions.Item label="Enrolled Mode">
                  {selectedUser.enrolled_mode || "N/A"}
                </Descriptions.Item> */}
              </Descriptions>,
            )}

            {renderSection(
              "Address & Location",
              <FiMapPin />,
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Current City">
                  {selectedUser.current_city || "N/A"},{" "}
                  {selectedUser.current_state || ""}
                </Descriptions.Item>
                <Descriptions.Item label="Native City">
                  {selectedUser.native_city || "N/A"},{" "}
                  {selectedUser.native_state || ""}
                </Descriptions.Item>
                <Descriptions.Item label="Permanent Address">
                  {selectedUser.permanent_address || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Pincode">
                  {selectedUser.pincode || "N/A"}
                </Descriptions.Item>
              </Descriptions>,
            )}

            {renderSection(
              "Education",
              <FiBook />,
              selectedUser.education?.length > 0 ? (
                selectedUser.education.map((edu, index) => (
                  <div key={index} className="detail-item">
                    <h4 style={{ margin: "4px 0" }}>{edu.college_name}</h4>
                    <p
                      style={{
                        color: "#667085",
                        fontSize: "12px",
                        margin: "2px 0",
                      }}
                    >
                      {edu.education} | {edu.branch} | Passed: {edu.passed_year}
                    </p>
                    <p style={{ fontWeight: 500 }}>
                      {edu.percentage}%{edu.is_pg ? " (PG)" : ""}
                    </p>
                  </div>
                ))
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No Education Data"
                />
              ),
            )}

            {renderSection(
              "Experience",
              <FiBriefcase />,
              selectedUser.experience?.length > 0 ? (
                selectedUser.experience.map((exp, index) => (
                  <div key={index} className="detail-item">
                    <h4 style={{ margin: "4px 0" }}>{exp.job_title}</h4>
                    <p
                      style={{
                        color: "#667085",
                        fontSize: "12px",
                        margin: "2px 0",
                      }}
                    >
                      {exp.company_name} | {exp.location}
                    </p>
                    <p style={{ fontSize: "12px" }}>
                      {exp.start_month} {exp.start_year} -{" "}
                      {exp.is_present_company
                        ? "Present"
                        : `${exp.end_month} ${exp.end_year}`}
                    </p>
                  </div>
                ))
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No Experience Data"
                />
              ),
            )}

            {renderSection(
              "Skills",
              <FiAward />,
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {selectedUser.skills?.length > 0
                  ? selectedUser.skills.map((skill, index) => (
                      <Tag
                        key={index}
                        color="blue"
                        style={{ borderRadius: "4px" }}
                      >
                        {skill}
                      </Tag>
                    ))
                  : "No skills added"}
              </div>,
            )}

            {renderSection(
              "Certificates",
              <FiAward />,
              selectedUser.certificates?.length > 0 ? (
                selectedUser.certificates.map((cert, index) => (
                  <div key={index} className="detail-item">
                    <h4 style={{ margin: "4px 0" }}>{cert.title}</h4>
                    <p
                      style={{
                        color: "#667085",
                        fontSize: "12px",
                        margin: "2px 0",
                      }}
                    >
                      {cert.issuing_organization} | Issued: {cert.issued_year}
                    </p>
                    {cert.description && (
                      <p style={{ fontSize: "12px", marginTop: "4px" }}>
                        {cert.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No Certificates Data"
                />
              ),
            )}

            {renderSection(
              "Resume",
              <FiFileText />,
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {selectedUser.resume && (
                  <Button
                    icon={<FiDownload />}
                    onClick={() =>
                      handleUploadedResumePreview(selectedUser.resume)
                    }
                    className="resume-action-btn uploaded-resume"
                  >
                    View Uploaded
                  </Button>
                )}
                <Button
                  icon={<FiEye />}
                  onClick={() => handleResumePreview("Classic")}
                  className="resume-action-btn"
                >
                  Classic (Generated)
                </Button>
                <Button
                  icon={<FiEye />}
                  onClick={() => handleResumePreview("Modern")}
                  className="resume-action-btn"
                >
                  Modern (Generated)
                </Button>
                <Button
                  icon={<FiEye />}
                  onClick={() => handleResumePreview("Minimalist")}
                  className="resume-action-btn"
                >
                  Executive (Generated)
                </Button>
              </div>,
            )}
          </div>
        ) : (
          <Empty description="No user details found" />
        )}
      </Drawer>

      <Modal
        title={
          <div className="resume-modal-header">
            <AiOutlineFilePdf size={24} color="#2160ad" />
            <div className="resume-modal-header-info">
              <span className="resume-modal-title">
                {selectedResumeType} Resume Preview
              </span>
              <span className="resume-modal-subtitle">
                Professional ATS-Friendly Layout
              </span>
            </div>
          </div>
        }
        open={isPreviewModalOpen}
        onCancel={() => setIsPreviewModalOpen(false)}
        width={"75%"}
        centered
        footer={null}
        style={{ top: 20 }}
        className="premium-resume-modal"
      >
        <div className="resume-preview-tools">
          <div className="zoom-controls">
            <Button
              icon={<AiOutlineZoomOut />}
              onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
              disabled={scale <= 0.5}
            />
            <span className="zoom-level">{Math.round(scale * 100)}%</span>
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
            />
          )}
        </div>

        <div className="resume-preview-container">
          {previewBlobUrl && (
            <div className="resume-document-shadow">
              <Document
                file={previewBlobUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<div className="loading-text">Loading Preview...</div>}
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

        <div className="resume-modal-footer">
          <span className="footer-info">Professional Summary Preview</span>
          <div className="footer-actions">
            <Button onClick={() => setIsPreviewModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              onClick={downloadResume}
              icon={<AiOutlineDownload />}
              className="download-btn"
            >
              Download PDF
            </Button>
          </div>
        </div>
      </Modal>

      {/* create question drawer */}
      <Drawer
        title={isEdit ? "Edit User" : "Add User"}
        onClose={formReset}
        open={isOpenAddDrawer}
        size={"40%"}
        className="courses_createcourses_drawer questions-drawer"
      >
        <div className="questions-drawer-body">
          <div className="questions-drawer-field">
            <CommonInputField
              label={"Name"}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(nameValidator(e.target.value));
              }}
              value={name}
              error={nameError}
            />
          </div>

          <div className="questions-drawer-field-mt">
            <div className="questions-drawer-field">
              <Row gutter={12}>
                <Col span={22}>
                  <CommonInputField
                    label={"Email"}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(emailValidator(e.target.value));
                      setIsCrmChecked(false);
                    }}
                    value={email}
                    error={emailError}
                  />
                </Col>
                <Col span={2} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ marginTop: "30px" }}>
                    <Tooltip
                      title={
                        isCrmChecked
                          ? "Candidate verified in CRM"
                          : "Click to check the email register in CRM"
                      }
                    >
                      {crmLoading ? (
                        <CommonSpinner />
                      ) : isCrmChecked ? (
                        <FiCheck
                          size={20}
                          style={{
                            color: "#52c41a",
                          }}
                        />
                      ) : (
                        <IoMdInformationCircleOutline
                          size={20}
                          style={{
                            cursor: "pointer",
                            color: "#2160ad",
                          }}
                          onClick={checkRegisteredInCrm}
                        />
                      )}
                    </Tooltip>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          <div className="questions-drawer-field-mt">
            <div className="questions-drawer-field">
              <CommonSelectField
                label={"Region"}
                options={regionData}
                onChange={(e) => {
                  setRegionId(e.target.value);
                  setRegionIdError(selectValidator(e.target.value));
                  getBranchesData(e.target.value);
                }}
                value={regionId}
                error={regionIdError}
              />
            </div>
          </div>

          <div className="questions-drawer-field-mt">
            <div className="questions-drawer-field">
              <CommonSelectField
                label={"Branch"}
                options={branchesData}
                onChange={(e) => {
                  setBranchId(e.target.value);
                  setBranchIdError(selectValidator(e.target.value));
                }}
                value={branchId}
                error={branchIdError}
              />
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="courses_createcourses_drawer_footer">
          <div className="courses_createcourses_drawer_submit_buttoncontainer">
            {buttonLoading ? (
              <button className="courses_createcourses_drawer_loadingsubmitbutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="courses_createcourses_drawer_submitbutton"
                onClick={handleSubmit}
              >
                {isEdit ? "Update" : "Submit"}
              </button>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default Students;
