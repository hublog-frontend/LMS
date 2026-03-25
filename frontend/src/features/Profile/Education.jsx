import React, { useState, useEffect } from "react";
import { Row, Col } from "antd";
import CommonInputField from "../Common/CommonInputField";
import CommonTextArea from "../Common/CommonTextArea";
import CommonSelectField from "../Common/CommonSelectField";
import CommonNodataFound from "../Common/CommonNoDataFound";
import { IoMdAdd } from "react-icons/io";
import CommonSpinner from "../Common/CommonSpinner";
import {
  addressValidator,
  formatToBackendIST,
  percentageValidator,
  selectValidator,
  yearValidator,
} from "../Common/Validation";
import { getUserById, updateEducation } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import BuildingImage from "../../assets/building.png";
import { RiGraduationCapFill } from "react-icons/ri";
import { AiOutlineEdit } from "react-icons/ai";
import { Divider } from "antd";
import { Tooltip } from "antd";

export default function Education({ userFulldetails, setUserFullDetails }) {
  const [educationData, setEducationData] = useState([]);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [updateEducationId, setUpdateEducationId] = useState(null);
  const [educationType, setEducationType] = useState("");
  const [educationIdOptions, setEducationIdOptions] = useState([]);
  const [educationId, setEducationId] = useState("");
  const [educationIdError, setEducationIdError] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [registrationNumberError, setRegistrationNumberError] = useState("");
  const [passedOutYear, setPassedOutYear] = useState("");
  const [passedOutYearError, setPassedOutYearError] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [collegeNameError, setCollegeNameError] = useState("");
  const [boardName, setBoardName] = useState("");
  const [boardNameError, setBoardNameError] = useState("");
  const [percentage, setPercentage] = useState("");
  const [percentageError, setPercentageError] = useState("");
  const branchOptions = [
    {
      id: "Computer Science Engineering",
      name: "Computer Science Engineering",
    },
    {
      id: "Mechanical Engineering",
      name: "Mechanical Engineering",
    },
    {
      id: "Electronics and Communication Engineering",
      name: "Electronics and Communication Engineering",
    },
    {
      id: "Electrical and Electronics Engineering Engineering",
      name: "Electrical and Electronics Engineering Engineering",
    },
    {
      id: "Civil Engineering",
      name: "Civil Engineering",
    },
    {
      id: "Information Technology",
      name: "Information Technology",
    },
    {
      id: "Information Science",
      name: "Information Science",
    },
    {
      id: "Electronics and Telecommunication Engineering",
      name: "Electronics and Telecommunication Engineering",
    },
    {
      id: "Electronics and Instrumentation  Engineering",
      name: "Electronics and Instrumentation  Engineering",
    },
    {
      id: "Any Stream",
      name: "Any Stream",
    },
  ];
  const [branchId, setBranchId] = useState("");
  const [branchIdError, setBranchIdError] = useState("");
  const [backlogId, setBacklogId] = useState("No");
  const [gapId, setGapId] = useState("No");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(false);

  const yesOrNoOptions = [
    { id: "Yes", name: "Yes" },
    { id: "No", name: "No" },
  ];

  useEffect(() => {
    setEducationData(userFulldetails?.education || []);
  }, [userFulldetails]);

  const getUserByIdData = async (user_id) => {
    try {
      const response = await getUserById(user_id);
      console.log("get userby id response", response);
      setUserFullDetails(response?.data?.data || []);
      setEducationData(response?.data?.data?.education || []);
    } catch (error) {
      setEducationData([]);
      console.log("get user by id error", error);
    }
  };

  const handleSubmit = async () => {
    setValidationTrigger(true);
    const educationIdValidate = selectValidator(educationId);
    const registrationNumberValidate = addressValidator(registrationNumber);
    const passedOutYearValidate = yearValidator(passedOutYear);
    const collegeNameValidate = addressValidator(collegeName);
    const boardNameValidate = addressValidator(boardName);
    const percentageValidate = percentageValidator(percentage);
    const branchIdValidate =
      educationData.length >= 2 && educationType == ""
        ? selectValidator(branchId)
        : "";

    setEducationIdError(educationIdValidate);
    setRegistrationNumberError(registrationNumberValidate);
    setPassedOutYearError(passedOutYearValidate);
    setCollegeNameError(collegeNameValidate);
    setBoardNameError(boardNameValidate);
    setPercentageError(percentageValidate);
    setBranchIdError(branchIdValidate);

    if (
      registrationNumberValidate ||
      passedOutYearValidate ||
      collegeNameValidate ||
      boardNameValidate ||
      percentageValidate ||
      branchIdValidate
    )
      return;

    setButtonLoading(true);
    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    const payload = {
      ...(updateEducationId && { education_id: updateEducationId }),
      user_id: converAsJson?.id,
      education: educationId,
      register_number: registrationNumber,
      passed_year: passedOutYear,
      college_name: collegeName,
      board_name: boardName,
      percentage: percentage,
      ...(educationData.length >= 2 && { branch: branchId }),
      ...(educationData.length >= 2 && { backlog: backlogId }),
      ...(educationData.length >= 2 && { year_gap: gapId }),
      ...(educationData.length == 3 && { is_pg: true }),
      created_date: formatToBackendIST(today),
    };

    try {
      await updateEducation(payload);
      setTimeout(() => {
        if (updateEducationId) {
          CommonMessage("success", "Education Updated");
        } else {
          CommonMessage("success", "Education Added");
        }
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

  const handleEdit = (item) => {
    console.log("education item", item);
    setIsOpenForm(true);
    setUpdateEducationId(item.id);
    setEducationId(item.education);
    if (item.education == "SSLC") {
      setEducationType("SSLC");
      setEducationIdOptions([{ id: "SSLC", name: "SSLC" }]);
    } else if (item.education == "HSC") {
      setEducationType("HSC");
      setEducationIdOptions([
        { id: "HSC", name: "HSC" },
        { id: "Diploma", name: "Diploma" },
      ]);
    } else if (item.is_pg == 1) {
      setEducationIdOptions([
        { id: "MS", name: "MS" },
        { id: "M.Sc", name: "M.Sc" },
        { id: "ME/M.Tech", name: "ME/M.Tech" },
        { id: "MCA", name: "MCA" },
        { id: "Any Degree", name: "Any Degree" },
      ]);
    } else {
      setEducationIdOptions([
        { id: "B.Sc", name: "B.Sc" },
        { id: "B.Com", name: "B.Com" },
        { id: "BCA", name: "BCA" },
        { id: "BE/B.Tech", name: "BE/B.Tech" },
        { id: "Diploma", name: "Diploma" },
        { id: "Any Degree", name: "Any Degree" },
      ]);
    }

    setRegistrationNumber(item.register_number);
    setPassedOutYear(item.passed_year);
    setCollegeName(item.college_name);
    setBoardName(item.board_name);
    setPercentage(item.percentage);
    setBranchId(item.branch);
    setBacklogId(item.backlog);
    setGapId(item.year_gap);
  };

  const formReset = () => {
    setIsOpenForm(false);
    setButtonLoading(false);
    setValidationTrigger(false);
    setUpdateEducationId(null);
    setEducationType("");
    setEducationId("");
    setEducationIdError("");
    setRegistrationNumber("");
    setRegistrationNumberError("");
    setPassedOutYear("");
    setPassedOutYearError("");
    setCollegeName("");
    setCollegeNameError("");
    setBoardName("");
    setBoardNameError("");
    setPercentage("");
    setPercentageError("");
    setBranchId("");
    setBranchIdError("");
    setBacklogId("No");
    setGapId("No");
  };

  return (
    <div
      className="profilepage_personalinfo_main_container"
      style={{ padding: 0 }}
    >
      {isOpenForm ? (
        <div style={{ padding: 24 }}>
          <Row gutter={16} style={{ marginBottom: "30px" }}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={12}
              style={{ marginBottom: "20px" }}
            >
              <CommonSelectField
                required={true}
                label="Education"
                options={educationIdOptions}
                onChange={(e) => {
                  setEducationId(e.target.value);
                  if (validationTrigger) {
                    setEducationIdError(selectValidator(e.target.value));
                  }
                }}
                value={educationId}
                error={educationIdError}
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
                label="Register Number"
                type="number"
                onChange={(e) => {
                  setRegistrationNumber(e.target.value);
                  if (validationTrigger) {
                    setRegistrationNumberError(
                      addressValidator(e.target.value),
                    );
                  }
                }}
                value={registrationNumber}
                error={registrationNumberError}
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
                label="Year"
                type="number"
                onChange={(e) => {
                  setPassedOutYear(e.target.value);
                  if (validationTrigger) {
                    setPassedOutYearError(yearValidator(e.target.value));
                  }
                }}
                value={passedOutYear}
                error={passedOutYearError}
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
                label="College Name"
                onChange={(e) => {
                  setCollegeName(e.target.value);
                  if (validationTrigger) {
                    setCollegeNameError(addressValidator(e.target.value));
                  }
                }}
                value={collegeName}
                error={collegeNameError}
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
                label="Board Name"
                onChange={(e) => {
                  setBoardName(e.target.value);
                  if (validationTrigger) {
                    setBoardNameError(addressValidator(e.target.value));
                  }
                }}
                value={boardName}
                error={boardNameError}
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
                label="Percentage"
                type="number"
                onChange={(e) => {
                  setPercentage(e.target.value);
                  if (validationTrigger) {
                    setPercentageError(percentageValidator(e.target.value));
                  }
                }}
                value={percentage}
                error={percentageError}
              />
            </Col>

            {educationData.length >= 2 && educationType == "" ? (
              <>
                <Col
                  xs={24}
                  sm={24}
                  md={24}
                  lg={12}
                  style={{ marginBottom: "20px" }}
                >
                  <CommonSelectField
                    required={true}
                    label="Branch"
                    options={branchOptions}
                    onChange={(e) => {
                      setBranchId(e.target.value);
                      if (validationTrigger) {
                        setBranchIdError(selectValidator(e.target.value));
                      }
                    }}
                    value={branchId}
                    error={branchIdError}
                  />
                </Col>
                <Col
                  xs={24}
                  sm={24}
                  md={24}
                  lg={12}
                  style={{ marginBottom: "20px" }}
                >
                  <CommonSelectField
                    required={true}
                    label="Backlog"
                    options={yesOrNoOptions}
                    onChange={(e) => {
                      setBacklogId(e.target.value);
                    }}
                    value={backlogId}
                    allowClear={false}
                  />
                </Col>

                <Col
                  xs={24}
                  sm={24}
                  md={24}
                  lg={12}
                  style={{ marginBottom: "20px" }}
                >
                  <CommonSelectField
                    required={true}
                    label="Year Gap"
                    options={yesOrNoOptions}
                    onChange={(e) => {
                      setGapId(e.target.value);
                    }}
                    value={gapId}
                    allowClear={false}
                  />
                </Col>
              </>
            ) : (
              ""
            )}
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
                style={{ width: updateEducationId ? "90px" : "70px" }}
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
                {updateEducationId ? "Update" : "Add"}
              </button>
            )}
          </div>
        </div>
      ) : educationData.length >= 1 ? (
        <>
          {educationData.map((item, index) => {
            return (
              <React.Fragment key={index}>
                <div style={{ width: "100%", padding: 24 }}>
                  <div className="profilepage_experience_card">
                    {/* -------left div------------ */}
                    <div className="profilepage_experience_card_name_container">
                      <div className="profilepage_education_card_image_container">
                        <RiGraduationCapFill
                          size={35}
                          color="#2092d0c2"
                          style={{ marginTop: "2px" }}
                        />
                      </div>

                      <div className="profilepage_experience_details_div">
                        <p className="profilepage_experience_designation">
                          {item.college_name}
                        </p>

                        <p className="profilepage_experience_company_name">
                          {item.education}
                        </p>

                        <div className="profilepage_experience_location_div">
                          <p className="profilepage_experience_location_details">
                            Grade: {item.percentage} |
                          </p>
                          <p className="profilepage_experience_location_details">
                            Passedout Years: {item.passed_year}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ----------right div------------ */}
                    <div>
                      <Tooltip title="Edit" placement="top">
                        <AiOutlineEdit
                          size={16}
                          color="#333333b6"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            handleEdit(item);
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <Divider className="tests_completedtests_divider" />
              </React.Fragment>
            );
          })}

          {educationData.length <= 3 && (
            <div
              className="profilepages_personalinfo_button_container"
              style={{ padding: 24 }}
            >
              <button
                className="coursereviews_rating_modal_btn coursereviews_rating_modal_submitbutton"
                style={{ width: "max-content" }}
                onClick={() => {
                  setIsOpenForm(true);
                  if (educationData.length <= 0) {
                    setEducationIdOptions([{ id: "SSLC", name: "SSLC" }]);
                  } else if (educationData.length == 1) {
                    setEducationIdOptions([
                      { id: "HSC", name: "HSC" },
                      { id: "Diploma", name: "Diploma" },
                    ]);
                  } else if (educationData.length == 2) {
                    setEducationIdOptions([
                      { id: "B.Sc", name: "B.Sc" },
                      { id: "B.Com", name: "B.Com" },
                      { id: "BCA", name: "BCA" },
                      { id: "BE/B.Tech", name: "BE/B.Tech" },
                      { id: "Diploma", name: "Diploma" },
                      { id: "Any Degree", name: "Any Degree" },
                    ]);
                  } else {
                    setEducationIdOptions([
                      { id: "MS", name: "MS" },
                      { id: "M.Sc", name: "M.Sc" },
                      { id: "ME/M.Tech", name: "ME/M.Tech" },
                      { id: "MCA", name: "MCA" },
                      { id: "Any Degree", name: "Any Degree" },
                    ]);
                  }
                }}
              >
                <IoMdAdd size={21} />{" "}
                {educationData.length <= 0
                  ? "Add SSLC"
                  : educationData.length == 1
                    ? "Add HSC"
                    : educationData.length == 2
                      ? "Add UG"
                      : "Add PG"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: 24 }}>
          <CommonNodataFound message="Please add your education" />
          <div className="profilepages_personalinfo_button_container">
            <button
              className="coursereviews_rating_modal_btn coursereviews_rating_modal_submitbutton"
              style={{ width: "max-content" }}
              onClick={() => {
                setIsOpenForm(true);
                setEducationIdOptions([{ id: "SSLC", name: "SSLC" }]);
              }}
            >
              <IoMdAdd size={21} /> Add SSLC
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
