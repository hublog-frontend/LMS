import React, { useState, useEffect } from "react";
import { Row, Col } from "antd";
import CommonInputField from "../Common/CommonInputField";
import CommonTextArea from "../Common/CommonTextArea";
import {
  deleteProject,
  getUserById,
  updateProject,
} from "../ApiService/action";
import CommonNodataFound from "../Common/CommonNoDataFound";
import { IoMdAdd } from "react-icons/io";
import { addressValidator, formatToBackendIST } from "../Common/Validation";
import CommonSpinner from "../Common/CommonSpinner";
import { CommonMessage } from "../Common/CommonMessage";
import BuildingImage from "../../assets/building.png";
import { Divider } from "antd";
import { AiOutlineDelete } from "react-icons/ai";
import { Tooltip } from "antd";
import { Popconfirm } from "antd";

export default function Projects({ userFulldetails, setUserFullDetails }) {
  const [projectsData, setProjectsData] = useState([]);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectNameError, setProjectNameError] = useState("");
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(false);

  useEffect(() => {
    setProjectsData(userFulldetails?.projects || []);
  }, [userFulldetails]);

  const getUserByIdData = async (user_id) => {
    try {
      const response = await getUserById(user_id);
      console.log("get userby id response", response);
      setUserFullDetails(response?.data?.data || []);
      setProjectsData(response?.data?.data?.projects || []);
    } catch (error) {
      setProjectsData([]);
      console.log("get user by id error", error);
    }
  };

  const handleSubmit = async () => {
    setValidationTrigger(true);
    const projectNameValidate = addressValidator(projectName);
    const linkValidate = addressValidator(link);
    const descriptionValidate = addressValidator(description);

    setProjectNameError(projectNameValidate);
    setLinkError(linkValidate);
    setDescriptionError(descriptionValidate);

    if (projectNameValidate || linkValidate || descriptionValidate) return;

    setButtonLoading(true);
    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    const payload = {
      user_id: converAsJson?.id,
      project_name: projectName,
      link: link,
      description: description,
      created_date: formatToBackendIST(today),
    };

    try {
      await updateProject(payload);
      setTimeout(() => {
        CommonMessage("success", "Project Added");
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
      await deleteProject(id);
      setTimeout(() => {
        CommonMessage("success", "Project Deleted");
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
    setIsOpenForm(false);
    setButtonLoading(false);
    setValidationTrigger(false);
    setProjectName("");
    setProjectNameError("");
    setLink("");
    setLinkError("");
    setDescription("");
    setDescriptionError("");
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
              <CommonInputField
                required={true}
                label="Project Name"
                onChange={(e) => {
                  setProjectName(e.target.value);
                  if (validationTrigger) {
                    setProjectNameError(addressValidator(e.target.value));
                  }
                }}
                value={projectName}
                error={projectNameError}
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
                label="Project Link"
                onChange={(e) => {
                  setLink(e.target.value);
                  if (validationTrigger) {
                    setLinkError(addressValidator(e.target.value));
                  }
                }}
                value={link}
                error={linkError}
              />
            </Col>
            <Col span={24}>
              <CommonTextArea
                label="Description"
                required={true}
                onChange={(e) => {
                  setDescription(e.target.value);
                  console.log("adasd", e.target.value);
                  if (validationTrigger) {
                    setDescriptionError(addressValidator(e.target.value));
                  }
                }}
                value={description}
                error={descriptionError}
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
      ) : projectsData.length >= 1 ? (
        <>
          {projectsData.map((item, index) => {
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
                          {item.project_name}
                        </p>
                        <p className="profilepage_experience_company_name">
                          {item.link}
                        </p>
                        <div className="profilepage_experience_location_div">
                          <p className="profilepage_experience_location_details">
                            Description: {item.description}
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
              <IoMdAdd size={21} /> Add Project
            </button>
          </div>
        </>
      ) : (
        <div style={{ padding: 24 }}>
          <CommonNodataFound message="Please add your projects" />
          <div className="profilepages_personalinfo_button_container">
            <button
              className="coursereviews_rating_modal_btn coursereviews_rating_modal_submitbutton"
              style={{ width: "max-content" }}
              onClick={() => {
                setIsOpenForm(true);
              }}
            >
              <IoMdAdd size={21} /> Add Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
