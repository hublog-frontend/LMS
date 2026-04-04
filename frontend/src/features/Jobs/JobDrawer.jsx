import React, { useEffect, useState } from "react";
import {
  Drawer,
  Button,
  Row,
  Col,
  message,
  Spin,
  Select,
  Tooltip,
  Input,
  Checkbox,
  Upload,
} from "antd";
import { FiUploadCloud, FiPlus, FiTrash2, FiCheck } from "react-icons/fi";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import CommonTextArea from "../Common/CommonTextArea";
import { createJob, updateJob } from "../ApiService/MultipartApi";
import { getStreams, getCompanySkills, getJobById } from "../ApiService/action";
import dayjs from "dayjs";
import CommonAntdMultiSelect from "../Common/CommonAntMultiSelect";
import CommonDatePicker from "../Common/CommonDatePicker";
import CommonSpinner from "../Common/CommonSpinner";
import { formatToBackendIST } from "../Common/Validation";

export default function JobDrawer({ visible, onClose, jobData, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [streams, setStreams] = useState([]);
  const [skills, setSkills] = useState([]);
  const [fileList, setFileList] = useState([]);

  const [formData, setFormData] = useState({
    job_id: "",
    looking_for: "",
    location: [],
    service_agreement: "",
    salary: "",
    qualification: [],
    year_of_passing: [],
    interview_rounds: [{ round_number: 1, round_name: "" }],
    interview_date: null,
    interview_mode: "Online",
    shift: "",
    streams: [],
    gender_preference: "Both",
    min_required_percentage: [
      { education_level: "SSLC", percentage: "" },
      { education_level: "PUC/Diploma", percentage: "" },
      { education_level: "Degree", percentage: "" },
    ],
    skills_required: [],
    blocking_period: "",
    other_criterias: [
      { criteria_name: "Gap In Education", is_allowed: false },
      { criteria_name: "Relocation", is_allowed: false },
      { criteria_name: "Certificate Submission", is_allowed: false },
    ],
    notes: "",
    expires_at: null,
    job_category: "Technical drives",
  });

  useEffect(() => {
    setLoading(false);
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [streamsRes, skillsRes] = await Promise.all([
        getStreams(),
        getCompanySkills(),
      ]);
      setStreams(streamsRes.data.data || []);
      setSkills(skillsRes.data.result || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (jobData?.id && visible) {
        setLoading(true);
        try {
          const response = await getJobById(jobData.id);
          const fullData = response.data.data;
          setFormData({
            ...fullData,
            location: Array.isArray(fullData.location)
              ? fullData.location
              : fullData.location?.split(", ") || [],
            qualification: Array.isArray(fullData.qualification)
              ? fullData.qualification
              : fullData.qualification?.split(", ") || [],
            year_of_passing:
              fullData.year_of_passing?.map((y) => String(y.year)) || [],
            interview_date: fullData.interview_date
              ? dayjs(fullData.interview_date)
              : null,
            expires_at: fullData.expires_at ? dayjs(fullData.expires_at) : null,
            streams: fullData.streams?.map((s) => s.stream_name) || [],
            skills_required:
              fullData.skills_required?.map((s) => s.skill_name) || [],
            min_required_percentage: fullData.min_required_percentage || [
              { education_level: "SSLC", percentage: "" },
              { education_level: "PUC/Diploma", percentage: "" },
              { education_level: "Degree", percentage: "" },
            ],
            other_criterias: fullData.other_criterias || [
              { criteria_name: "Gap In Education", is_allowed: false },
              { criteria_name: "Relocation", is_allowed: false },
              { criteria_name: "Certificate Submission", is_allowed: false },
            ],
            interview_rounds: fullData.interview_rounds || [
              { round_number: 1, round_name: "" },
            ],
          });
          if (fullData.file_name) {
            setFileList([
              {
                name: fullData.original_name || fullData.file_name,
                status: "done",
                url: fullData.file_path,
              },
            ]);
          } else {
            setFileList([]);
          }
        } catch (error) {
          console.error("JobDrawer: Error fetching job details:", error);
          if (error.response) {
            console.error(
              "JobDrawer: Server responded with:",
              error.response.data,
            );
          }
          message.error("Failed to load full job details");
        } finally {
          setLoading(false);
        }
      } else if (!jobData && visible) {
        setFormData({
          job_id: "",
          looking_for: "",
          location: [],
          service_agreement: "",
          salary: "",
          qualification: [],
          year_of_passing: [],
          interview_rounds: [{ round_number: 1, round_name: "" }],
          interview_date: null,
          interview_mode: "Online",
          shift: "",
          streams: [],
          gender_preference: "Both",
          min_required_percentage: [
            { education_level: "SSLC", percentage: "" },
            { education_level: "PUC/Diploma", percentage: "" },
            { education_level: "Degree", percentage: "" },
          ],
          skills_required: [],
          blocking_period: "",
          other_criterias: [
            { criteria_name: "Gap In Education", is_allowed: false },
            { criteria_name: "Relocation", is_allowed: false },
            { criteria_name: "Certificate Submission", is_allowed: false },
          ],
          notes: "",
          expires_at: null,
          job_category: "Technical drives",
        });
        setFileList([]);
      }
    };

    fetchData();
  }, [jobData, visible]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoundChange = (index, value) => {
    const newRounds = [...formData.interview_rounds];
    newRounds[index].round_name = value;
    setFormData((prev) => ({ ...prev, interview_rounds: newRounds }));
  };

  const addRound = () => {
    setFormData((prev) => ({
      ...prev,
      interview_rounds: [
        ...prev.interview_rounds,
        { round_number: prev.interview_rounds.length + 1, round_name: "" },
      ],
    }));
  };

  const removeRound = (index) => {
    const newRounds = formData.interview_rounds
      .filter((_, i) => i !== index)
      .map((r, i) => ({ ...r, round_number: i + 1 }));
    setFormData((prev) => ({ ...prev, interview_rounds: newRounds }));
  };

  const handlePercentageChange = (index, value) => {
    const newPerc = [...formData.min_required_percentage];
    newPerc[index].percentage = value;
    setFormData((prev) => ({ ...prev, min_required_percentage: newPerc }));
  };

  const handleCriteriaChange = (index, checked) => {
    const newCriteria = [...formData.other_criterias];
    newCriteria[index].is_allowed = checked;
    setFormData((prev) => ({ ...prev, other_criterias: newCriteria }));
  };

  const handleSubmit = async () => {
    if (!formData.job_id || !formData.looking_for) {
      return message.warning("Please fill required fields (Job ID, Role)");
    }

    setLoading(true);
    const form = new FormData();

    // Process form data for multipart
    Object.keys(formData).forEach((key) => {
      if (key === "interview_date" || key === "expires_at") {
        if (formData[key])
          form.append(key, dayjs(formData[key]).format("YYYY-MM-DD"));
      } else if (Array.isArray(formData[key])) {
        form.append(key, JSON.stringify(formData[key]));
      } else if (key === "created_at") {
        // Skip it here, we will append it correctly below to avoid nulls
      } else {
        form.append(key, formData[key]);
      }
    });

    // Ensure created_at is never null as per DB constraints
    const createdAtValue = formatToBackendIST(new Date());
    form.append("created_at", createdAtValue);

    if (fileList.length > 0 && fileList[0].originFileObj) {
      form.append("job_description", fileList[0].originFileObj);
    }

    console.log(formData, "formData");
    // return;
    try {
      if (jobData?.id) {
        await updateJob(jobData.id, form);
        message.success("Job updated successfully");
      } else {
        await createJob(form);
        message.success("Job created successfully");
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error submitting job:", error);
      message.error(error.response?.data?.message || "Failed to save job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={jobData ? "Update Placement Drive" : "Post New Job"}
      placement="right"
      size={"50%"}
      onClose={onClose}
      open={visible}
      className="courses_createcourses_drawer questions-drawer"
    >
      <div>
        <div className="job_form_container questions-drawer-body">
          {/* Section 1: Core Identification */}
          <div className="form_section_card">
            <p className="form_section_heading">Basic Drive Information</p>
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <CommonInputField
                  label="Job ID / Code"
                  placeholder="e.g. LMS-JOB-2024-001"
                  value={formData.job_id}
                  onChange={(e) => handleChange("job_id", e.target.value)}
                  required
                />
              </Col>
              <Col span={12}>
                <CommonSelectField
                  label="Drive Category"
                  options={[
                    { id: "Technical drives", name: "Technical drives" },
                    {
                      id: "Non-technical drives",
                      name: "Non-technical drives",
                    },
                    { id: "Internal drives", name: "Internal drives" },
                  ]}
                  value={formData.job_category}
                  onChange={(e) => handleChange("job_category", e.target.value)}
                  className="custom_antd_select"
                />
              </Col>
              <Col span={24}>
                <CommonInputField
                  label="Looking for (Role Title)"
                  placeholder="e.g. Senior Frontend Developer (React)"
                  value={formData.looking_for}
                  onChange={(e) => handleChange("looking_for", e.target.value)}
                  required
                />
              </Col>
            </Row>
          </div>

          {/* Section 2: Financials & Location */}
          <div className="form_section_card">
            <h4 className="form_section_heading">Package & Logistics</h4>
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <CommonInputField
                  label="Offered Salary / CTC"
                  placeholder="e.g. 8 - 12 LPA"
                  value={formData.salary}
                  onChange={(e) => handleChange("salary", e.target.value)}
                />
              </Col>
              <Col span={12}>
                <CommonInputField
                  label="Service Agreement (Bond)"
                  placeholder="e.g. 2 Years"
                  value={formData.service_agreement}
                  onChange={(e) =>
                    handleChange("service_agreement", e.target.value)
                  }
                />
              </Col>
              <Col span={12}>
                <CommonAntdMultiSelect
                  label="Target Locations"
                  freeSolo
                  value={formData.location}
                  options={[
                    "Work From Home",
                    "Bengaluru",
                    "Hyderabad",
                    "Noida",
                    "Pune",
                    "Chennai",
                  ].map((l) => ({ id: l, name: l }))}
                  onChange={(value) => handleChange("location", value)}
                />
              </Col>
              <Col span={12}>
                <CommonInputField
                  label="Shift / Timings"
                  placeholder="e.g. Day Shift (9 AM - 6 PM)"
                  value={formData.shift}
                  onChange={(e) => handleChange("shift", e.target.value)}
                />
              </Col>
            </Row>
          </div>

          {/* Section 3: Academic Qualifications */}
          <div className="form_section_card">
            <h4 className="form_section_heading">
              Academic & Eligibility Criteria
            </h4>
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <CommonAntdMultiSelect
                  label="Eligible Qualifications"
                  freeSolo
                  value={formData.qualification}
                  options={[
                    "BE",
                    "B.Tech",
                    "MCA",
                    "M.Tech",
                    "B.Sc",
                    "M.Sc",
                    "BCA",
                  ].map((q) => ({ id: q, name: q }))}
                  onChange={(value) => handleChange("qualification", value)}
                />
              </Col>
              <Col span={12}>
                <CommonAntdMultiSelect
                  label="Batch (Year of Passing)"
                  freeSolo
                  value={formData.year_of_passing}
                  options={["2025", "2024", "2023", "2022", "2021"].map(
                    (y) => ({ id: y, name: y }),
                  )}
                  onChange={(value) => handleChange("year_of_passing", value)}
                />
              </Col>
              <Col span={12}>
                <CommonSelectField
                  label="Gender Preference"
                  options={[
                    { id: "Both", name: "No Preference (Open to All)" },
                    { id: "Male", name: "Male Candidates Only" },
                    { id: "Female", name: "Female Candidates Only" },
                  ]}
                  value={formData.gender_preference}
                  onChange={(e) =>
                    handleChange("gender_preference", e.target.value)
                  }
                  className="custom_antd_select"
                />
              </Col>
            </Row>

            <div
              className="percentage_grid_box"
              style={{
                marginTop: 24,
                background: "#f9fafb",
                borderRadius: "16px",
              }}
            >
              <p
                className="sub_inner_label"
                style={{ color: "#101828", fontSize: "14px" }}
              >
                Minimum Aggregate Required (%)
              </p>
              <Row gutter={16}>
                {formData.min_required_percentage.map((item, index) => (
                  <Col span={8} key={item.education_level}>
                    <div className="percentage_input_wrapper">
                      <span
                        className="perc_level"
                        style={{ fontWeight: "600" }}
                      >
                        {item.education_level}
                      </span>
                      <Input
                        type="number"
                        suffix={<span style={{ color: "#98A2B3" }}>%</span>}
                        placeholder="0"
                        value={item.percentage}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #D0D5DD",
                        }}
                        onChange={(e) =>
                          handlePercentageChange(index, e.target.value)
                        }
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </div>

            <div style={{ marginTop: 24 }}>
              <p
                className="sub_inner_label"
                style={{
                  color: "#101828",
                  fontSize: "14px",
                }}
              >
                Candidate Eligibility Requirements
              </p>
              <div
                className="criteria_check_group"
                style={{ marginTop: "12px" }}
              >
                {formData.other_criterias.map((item, index) => (
                  <div
                    key={`criteria-${item.criteria_name || index}`}
                    className={`criteria_pill ${item.is_allowed ? "checked" : ""}`}
                    onClick={() =>
                      handleCriteriaChange(index, !item.is_allowed)
                    }
                    style={{
                      padding: "10px 18px",
                      fontSize: "13px",
                      boxShadow: item.is_allowed
                        ? "0 2px 8px rgba(33, 96, 173, 0.15)"
                        : "none",
                    }}
                  >
                    {item.is_allowed ? (
                      <FiCheck
                        size={16}
                        color="#2160ad"
                        style={{ flexShrink: 0 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          border: "1.5px solid #D0D5DD",
                          borderRadius: "4px",
                        }}
                      />
                    )}
                    <span style={{ marginLeft: "4px" }}>
                      {item.criteria_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Skills & Streams */}
          <div className="form_section_card">
            <h4 className="form_section_heading">Technical Skills & Streams</h4>
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <CommonAntdMultiSelect
                  label="Relevant Streams"
                  value={formData.streams}
                  options={streams.map((s) => ({
                    id: s.stream_name,
                    name: s.stream_name,
                  }))}
                  onChange={(value) => handleChange("streams", value)}
                />
              </Col>
              <Col span={12}>
                <CommonAntdMultiSelect
                  label="Mandatory Skills"
                  value={formData.skills_required}
                  options={skills.map((s) => ({
                    id: s.name,
                    name: s.name,
                  }))}
                  onChange={(value) => handleChange("skills_required", value)}
                />
              </Col>
              <Col span={24}>
                <CommonInputField
                  label="Blocking Period (After Selection)"
                  placeholder="e.g. 6 Months (Cannot apply to other companies)"
                  value={formData.blocking_period}
                  onChange={(e) =>
                    handleChange("blocking_period", e.target.value)
                  }
                />
              </Col>
            </Row>
          </div>

          {/* Section 5: Process Timeline */}
          <div className="form_section_card">
            <h4 className="form_section_heading">
              Interview Process & Timeline
            </h4>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <CommonSelectField
                  label="Primary Interview Mode"
                  options={[
                    { id: "Online", name: "Virtual / Online" },
                    { id: "Offline", name: "Physical / On-site" },
                    { id: "Hybrid", name: "Hybrid Approach" },
                  ]}
                  onChange={(e) =>
                    handleChange("interview_mode", e.target.value)
                  }
                  value={formData.interview_mode}
                />
              </Col>
              <Col span={12}>
                <CommonDatePicker
                  label="Interviews Start From"
                  onChange={(value) => handleChange("interview_date", value)}
                  value={formData.interview_date}
                  allowClear={true}
                />
              </Col>
              <Col span={12}>
                <CommonDatePicker
                  label="Apply Before (Expiry Date)"
                  onChange={(value) => handleChange("expires_at", value)}
                  value={formData.expires_at}
                  allowClear={true}
                  disable_future_dates={false}
                />
              </Col>
            </Row>

            <div className="interview_rounds_manager" style={{ marginTop: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <p className="sub_inner_label" style={{ marginBottom: 0 }}>
                  Step-by-Step Interview Rounds
                </p>
                <Button
                  type="link"
                  onClick={addRound}
                  icon={<FiPlus />}
                  className="add_round_btn"
                >
                  Add Next Round
                </Button>
              </div>

              <div className="rounds_list">
                {formData.interview_rounds.map((round, index) => (
                  <div key={index} className="round_input_row">
                    <div className="round_badge">R{index + 1}</div>
                    <Input
                      placeholder={`Enter name of round ${index + 1}`}
                      value={round.round_name}
                      onChange={(e) => handleRoundChange(index, e.target.value)}
                      className="round_name_input"
                    />
                    {formData.interview_rounds.length > 1 && (
                      <Tooltip title="Remove Round">
                        <Button
                          type="text"
                          danger
                          icon={<FiTrash2 />}
                          onClick={() => removeRound(index)}
                        />
                      </Tooltip>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 6: Additional Information */}
          <div className="form_section_card">
            <h4 className="form_section_heading">
              Final Details & Documentation
            </h4>
            <div style={{ marginBottom: 24 }}>
              <CommonTextArea
                label="Internal/External Notes"
                placeholder="Enter special instructions, perks, or any other details..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                height={100}
              />
            </div>

            <div className="upload_section_box">
              <p className="sub_inner_label">
                Job Description / Company Profile
              </p>
              <Upload
                accept=".pdf"
                listType="picture"
                fileList={fileList}
                beforeUpload={(file) => {
                  const isPdf = file.type === "application/pdf";
                  if (!isPdf) {
                    message.error("You can only upload PDF files!");
                  }
                  return false; // Prevent auto-upload
                }}
                onChange={({ fileList }) => {
                  // Filter out non-pdf files just in case
                  const formattedList = fileList.filter((file) => {
                    if (file.type && file.type !== "application/pdf") {
                      return false;
                    }
                    return true;
                  });
                  setFileList(formattedList);
                }}
                maxCount={1}
              >
                <div className="upload_trigger_area">
                  <div className="upload_icon_circle">
                    <FiUploadCloud size={24} color="#2160ad" />
                  </div>
                  <div className="upload_text_content">
                    <p className="main_upload_text">
                      Click or drag to upload document
                    </p>
                    <p className="sub_upload_text">
                      Only PDF files are supported (Max 10MB)
                    </p>
                  </div>
                </div>
              </Upload>
            </div>
          </div>
          <div style={{ height: 40 }}></div>
        </div>

        {/* footer */}
        <div className="courses_createcourses_drawer_footer">
          <div className="courses_createcourses_drawer_submit_buttoncontainer">
            {loading ? (
              <button className="jobs_create_drawer_submit_button_loading">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="jobs_create_drawer_submit_button"
                onClick={handleSubmit}
              >
                {jobData ? "Update & Save Changes" : "Create & Post Drive"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
