import React, { useState, useEffect } from "react";
import { Row, Col, Divider, Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { FiLayers } from "react-icons/fi";
import { FiCheckCircle } from "react-icons/fi";
import { IoMdCheckmark } from "react-icons/io";
import { FaRegStar } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import MNCImage from "../../assets/mncs.png";
import InfosysImage from "../../assets/infosys2.png";
import TcsImage from "../../assets/tcs.png";
import AptitudeImage from "../../assets/apti.png";
import { IoArrowForwardOutline } from "react-icons/io5";
import CommonSpinner from "../Common/CommonSpinner";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import { addressValidator, formatToBackendIST } from "../Common/Validation";
import { createAssignment, getAssignments } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import BuildingImage from "../../assets/building.png";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

export default function Assignments() {
  const navigate = useNavigate();

  const [isOpenAddAssignmentModal, setIsOpenAddAssignmentModal] =
    useState(false);
  const [editAssignmentId, setEditAssignmentId] = useState(null);
  const [assignmentName, setAssignmentName] = useState("");
  const [assignmentNameError, setAssignmentNameError] = useState("");
  const [assignmentLogoBase64, setAssignmentLogoBase64] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [assignmentData, setAssignmentData] = useState([]);

  const countCardsData = [
    {
      id: 1,
      name: "Total Questions",
      count: "374",
      icon: (
        <FiLayers className="assignments_count_cards_icon" color="#6941c6" />
      ),
      icon_background_color: "#f4f3ff",
    },
    {
      id: 2,
      name: "Solved",
      count: "4",
      icon: (
        <FiCheckCircle
          className="assignments_count_cards_icon"
          color="#175cd3"
        />
      ),
      icon_background_color: "#eff8ff",
    },
    {
      id: 3,
      name: "Attempted",
      count: "9",
      icon: (
        <IoMdCheckmark
          className="assignments_count_cards_icon"
          color="#c11574"
        />
      ),
      icon_background_color: "#fdf2fa",
    },
    {
      id: 4,
      name: "Marks Obtained",
      count: "3.3 / 5.5k",
      icon: (
        <FaRegStar className="assignments_count_cards_icon" color="#039855" />
      ),
      icon_background_color: "#ecfdf3",
    },
  ];

  const assignmentCardsData = [
    {
      id: 1,
      name: "MNC Interview Cracker",
      image: <img src={MNCImage} className="assignment_cards_mnc_image" />,
      modules: "5",
      questions: "86",
      mark_scored: "0/3085",
    },
    {
      id: 2,
      name: "Infosys Interview Cracker",
      image: <img src={InfosysImage} className="assignment_cards_mnc_image" />,
      modules: "1",
      questions: "19",
      mark_scored: "0/190",
    },
    {
      id: 3,
      name: "TCS Interview Cracker",
      image: <img src={TcsImage} className="assignment_cards_mnc_image" />,
      modules: "3",
      questions: "78",
      mark_scored: "0/1934",
    },
    {
      id: 4,
      name: "Aptitude Interview Cracker",
      image: <img src={AptitudeImage} className="assignment_cards_mnc_image" />,
      modules: "3",
      questions: "78",
      mark_scored: "0/1934",
    },
  ];

  useEffect(() => {
    getAssignmentsData();
  }, []);

  const getAssignmentsData = async () => {
    try {
      const response = await getAssignments();
      console.log("get assignments response", response);
      const assignments_data = response?.data?.data?.assignments || [];
      setAssignmentData(assignments_data);
    } catch (error) {
      setAssignmentData([]);
      console.log("get assignments error", error);
    }
  };

  const handleCreateAssignment = async () => {
    setValidationTrigger(true);
    const assignmentNameValidate = addressValidator(assignmentName);

    setAssignmentNameError(assignmentNameValidate);

    if (assignmentNameValidate) return;

    setButtonLoading(true);
    const today = new Date();

    const payload = {
      ...(editAssignmentId ? { assignment_id: editAssignmentId } : {}),
      assignment_name: assignmentName,
      logo_image: assignmentLogoBase64,
      created_date: formatToBackendIST(today),
    };

    try {
      await createAssignment(payload);
      setTimeout(() => {
        setButtonLoading(false);
        formReset();
        getAssignmentsData();
        CommonMessage(
          "success",
          `Assignment ${editAssignmentId ? "Updated" : "Created"} Successfully!`,
        );
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const formReset = () => {
    setIsOpenAddAssignmentModal(false);
    setAssignmentName("");
    setAssignmentNameError("");
    setEditAssignmentId(null);
    setAssignmentLogoBase64("");
    setValidationTrigger(false);
    setButtonLoading(false);
  };

  return (
    <div>
      <Row>
        <Col xs={12} sm={12} md={12} lg={12}>
          <p className="common_heading" style={{ margin: 0 }}>
            Assignments
          </p>
        </Col>

        <Col
          xs={12}
          sm={12}
          md={12}
          lg={12}
          className="tests_createtopic_button_container"
        >
          <button
            className="courses_createcourse_button"
            onClick={() => setIsOpenAddAssignmentModal(true)}
          >
            Create Assignment
          </button>
        </Col>
      </Row>

      <Row
        gutter={[
          {
            xs: 5,
            sm: 12,
            md: 16,
            lg: 16,
          },
          { xs: 8, sm: 8, md: 12, lg: 16 },
        ]}
        className="assignments_count_cards_main_container"
      >
        {countCardsData.map((item, index) => {
          return (
            <React.Fragment key={index}>
              <Col xs={12} sm={12} md={12} lg={6}>
                <div className="assignments_count_cards">
                  <div>
                    <p className="assignments_count_cards_heading">
                      {item.name}
                    </p>
                    <p className="assignments_count_cards_count">
                      {item.count}
                    </p>
                  </div>

                  <div
                    className="assignments_count_cards_icon_container"
                    style={{ backgroundColor: item.icon_background_color }}
                  >
                    {item.icon}
                  </div>
                </div>
              </Col>
            </React.Fragment>
          );
        })}
      </Row>

      <Row>
        <Col xs={24} sm={24} md={12} lg={8}>
          <CommonInputField
            placeholder="Search for assignment"
            prefix={<CiSearch size={16} />}
          />
        </Col>
      </Row>

      <Row
        gutter={[
          {
            xs: 16,
            sm: 16,
            md: 16,
            lg: 16,
          },
          { xs: 16, sm: 16, md: 16, lg: 16 },
        ]}
        style={{ marginTop: "20px" }}
      >
        {assignmentData.map((item, index) => {
          return (
            <React.Fragment key={index}>
              <Col xs={24} sm={24} md={12} lg={8}>
                <div
                  className="assignments_cards"
                  onClick={() => {
                    navigate(`/assignments/${item?.id || null}`, {
                      state: { assignment_name: item?.assignment_name } || "",
                    });
                  }}
                >
                  <div className="tests_topics_icon_container">
                    <AiOutlineEdit
                      size={15}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditAssignmentId(item.id);
                        setAssignmentName(item.assignment_name);
                        setAssignmentLogoBase64(item.logo_image);
                        setIsOpenAddAssignmentModal(true);
                      }}
                    />

                    <AiOutlineDelete
                      size={15}
                      className="action-delete-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        // setIsOpenDeleteModal(true);
                        setEditAssignmentId(item.id);
                      }}
                    />
                  </div>
                  <div className="assignment_cards_header_container">
                    <div className="assignment_cards_header_name_container">
                      {/* {item.image} */}
                      {item.logo_image ? (
                        <img
                          src={`data:image/png;base64,${item.logo_image}`}
                          className="assignment_cards_mnc_image"
                        />
                      ) : (
                        <img
                          src={BuildingImage}
                          className="assignment_cards_mnc_image"
                        />
                      )}
                      <p className="assignment_cards_header_name">
                        {item.assignment_name}
                      </p>
                    </div>

                    <div className="assignment_cards_batch_container">
                      <p>Intermediate</p>
                    </div>
                  </div>
                  <Divider className="assignment_cards_divider" />

                  <div className="assignment_cards_score_container">
                    <div className="assignment_cards_score_name_container">
                      <p>Modules</p>
                      <p>{item.total_modules}</p>
                    </div>

                    <div className="assignment_cards_score_name_container">
                      <p>Questions</p>
                      <p>86</p>
                    </div>

                    <div className="assignment_cards_score_name_container">
                      <p>Mark Scored</p>
                      <p>0/190</p>
                    </div>
                  </div>

                  <div className="assignment_cards_container">
                    <p>Get Started</p>
                    <IoArrowForwardOutline size={19} />
                  </div>
                </div>
              </Col>
            </React.Fragment>
          );
        })}
      </Row>

      {/* add assignment modal */}
      <Modal
        title={editAssignmentId ? "Update Assignment" : "Add Assignment"}
        open={isOpenAddAssignmentModal}
        onCancel={formReset}
        width="35%"
        footer={[
          <Button
            key="cancel"
            onClick={formReset}
            className="courses_addmodule_modal_cancelbutton"
          >
            Cancel
          </Button>,

          buttonLoading ? (
            <Button
              key="create"
              type="primary"
              className="courses_addmodule_modal_loading_createbutton"
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              key="create"
              type="primary"
              onClick={handleCreateAssignment}
              className="courses_addmodule_modal_createbutton"
            >
              {editAssignmentId ? "Update" : "Create"}
            </Button>
          ),
        ]}
      >
        <div style={{ marginTop: "20px" }}>
          <ImageUploadCrop
            label="Logo"
            aspect={1}
            maxSizeMB={1}
            required={false}
            value={assignmentLogoBase64}
            onChange={(base64) => setAssignmentLogoBase64(base64)}
            onErrorChange={""} // ✅ pass setter directly
          />{" "}
        </div>

        <div style={{ marginTop: "20px", marginBottom: "24px" }}>
          <CommonInputField
            label="Assignment Name"
            required={true}
            onChange={(e) => {
              setAssignmentName(e.target.value);
              if (validationTrigger) {
                setAssignmentNameError(addressValidator(e.target.value));
              }
            }}
            value={assignmentName}
            error={assignmentNameError}
          />
        </div>
      </Modal>
    </div>
  );
}
