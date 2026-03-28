import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Row, Col, Flex, Progress, Modal, Button } from "antd";
import { IoArrowBackOutline } from "react-icons/io5";
import { FiLayers } from "react-icons/fi";
import { FiCheckCircle } from "react-icons/fi";
import { IoMdCheckmark, IoIosArrowDown } from "react-icons/io";
import { FaRegStar } from "react-icons/fa";
import { LuClock4 } from "react-icons/lu";
import { FiBookmark } from "react-icons/fi";
import { IoCheckmarkSharp } from "react-icons/io5";
import { addressValidator, formatToBackendIST } from "../Common/Validation";
import CommonSpinner from "../Common/CommonSpinner";
import CommonInputField from "../Common/CommonInputField";
import {
  createAssignmentModule,
  getAssignmentModules,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";

export default function ParticularAssignments() {
  const navigate = useNavigate();
  const location = useLocation();
  const { assignment_id } = useParams();
  const [isOpenAddModuleModal, setIsOpenAddModuleModal] = useState(false);
  const [editModuleId, setEditModuleId] = useState(null);
  const [moduleName, setModuleName] = useState("");
  const [moduleNameError, setModuleNameError] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [modulesData, setModulesData] = useState([]);
  const [viewParticularAssignment, setViewParticularAssignment] = useState("");
  const [isCollapseOpen, setIsCollapseOpen] = useState(true);
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

  useEffect(() => {
    getAssignmentModulesData();
  }, []);

  const getAssignmentModulesData = async () => {
    const payload = {
      assignment_id: assignment_id,
    };
    try {
      const response = await getAssignmentModules(payload);
      console.log("get modules response", response);
      const modules_data = response?.data?.data?.questionsData || [];
      setModulesData(modules_data);
    } catch (error) {
      setModulesData([]);
      console.log("get modules error", error);
    }
  };

  const handleCreateModule = async () => {
    console.log("Hiii");
    setValidationTrigger(true);
    const moduleNameValidate = addressValidator(moduleName);

    setModuleNameError(moduleNameValidate);

    if (moduleNameValidate) return;

    setButtonLoading(true);
    const today = new Date();

    const payload = {
      ...(editModuleId ? { module_id: editModuleId } : {}),
      assignment_id: assignment_id,
      module_name: moduleName,
      module_number: modulesData.length + 1,
      created_date: formatToBackendIST(today),
    };

    try {
      await createAssignmentModule(payload);
      setTimeout(() => {
        setButtonLoading(false);
        formReset();
        getAssignmentModulesData();
        CommonMessage(
          "success",
          `Module ${editModuleId ? "Updated" : "Created"} Successfully!`,
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
    setIsOpenAddModuleModal(false);
    setEditModuleId(null);
    setModuleName("");
    setModuleNameError("");
  };

  return (
    <div>
      <Row>
        <Col xs={12} sm={12} md={12} lg={12}>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <IoArrowBackOutline
              size={30}
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (viewParticularAssignment == false) {
                  navigate("/assignments");
                } else {
                  setViewParticularAssignment(false);
                }
              }}
            />
            <p className="common_heading">
              {location?.state?.assignment_name || ""}
            </p>
          </div>
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
            onClick={() => setIsOpenAddModuleModal(true)}
          >
            Create Module
          </button>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} sm={24} md={24} lg={20}>
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
                  <Col span={12}>
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
                        style={{
                          backgroundColor: item.icon_background_color,
                        }}
                      >
                        {item.icon}
                      </div>
                    </div>
                  </Col>
                </React.Fragment>
              );
            })}
          </Row>
        </Col>
        <Col xs={24} sm={24} md={24} lg={4}>
          <div className="particularassignments_progressbar_card">
            <Progress
              type="circle"
              percent={0}
              strokeWidth={10}
              trailColor="#F2F2F2"
              strokeColor="#101828"
              format={(percent) => (
                <div className="progress_text_container">
                  <p className="progress_label">Progress</p>
                  <p className="progress_percent">{percent}%</p>
                </div>
              )}
              width={160}
            />
          </div>
        </Col>
      </Row>

      {modulesData.map((item, index) => {
        return (
          <div
            className={`particular_assignment_collapse_container ${
              isCollapseOpen ? "open" : ""
            }`}
            key={index}
          >
            <div
              className="particular_assignment_collapse_header_container"
              onClick={() => setIsCollapseOpen(!isCollapseOpen)}
            >
              <div className="particular_assignment_collapse_header_inner_container">
                <div
                  style={{ display: "flex", gap: "12px", alignItems: "center" }}
                >
                  <div className="particular_assignment_collapse_header_avatar_container">
                    {item?.module_number || null}
                  </div>

                  <p className="particular_assignment_collapse_header_name">
                    {item?.module_name || ""}
                  </p>
                </div>

                <div className="particular_assignment_collapse_header_right_container">
                  <div className="particular_assignment_collapse_timetaken_badge">
                    Time Taken: 0m:0s
                  </div>
                  <div className="particular_assignment_collapse_duedate_badge">
                    Due Date NA
                  </div>
                  <IoIosArrowDown
                    color="#98A2B3"
                    size={20}
                    style={{
                      transform: isCollapseOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.3s",
                    }}
                  />
                </div>
              </div>
            </div>

            {isCollapseOpen && (
              <div className="particular_assignment_collapse_content">
                <div className="particular_assignment_collapse_stats_container">
                  <p className="collapse_stat_item">
                    Attempted <span>1 / 3</span>
                  </p>
                  <p className="collapse_stat_item">
                    Solved <span>0 / 3</span>
                  </p>
                  <p className="collapse_stat_item">
                    Marks Scored <span>0 / 210</span>
                  </p>
                </div>

                <div className="particular_assignment_questions_table_container">
                  <div className="questions_table_header">
                    <p className="column_question">Question</p>
                    <p className="column_company">Company</p>
                    <p className="column_difficulty">Difficulty</p>
                    <p className="column_action">Action</p>
                  </div>

                  {[1, 2, 3].map((item, index) => (
                    <div className="questions_table_row" key={index}>
                      <div className="column_question">
                        <div className="question_title_container">
                          <p className="question_title">
                            {index === 0
                              ? "Count Sundays"
                              : index === 1
                                ? "Find Remainder"
                                : "Swap Numbers Without Temporary Variable"}
                          </p>
                          {/* Placeholder icons for orange clock/checkmark */}
                          <span className="question_status_icon">
                            {index === 0 ? (
                              <div className="questions_table_row_icon_container questions_table_row_clock_icon_container">
                                <LuClock4 color="#f79009" />
                              </div>
                            ) : (
                              <div className="questions_table_row_icon_container questions_table_row_check_icon_container">
                                <IoCheckmarkSharp color="#667085" />
                              </div>
                            )}
                          </span>
                          <span className="question_bookmark_icon">
                            <FiBookmark />
                          </span>
                        </div>
                        <div className="question_badges_container">
                          <span className="badge_type code">Code</span>
                          <span className="badge_score">Score: 0 / 100</span>
                          <span className="badge_attempts">
                            Attempts: {index === 0 ? "0" : "--"}
                          </span>
                        </div>
                      </div>
                      <div className="column_company">
                        {/* Placeholder for company logos */}
                        <div className="company_logos_placeholder">
                          {index === 0
                            ? "TCS"
                            : index === 1
                              ? "TCS >"
                              : "G B TCS I"}
                        </div>
                      </div>
                      <div className="column_difficulty">
                        <span className="difficulty_badge easy">Easy</span>
                      </div>
                      <div className="column_action">
                        <button className="solve_button">Solve</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* add module modal */}
      <Modal
        title={editModuleId ? "Update Module" : "Add Module"}
        open={isOpenAddModuleModal}
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
              onClick={handleCreateModule}
              className="courses_addmodule_modal_createbutton"
            >
              {editModuleId ? "Update" : "Create"}
            </Button>
          ),
        ]}
      >
        <div style={{ marginTop: "20px", marginBottom: "24px" }}>
          <CommonInputField
            label="Module Name"
            required={true}
            onChange={(e) => {
              setModuleName(e.target.value);
              if (validationTrigger) {
                setModuleNameError(addressValidator(e.target.value));
              }
            }}
            value={moduleName}
            error={moduleNameError}
          />
        </div>
      </Modal>
    </div>
  );
}
