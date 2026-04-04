import React, { useEffect, useState } from "react";
import { Row, Col, Tabs, Spin, Empty, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import BuildingImage from "../../assets/building.png";
import {
  FiUser,
  FiCalendar,
  FiBriefcase,
  FiBook,
  FiCheck,
  FiDownload,
} from "react-icons/fi";
import { PiMapPin, PiWallet } from "react-icons/pi";
import { LuBookOpen, LuClock4 } from "react-icons/lu";
import { IoTransgenderSharp, IoCodeSharp } from "react-icons/io5";
import { AiOutlinePercentage } from "react-icons/ai";
import { MdBlockFlipped } from "react-icons/md";
import { FaFilePdf } from "react-icons/fa";
import { getJobById } from "../ApiService/action";
import dayjs from "dayjs";
import "./styles.css";

export default function DriveDetails() {
  const { job_id } = useParams();
  const id = job_id; // Keep id variable name for internal logic
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      console.log("DriveDetails: Fetching job with ID:", id);
      setLoading(true);
      try {
        const response = await getJobById(id);
        console.log("DriveDetails: API Response:", response.data);
        if (response.data && response.data.data) {
          setJob(response.data.data);
        } else {
          message.error("Job not found");
        }
      } catch (error) {
        console.error("DriveDetails: Error fetching job details:", error);
        message.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchJob();
    } else {
      console.warn("DriveDetails: No ID provided in URL params");
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <Spin size="small" />
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <Empty description="No job details found" />
      </div>
    );
  }

  const formatList = (data) => {
    if (!data) return "Not specified";
    if (Array.isArray(data)) return data.join(", ");
    return data;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div>
      <Row>
        <Col xs={12} sm={12} md={12} lg={12}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <IoArrowBackOutline
              size={30}
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/jobs")}
            />
            <p className="common_heading">Job Details</p>
          </div>
        </Col>
      </Row>

      <div className="drive_title_container">
        <img src={BuildingImage} className="job_cards_image" alt="company" />
        <p className="drive_main_title">{job.job_id || "Job Drive"}</p>
      </div>

      <Tabs
        className="companyquestions_tabs"
        defaultActiveKey={"1"}
        items={[
          {
            label: "Drive Details",
            key: "1",
            children: (
              <div>
                <div className="drive_content_header_container">
                  Job Criteria
                </div>

                <Row className="drive_content_row_container">
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <FiUser
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Looking for</p>
                      <p className="drive_content_section_title">
                        {job.looking_for || "N/A"}
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <PiMapPin
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Location</p>
                      <p className="drive_content_section_title">
                        {formatList(job.location)}
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <PiMapPin
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Service Agreement</p>
                      <p style={{ fontWeight: 500, color: "#667085" }}>
                        {job.service_agreement || "N/A"}
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <PiWallet
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Salary</p>
                      <p className="drive_content_section_title">
                        {job.salary || "N/A"}
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <LuBookOpen
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Qualification</p>
                      <p className="drive_content_section_title">
                        {formatList(job.qualification)}
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <FiCalendar
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Year of Passing</p>
                      <p className="drive_content_section_title">
                        {job.year_of_passing
                          ?.map((y) => y.year)
                          .sort()
                          .join(", ") || "N/A"}
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <FiBriefcase
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Interview Rounds</p>
                      <div className="drive_content_section_title">
                        {job.interview_rounds &&
                        job.interview_rounds.length > 0 ? (
                          <ol style={{ margin: "0px", padding: "8px 12px" }}>
                            {job.interview_rounds.map((round, idx) => (
                              <li key={idx}>{round.round_name}</li>
                            ))}
                          </ol>
                        ) : (
                          "N/A"
                        )}
                      </div>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <FiCalendar
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Interview Date</p>
                      <p className="drive_content_section_title">
                        {job.interview_date
                          ? `${dayjs(job.interview_date).format("DD-MM-YYYY")} ( ${job.interview_mode || ""} )`
                          : "N/A"}
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <LuClock4
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Shift</p>
                      <p className="drive_content_section_title">
                        {job.shift || "N/A"}
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <FiBook
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Streams</p>
                      <p className="drive_content_section_title">
                        {job.streams?.map((s) => s.stream_name).join(", ") ||
                          "N/A"}
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <IoTransgenderSharp
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Gender Preference</p>
                      <p className="drive_content_section_title">
                        {job.gender_preference || "N/A"}
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <AiOutlinePercentage
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>
                        Min Required Percentage
                      </p>
                      <p className="drive_content_section_title">
                        {job.min_required_percentage
                          ?.map((p) => `${p.education_level} : ${p.percentage}`)
                          .join(" ") || "N/A"}
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={6}
                    className="drive_content_col_container"
                  >
                    <IoCodeSharp
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Skills Required</p>
                      <div className="drive_content_skills_div">
                        <ul style={{ padding: "0px", margin: "4px 0px" }}>
                          {job.skills_required?.map((s, idx) => (
                            <li key={idx}>{s.skill_name}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <MdBlockFlipped
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Blocking Period</p>
                      <p className="drive_content_section_title">
                        {job.blocking_period || "N/A"}
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={6}
                    className="drive_content_col_container"
                  >
                    <IoCodeSharp
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Other Criterias</p>
                      <div className="drive_content_other_criterias_div">
                        <ul style={{ padding: "0px", margin: "4px 0px" }}>
                          {job.other_criterias?.map((c, idx) => (
                            <li key={idx}>
                              {c.criteria_name}{" "}
                              {c.is_allowed && (
                                <FiCheck
                                  size={16}
                                  color="#111929"
                                  style={{ flexShrink: 0 }}
                                />
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Col>
                </Row>

                <div
                  className="drive_content_header_container"
                  style={{ marginTop: "24px" }}
                >
                  Notes
                </div>
                <div className="drive_content_row_container">
                  <div
                    style={{
                      color: "#344054",
                      fontWeight: 500,
                      whiteSpace: "pre-wrap",
                      fontSize: "15px",
                      lineHeight: "1.6",
                    }}
                  >
                    {job.notes || "No additional notes provided."}
                  </div>
                </div>

                <div
                  className="drive_content_header_container"
                  style={{ marginTop: "24px" }}
                >
                  Job Description
                </div>
                <div className="drive_content_row_container">
                  <div className="attachment_box">
                    <div className="pdf_icon_container">
                      <FaFilePdf className="pdf_icon" />
                    </div>
                    <div className="attachment_info">
                      <p className="attachment_name">{job?.job_id ?? ""}</p>
                      <p className="attachment_size">
                        {formatFileSize(job.file_size)}
                      </p>
                    </div>
                    <div
                      className="download_icon_btn"
                      onClick={() => {
                        const fileUrl = job.file_path;
                        if (fileUrl) {
                          // Handle relative paths if necessary
                          const fullUrl = fileUrl.startsWith("http")
                            ? fileUrl
                            : `${import.meta.env.VITE_API_URL || ""}${fileUrl}`;
                          window.open(fullUrl, "_blank");
                        } else {
                          message.info("Attachment not available");
                        }
                      }}
                    >
                      <FiDownload />
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
