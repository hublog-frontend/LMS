import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import CommonInputField from "../Common/CommonInputField";
import { Row, Col, Spin, Empty } from "antd";
import BuildingImage from "../../assets/building.png";
import { FiUser, FiEdit } from "react-icons/fi";
import { PiMapPin, PiWallet } from "react-icons/pi";
import { LuBookOpen } from "react-icons/lu";
import { getJobs } from "../ApiService/action";
import { Tooltip } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "./styles.css";

dayjs.extend(relativeTime);

export default function TechnicalDrive({ category, onEdit }) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchJobs = async (searchQuery = "", controller) => {
    setLoading(true);
    try {
      const response = await getJobs({ category, search: searchQuery });
      if (!controller || !controller.signal.aborted) {
        if (response.data && response.data.data) {
          setJobs(response.data.data);
        }
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching jobs:", error);
      }
    } finally {
      if (!controller || !controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    // Immediate fetch for category change or initial mount
    const delayDebounceFn = setTimeout(
      () => {
        fetchJobs(search, controller);
      },
      search ? 500 : 0,
    );

    return () => {
      controller.abort();
      clearTimeout(delayDebounceFn);
    };
  }, [category, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const getTimeAgo = (date) => {
    if (!date) return "Recently posted";
    return dayjs(date).fromNow();
  };

  const isJobClosed = (expiresAt) => {
    if (!expiresAt) return false;
    return dayjs(expiresAt).isBefore(dayjs());
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={12} lg={6}>
          <CommonInputField
            placeholder="Search"
            prefix={<CiSearch size={16} />}
            value={search}
            onChange={handleSearch}
          />
        </Col>
      </Row>

      {loading ? (
        <div style={{ padding: "50px", textAlign: "center" }}>
          <Spin size="large" />
        </div>
      ) : jobs.length > 0 ? (
        <Row
          gutter={[
            { xs: 24, sm: 24, md: 24, lg: 24 },
            { xs: 24, sm: 24, md: 24, lg: 24 },
          ]}
          style={{ marginTop: "20px" }}
        >
          {jobs.map((job, index) => (
            <Col
              key={job.id || `job-${index}`}
              xs={24}
              sm={24}
              md={12}
              lg={8}
              style={{ display: "flex" }}
            >
              <div className="jobs_cards">
                <div className="jobs_cards_header">
                  <img src={BuildingImage} className="job_cards_image" />
                  <div style={{ flexGrow: 1 }}>
                    <p className="job_cards_title">{job.job_id || "No ID"}</p>
                    <p className="job_cards_timing_text">
                      {getTimeAgo(job.created_at)}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "8px",
                    }}
                  >
                    <div
                      className="job_cards_closed_tag_container"
                      style={{ position: "static" }}
                    >
                      <div
                        className="job_cards_closed_tag_dot_div"
                        style={{
                          backgroundColor: isJobClosed(job.expires_at)
                            ? "#f04438"
                            : "#12b76a",
                        }}
                      />
                      {isJobClosed(job.expires_at) ? "Closed" : "Active"}
                    </div>

                    <Tooltip title="Edit Job">
                      <FiEdit
                        className="edit_job_icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(job);
                        }}
                      />
                    </Tooltip>
                  </div>
                </div>

                <div className="jobs_cards_details_main_container">
                  <div className="jobs_cards_details_container">
                    <FiUser size={25} />
                    <div>
                      <p style={{ fontSize: "12px" }}>Looking for</p>
                      <p style={{ fontWeight: 500 }}>
                        {job.looking_for || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="jobs_cards_details_container">
                    <PiMapPin size={25} />
                    <div>
                      <p style={{ fontSize: "12px" }}>Location</p>
                      <p style={{ fontWeight: 500 }}>
                        {Array.isArray(job.location)
                          ? job.location.join(", ")
                          : job.location || "Multiple Locations"}
                      </p>
                    </div>
                  </div>

                  <div className="jobs_cards_details_container">
                    <PiWallet size={25} />
                    <div>
                      <p style={{ fontSize: "12px" }}>Salary</p>
                      <p style={{ fontWeight: 500 }}>
                        {job.salary || "As per norms"}
                      </p>
                    </div>
                  </div>

                  <div className="jobs_cards_details_container">
                    <LuBookOpen size={25} />
                    <div>
                      <p style={{ fontSize: "12px" }}>Qualification</p>
                      <p style={{ fontWeight: 500 }}>
                        {Array.isArray(job.qualification)
                          ? job.qualification.join(", ")
                          : job.qualification || "Any Degree"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="jobs_cards_button_container">
                  <button
                    className="jobs_cards_apply_button"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    Apply
                  </button>
                  <button
                    className="jobs_cards_knowmore_button"
                    onClick={() => {
                      navigate(`/jobs/${job.id}`);
                    }}
                  >
                    Know More
                  </button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <div style={{ padding: "50px", textAlign: "center" }}>
          <Empty description={`No jobs found in ${category}`} />
        </div>
      )}
    </div>
  );
}
