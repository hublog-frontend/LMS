import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import CommonInputField from "../Common/CommonInputField";
import { Row, Col, Spin, Empty, Popover, Radio, Select, Skeleton } from "antd";
import { IoFilter } from "react-icons/io5";
import { FiFilter } from "react-icons/fi";
import BuildingImage from "../../assets/building.png";
import { FiUser, FiEdit } from "react-icons/fi";
import { PiMapPin, PiWallet } from "react-icons/pi";
import { LuBookOpen } from "react-icons/lu";
import { getJobs } from "../ApiService/action";
import { Tooltip } from "antd";
import { isAdmin } from "../Common/Validation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "./styles.css";

dayjs.extend(relativeTime);

export default function TechnicalDrive({ category, onEdit }) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    driveType: "all",
    qualification: null,
    location: null,
    yearOfPassing: null,
  });

  const isJobClosed = (expiresAt) => {
    if (!expiresAt) return false;
    return dayjs(expiresAt).isBefore(dayjs());
  };

  const fetchJobs = async (
    searchQuery = "",
    currentFilters = filters,
    controller,
  ) => {
    setLoading(true);
    try {
      const payload = {
        category,
        search: searchQuery,
        drive_type:
          currentFilters.driveType !== "all"
            ? currentFilters.driveType
            : undefined,
        qualification: currentFilters.qualification,
        location: currentFilters.location,
        year_of_passing: currentFilters.yearOfPassing,
      };
      const response = await getJobs(payload);
      if (!controller || !controller.signal.aborted) {
        if (response.data && response.data.data) {
          let jobsList = response.data.data || [];

          // Frontend-side dynamic filtering for Drive Type (Active/Closed)
          if (currentFilters.driveType === "active") {
            jobsList = jobsList.filter((j) => !isJobClosed(j.expires_at));
          } else if (currentFilters.driveType === "closed") {
            jobsList = jobsList.filter((j) => isJobClosed(j.expires_at));
          }

          setJobs(jobsList);
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
        fetchJobs(search, filters, controller);
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

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchJobs(search, newFilters);
  };

  const getTimeAgo = (date) => {
    if (!date) return "Recently posted";
    return dayjs(date).fromNow();
  };


  const SkeletonCard = () => (
    <div className="jobs_cards skeleton-card">
      <div className="jobs_cards_header">
        <Skeleton.Avatar active size={48} shape="square" />
        <div style={{ flexGrow: 1, marginLeft: "12px" }}>
          <Skeleton active paragraph={{ rows: 1 }} title={false} />
        </div>
        <Skeleton.Button active size="small" style={{ width: 60 }} />
      </div>
      <div className="jobs_cards_details_main_container">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="jobs_cards_details_container"
            style={{ width: "50%" }}
          >
            <Skeleton.Avatar active size={24} shape="circle" />
            <div style={{ marginLeft: "8px", flexGrow: 1 }}>
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            </div>
          </div>
        ))}
      </div>
      <div
        className="jobs_cards_button_container"
        style={{ marginTop: "16px" }}
      >
        <Skeleton.Button active block />
      </div>
    </div>
  );

  return (
    <div>
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col xs={24} sm={16} md={12} lg={8}>
          <CommonInputField
            placeholder="Search"
            prefix={<CiSearch size={16} />}
            value={search}
            onChange={handleSearch}
          />
        </Col>
        <Col>
          <Popover
            placement="bottomRight"
            trigger="click"
            content={
              <div className="filter-popover-content">
                <div className="filter-section">
                  <p className="filter-section-title">Drive Type</p>
                  <Radio.Group
                    onChange={(e) =>
                      handleFilterChange("driveType", e.target.value)
                    }
                    value={filters.driveType}
                    className="filter-radio-group"
                  >
                    <Radio value="all">All</Radio>
                    <Radio value="active">Active</Radio>
                    <Radio value="closed">Closed</Radio>
                  </Radio.Group>
                </div>

                <div className="filter-section">
                  <p className="filter-section-title">Qualification</p>
                  <Select
                    placeholder="Qualification"
                    className="filter-select"
                    allowClear
                    onChange={(val) => handleFilterChange("qualification", val)}
                    value={filters.qualification}
                    options={[
                      "BE",
                      "B.Tech",
                      "MCA",
                      "M.Tech",
                      "B.Sc",
                      "M.Sc",
                      "BCA",
                    ].map((q) => ({
                      label: q,
                      value: q,
                    }))}
                  />
                </div>

                <div className="filter-section">
                  <p className="filter-section-title">Location</p>
                  <Select
                    placeholder="Drives Location"
                    className="filter-select"
                    allowClear
                    onChange={(val) => handleFilterChange("location", val)}
                    value={filters.location}
                    options={[
                      "Work From Home",
                      "Bengaluru",
                      "Hyderabad",
                      "Noida",
                      "Pune",
                      "Chennai",
                    ].map((l) => ({ label: l, value: l }))}
                  />
                </div>

                <div className="filter-section">
                  <p className="filter-section-title">Year Of Passing</p>
                  <Select
                    placeholder="Year Of Passing"
                    className="filter-select"
                    allowClear
                    onChange={(val) => handleFilterChange("yearOfPassing", val)}
                    value={filters.yearOfPassing}
                    options={["2025", "2024", "2023", "2022", "2021"].map(
                      (y) => ({
                        label: y,
                        value: y,
                      }),
                    )}
                  />
                </div>
              </div>
            }
          >
            <button className="filter-btn">
              <IoFilter size={24} /> Filters
            </button>
          </Popover>
        </Col>
      </Row>

      {loading ? (
        <Row gutter={[24, 24]} style={{ marginTop: "20px" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Col key={i} xs={24} sm={12} md={12} lg={8}>
              <SkeletonCard />
            </Col>
          ))}
        </Row>
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

                    {isAdmin() && (
                      <Tooltip title="Edit Job">
                        <FiEdit
                          className="edit_job_icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(job);
                          }}
                        />
                      </Tooltip>
                    )}
                  </div>
                </div>

                <div className="jobs_cards_details_main_container">
                  <div className="jobs_cards_details_container">
                    <FiUser size={25} style={{ flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: "12px" }}>Looking for</p>
                      <p style={{ fontWeight: 500 }}>
                        {job.looking_for || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="jobs_cards_details_container">
                    <PiMapPin size={25} style={{ flexShrink: 0 }} />
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
                    <PiWallet size={25} style={{ flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: "12px" }}>Salary</p>
                      <p style={{ fontWeight: 500 }}>
                        {job.salary || "As per norms"}
                      </p>
                    </div>
                  </div>

                  <div className="jobs_cards_details_container">
                    <LuBookOpen size={25} style={{ flexShrink: 0 }} />
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
