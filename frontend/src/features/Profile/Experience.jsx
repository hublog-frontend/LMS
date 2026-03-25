import React, { useState, useEffect } from "react";
import { Row, Col, Tooltip, Button } from "antd";
import CommonInputField from "../Common/CommonInputField";
import "./styles.css";
import { Checkbox } from "antd";
import CommonNodataFound from "../Common/CommonNoDataFound";
import {
  addressValidator,
  formatToBackendIST,
  monthValidator,
  selectValidator,
  yearValidator,
} from "../Common/Validation";
import {
  deleteExperience,
  getUserById,
  updateExperience,
} from "../ApiService/action";
import CommonTextArea from "../Common/CommonTextArea";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import BuildingImage from "../../assets/building.png";
import { AiOutlineDelete } from "react-icons/ai";
import { Divider } from "antd";
import { IoMdAdd } from "react-icons/io";
import { Popconfirm } from "antd";

export default function Experience({ userFulldetails, setUserFullDetails }) {
  const [experienceData, setExperienceData] = useState([]);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyNameError, setCompanyNameError] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobTitleError, setJobTitleError] = useState("");
  const [totalExperience, setTotalExperience] = useState("0");
  const [location, setLocation] = useState("");
  const [locationError, setLocationError] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [startMonthError, setStartMonthError] = useState("");
  const [startYear, setStartYear] = useState("");
  const [startYearError, setStartYearError] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endMonthError, setEndMonthError] = useState("");
  const [endYear, setEndYear] = useState("");
  const [endYearError, setEndYearError] = useState("");
  const [present, setPresent] = useState(false);
  const [responsibility, setResponsibility] = useState("");
  const [responsibilityError, setResponsibilityError] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(false);

  useEffect(() => {
    setExperienceData(userFulldetails?.experience || []);
  }, [userFulldetails]);

  const getUserByIdData = async (user_id) => {
    try {
      const response = await getUserById(user_id);
      console.log("get userby id response", response);
      setUserFullDetails(response?.data?.data || []);
      setExperienceData(response?.data?.data?.experience || []);
    } catch (error) {
      setExperienceData([]);
      console.log("get user by id error", error);
    }
  };

  const handleSubmit = async () => {
    setValidationTrigger(true);
    const companyNameValidate = addressValidator(companyName);
    const jobTitleValidate = addressValidator(jobTitle);
    const locationValidate = addressValidator(location);
    const startMonthValidate = monthValidator(startMonth);
    const startYearValidate = yearValidator(startYear);
    const endMonthValidate = present ? "" : monthValidator(endMonth);
    const endYearValidate = present ? "" : yearValidator(endYear);
    const responsibilityValidate = addressValidator(responsibility);

    setCompanyNameError(companyNameValidate);
    setJobTitleError(jobTitleValidate);
    setLocationError(locationValidate);
    setStartMonthError(startMonthValidate);
    setStartYearError(startYearValidate);
    setEndMonthError(endMonthValidate);
    setEndYearError(endYearValidate);
    setResponsibilityError(responsibilityValidate);

    if (
      companyNameValidate ||
      jobTitleValidate ||
      locationValidate ||
      startMonthValidate ||
      startYearValidate ||
      endMonthValidate ||
      endYearValidate ||
      responsibilityValidate
    )
      return;

    setButtonLoading(true);
    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    const payload = {
      user_id: converAsJson?.id,
      company_name: companyName,
      job_title: jobTitle,
      year_of_experience: totalExperience,
      location: location,
      start_month: startMonth,
      start_year: startYear,
      end_month: endMonth,
      end_year: endYear,
      is_present: present,
      responsibility: responsibility,
      created_date: formatToBackendIST(today),
    };

    try {
      await updateExperience(payload);
      setTimeout(() => {
        CommonMessage("success", "Experience Added");
        formReset();
        getUserByIdData(converAsJson?.id);
      }, 300);
    } catch (error) {
      console.log("error", error);
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleDelete = async (id) => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    try {
      await deleteExperience(id);
      setTimeout(() => {
        CommonMessage("success", "Experience Deleted");
        getUserByIdData(converAsJson?.id);
      }, 300);
    } catch (error) {
      console.log("error", error);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const formReset = () => {
    setButtonLoading(false);
    setIsOpenForm(false);
    setValidationTrigger(false);
    setCompanyName("");
    setCompanyNameError("");
    setJobTitle("");
    setJobTitleError("");
    setTotalExperience("0");
    setLocation("");
    setLocationError("");
    setStartMonth("");
    setStartMonthError("");
    setStartYear("");
    setStartYearError("");
    setEndMonth("");
    setEndMonthError("");
    setEndYear("");
    setEndYearError("");
    setPresent(false);
    setResponsibility("");
    setResponsibilityError("");
  };

  return (
    <div
      className="profilepage_personalinfo_main_container"
      style={{ padding: 0 }}
    >
      {isOpenForm ? (
        <div style={{ padding: 24 }}>
          <Row gutter={16} style={{ marginTop: "0px" }}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={12}
              style={{ marginBottom: "20px" }}
            >
              <CommonInputField
                required={true}
                label="Company Name"
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (validationTrigger) {
                    setCompanyNameError(addressValidator(e.target.value));
                  }
                }}
                value={companyName}
                error={companyNameError}
              />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={12}
              style={{ marginBottom: "20px" }}
            >
              <CommonInputField
                required={true}
                label="Job Title"
                onChange={(e) => {
                  setJobTitle(e.target.value);
                  if (validationTrigger) {
                    setJobTitleError(addressValidator(e.target.value));
                  }
                }}
                value={jobTitle}
                error={jobTitleError}
              />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={12}
              style={{ marginBottom: "20px" }}
            >
              <CommonInputField
                required={true}
                label="Years of Experience"
                type="number"
                onChange={(e) => {
                  setTotalExperience(e.target.value);
                }}
                value={totalExperience}
                error={""}
                onFocus={(e) => e.target.select()}
              />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={12}
              style={{ marginBottom: "20px" }}
            >
              <CommonInputField
                required={true}
                label="Location"
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (validationTrigger) {
                    setLocationError(addressValidator(e.target.value));
                  }
                }}
                value={location}
                error={locationError}
              />
            </Col>
          </Row>

          <p className="profilepage_experience_startandenddate_heading">
            Start Date
          </p>

          <Row gutter={16}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={12}
              style={{ marginBottom: "20px" }}
            >
              <CommonInputField
                required={true}
                label="Month (MM)"
                type="number"
                onChange={(e) => {
                  setStartMonth(e.target.value);
                  if (validationTrigger) {
                    setStartMonthError(monthValidator(e.target.value));
                  }
                }}
                value={startMonth}
                error={startMonthError}
              />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={12}
              style={{ marginBottom: "20px" }}
            >
              <CommonInputField
                required={true}
                label="Year (YYYY)"
                type="number"
                onChange={(e) => {
                  setStartYear(e.target.value);
                  if (validationTrigger) {
                    setStartYearError(yearValidator(e.target.value));
                  }
                }}
                value={startYear}
                error={startYearError}
              />
            </Col>
          </Row>

          <p className="profilepage_experience_startandenddate_heading">
            End Date
          </p>

          <Row gutter={16}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={12}
              style={{ marginBottom: "20px" }}
            >
              <CommonInputField
                required={true}
                label="Month (MM)"
                type="number"
                onChange={(e) => {
                  setEndMonth(e.target.value);
                  if (validationTrigger) {
                    setEndMonthError(monthValidator(e.target.value));
                  }
                }}
                value={endMonth}
                error={endMonthError}
                disabled={present}
              />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={12}
              style={{ marginBottom: "20px" }}
            >
              <CommonInputField
                required={true}
                label="Year (YYYY)"
                type="number"
                onChange={(e) => {
                  setEndYear(e.target.value);
                  if (validationTrigger) {
                    setEndYearError(yearValidator(e.target.value));
                  }
                }}
                value={endYear}
                error={endYearError}
                disabled={present}
              />
            </Col>
          </Row>

          <Row style={{ marginBottom: "10px" }}>
            <Col span={12}></Col>
            <Col span={12}>
              <div style={{ marginLeft: "12px" }}>
                <Checkbox
                  onChange={(e) => {
                    setPresent(e.target.checked);
                    if (e.target.checked == true) {
                      setEndMonth("");
                      setEndMonthError("");
                      setEndYear("");
                      setEndYearError("");
                    }
                  }}
                  value={present}
                >
                  Present
                </Checkbox>
              </div>
            </Col>
          </Row>

          <Row style={{ marginBottom: "30px" }}>
            <Col span={24}>
              <CommonTextArea
                required={true}
                label="Responsibility"
                onChange={(e) => {
                  setResponsibility(e.target.value);
                  if (validationTrigger) {
                    setResponsibilityError(addressValidator(e.target.value));
                  }
                }}
                value={responsibility}
                error={responsibilityError}
              />
            </Col>
          </Row>

          <div className="profilepages_personalinfo_button_container">
            <button
              className="coursereviews_rating_modal_btn coursereviews_rating_modal_cancelbutton"
              style={{ width: "max-content" }}
              onClick={formReset}
            >
              Cancel
            </button>
            {buttonLoading ? (
              <button
                style={{ width: "70px" }}
                className="coursereviews_rating_modal_btn coursereviews_rating_modal_loading_submitbutton"
              >
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="coursereviews_rating_modal_btn coursereviews_rating_modal_submitbutton"
                style={{ width: "max-content" }}
                onClick={handleSubmit}
              >
                Add
              </button>
            )}
          </div>
        </div>
      ) : experienceData.length >= 1 ? (
        <>
          {experienceData.map((item, index) => {
            return (
              <React.Fragment>
                <div style={{ width: "100%", padding: 24 }}>
                  <div className="profilepage_experience_card">
                    {/* -------left div------------ */}
                    <div className="profilepage_experience_card_name_container">
                      <div className="profilepage_experience_card_image_container">
                        <img
                          src={BuildingImage}
                          className="profilepage_experience_card_image"
                        />
                      </div>
                      <div className="profilepage_experience_details_div">
                        <p className="profilepage_experience_designation">
                          {item.job_title}
                        </p>
                        <p className="profilepage_experience_company_name">
                          {item.company_name}
                        </p>
                        <div className="profilepage_experience_location_div">
                          <p className="profilepage_experience_location_details">
                            Location: {item.location} |
                          </p>
                          <p className="profilepage_experience_location_details">
                            Years of Experience: {item.years_of_experience} |
                          </p>
                          <p className="profilepage_experience_location_details">
                            Duration: {`${item.start_month}/${item.start_year}`}{" "}
                            -{" "}
                            {item.is_present_company == 1
                              ? "Present"
                              : `${item.end_month}/${item.end_year}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* -------right div------------ */}
                    <div>
                      <Popconfirm
                        title="Are you sure you want to delete?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => {
                          handleDelete(item.id);
                        }}
                        placement="top"
                        cancelButtonProps={{
                          className: "popconfirm-cancel-btn",
                        }}
                      >
                        <AiOutlineDelete
                          size={16}
                          color="#333333b6"
                          style={{ cursor: "pointer" }}
                        />
                      </Popconfirm>
                    </div>
                  </div>
                </div>
                <Divider className="tests_completedtests_divider" />
              </React.Fragment>
            );
          })}

          <div
            className="profilepages_personalinfo_button_container"
            style={{ padding: 24 }}
          >
            <button
              className="coursereviews_rating_modal_btn coursereviews_rating_modal_submitbutton"
              style={{ width: "max-content" }}
              onClick={() => {
                setIsOpenForm(true);
              }}
            >
              <IoMdAdd size={21} /> Add Experience
            </button>
          </div>
        </>
      ) : (
        <div style={{ padding: 24 }}>
          <CommonNodataFound message="Please add your experience" />
          <div className="profilepages_personalinfo_button_container">
            <button
              className="coursereviews_rating_modal_btn coursereviews_rating_modal_submitbutton"
              style={{ width: "max-content" }}
              onClick={() => {
                setIsOpenForm(true);
              }}
            >
              <IoMdAdd size={21} /> Add Experience
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
