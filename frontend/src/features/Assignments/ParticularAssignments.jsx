import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Row, Col, Flex, Progress, Modal, Button, Drawer } from "antd";
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
  getCategories,
  getQuestions,
  insertAssignmentAttempt,
  mapQuestionsToAssignment,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSelectField from "../Common/CommonSelectField";
import CommonTable from "../Common/CommonTable";
import EllipsisTooltip from "../Common/EllipsisTooltip";

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
  const [overallAssignmentResult, setOverallAssignmentResult] = useState(null);
  const [viewParticularAssignment, setViewParticularAssignment] = useState("");
  const [isCollapseOpen, setIsCollapseOpen] = useState(true);
  //questions usestates
  const [isOpenMapQuestionDrawer, setIsOpenMapQuestionDrawer] = useState(false);
  const [assignmentModuleId, setAssignmentModuleId] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [questionsPagination, setQuestionsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [categoriesData, setCategoriesData] = useState([]);
  const [categoryIdFilter, setCategoryIdFilter] = useState(null);
  const [questionTypeFilter, setQuestionTypeFilter] = useState(null);
  const [selectedHistoryTestId, setSelectedHistoryTestId] = useState(null);

  const countCardsData = [
    {
      id: 1,
      name: "Total Questions",
      count: overallAssignmentResult?.total_questions || 0,
      icon: (
        <FiLayers className="assignments_count_cards_icon" color="#6941c6" />
      ),
      icon_background_color: "#f4f3ff",
    },
    {
      id: 2,
      name: "Solved",
      count: overallAssignmentResult?.solved || 0,
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
      count: overallAssignmentResult?.attempted || 0,
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
      count: `${overallAssignmentResult?.marks_obtained || 0} / ${overallAssignmentResult?.total_marks || 0}`,
      icon: (
        <FaRegStar className="assignments_count_cards_icon" color="#039855" />
      ),
      icon_background_color: "#ecfdf3",
    },
  ];

  useEffect(() => {
    getCategoriesData();
    getAssignmentModulesData();
  }, []);

  const getCategoriesData = async () => {
    try {
      const response = await getCategories();
      setCategoriesData(response?.data?.result || []);
    } catch (error) {
      console.log("get categories error", error);
    }
  };

  const getAssignmentModulesData = async () => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log(converAsJson);

    const payload = {
      assignment_id: assignment_id,
      user_id: converAsJson?.id,
    };
    try {
      const response = await getAssignmentModules(payload);
      console.log("get modules response", response);
      const modules_data = response?.data?.data?.modules || [];
      setOverallAssignmentResult(
        response?.data?.data?.overall_assignment_results || null,
      );
      setModulesData(modules_data);
    } catch (error) {
      setModulesData([]);
      setOverallAssignmentResult(null);
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

  const handleOpenMapDrawer = (item) => {
    console.log(item);

    setAssignmentModuleId(item.id);
    setIsOpenMapQuestionDrawer(true);
    setCategoryIdFilter(null);
    setQuestionTypeFilter(null);

    // Parse comma-separated question_ids already available in the item object from getTests API
    const ids = item.questions.map((q) => {
      return q.question_id;
    });
    console.log("ids", ids);

    setSelectedQuestions(item.questions);
    setSelectedQuestionIds(ids);

    getAllQuestions(1, 10, null, null);
  };

  const getAllQuestions = async (
    page,
    limit,
    catId = categoryIdFilter,
    type = questionTypeFilter,
  ) => {
    setDrawerLoading(true);
    const payload = {
      page: page,
      pageSize: limit,
      category_id: catId,
      question_type: type,
    };
    try {
      const response = await getQuestions(payload);
      console.log("get questions response", response);
      const questions_data = response?.data?.data?.questions || [];
      const pagination_data = response?.data?.data?.pagination || null;
      setAllQuestions(questions_data);
      setQuestionsPagination({
        page: pagination_data?.page || 1,
        limit: pagination_data?.limit || 10,
        total: pagination_data?.total || 0,
        totalPages: pagination_data?.totalPages || 1,
      });
    } catch (error) {
      setAllQuestions([]);
      console.log("get questions error", error);
    } finally {
      setDrawerLoading(false);
    }
  };

  const getQuestionColumns = () => {
    const common = [
      {
        title: "Question",
        dataIndex: "question",
        key: "question",
        render: (text) => <EllipsisTooltip text={text || "-"} />,
      },
      {
        title: "Type",
        dataIndex: "question_type",
        key: "question_type",
        width: 100,
        render: (text) => (
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              background: text === "CODING" ? "#e6f7ff" : "#f6ffed",
              color: text === "CODING" ? "#1890ff" : "#52c41a",
              border: `1px solid ${text === "CODING" ? "#91d5ff" : "#b7eb8f"}`,
            }}
          >
            {text}
          </span>
        ),
      },
    ];

    if (questionTypeFilter === "CODING") {
      return [
        ...common,
        {
          title: "Difficulty",
          dataIndex: "difficulty",
          key: "difficulty",
          width: 100,
        },
        {
          title: "Sample Input",
          dataIndex: "sample_input",
          key: "sample_input",
        },
      ];
    }

    return [
      ...common,
      {
        title: "Option A",
        dataIndex: "option_a",
        key: "option_a",
        render: (text) => <EllipsisTooltip text={text || "-"} />,
      },
      {
        title: "Option B",
        dataIndex: "option_b",
        key: "option_b",
        render: (text) => <EllipsisTooltip text={text || "-"} />,
      },
      {
        title: "Correct Answer",
        dataIndex: "correct_answer",
        key: "correct_answer",
        width: 150,
        render: (text) => <EllipsisTooltip text={text || "-"} />,
      },
    ];
  };

  const handleMapQuestionsSubmit = async () => {
    if (selectedQuestionIds.length === 0) {
      CommonMessage("warning", "Please select at least one question");
      return;
    }

    setButtonLoading(true);
    console.log("selectedQuestions", selectedQuestions);

    const formatQuestions = selectedQuestions.map((q) => {
      if (q.question_type == "MCQ") {
        return { question_id: q?.question_id ?? q?.id, marks: 2 };
      } else {
        return { question_id: q?.question_id ?? q?.id, marks: 10 };
      }
    });
    console.log("formatQuestions", formatQuestions);

    const today = new Date();
    const payload = {
      assignment_module_id: assignmentModuleId,
      questions: formatQuestions,
      created_date: formatToBackendIST(today),
    };
    console.log("payload", payload);

    try {
      await mapQuestionsToAssignment(payload);
      CommonMessage("success", "Questions mapped successfully!");
      getAssignmentModulesData();
      setIsOpenMapQuestionDrawer(false);
      setButtonLoading(false);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details || "Failed to map questions",
      );
    } finally {
      setButtonLoading(false);
    }
  };

  const handleSolve = async (question_item, module_item) => {
    console.log("question_item", question_item, "module_item", module_item);
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log(converAsJson);
    navigate("/assignment-practice", {
      state: {
        question_item: question_item,
        module_item: module_item,
      },
    });

    // setButtonLoading(true);

    // const payload = {
    //   user_id: converAsJson?.id,
    //   module_question_id: question_item?.mq_id || null,
    //   created_date: formatToBackendIST(new Date()),
    // };

    // try {
    //   await insertAssignmentAttempt(payload);
    //   setButtonLoading(false);
    //   navigate("/assignment-practice", {
    //     state: {
    //       question_item: question_item,
    //       module_item: module_item,
    //     },
    //   });
    // } catch (error) {
    //   CommonMessage(
    //     "error",
    //     error?.response?.data?.details || "Failed to map questions",
    //   );
    // } finally {
    //   setButtonLoading(false);
    // }
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
              percent={overallAssignmentResult?.progress || 0}
              strokeWidth={10}
              strokeColor="#2160ad"
              format={(percent) => (
                <div className="progress_text_container">
                  <p className="progress_label">Progress</p>
                  <p className="progress_percent">{percent}%</p>
                </div>
              )}
              size={160}
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
                <Row>
                  <Col xs={24} sm={24} md={12} lg={12}>
                    <div className="particular_assignment_collapse_stats_container">
                      <p className="collapse_stat_item">
                        Attempted{" "}
                        <span>{`${item.attempted_questions} / ${item.questions.length}`}</span>
                      </p>
                      <p className="collapse_stat_item">
                        Solved{" "}
                        <span>{`${item.solved_questions} / ${item.questions.length}`}</span>
                      </p>
                      <p className="collapse_stat_item">
                        Marks Scored{" "}
                        <span>{`${item.marks_scored} / ${item.total_marks}`}</span>
                      </p>
                    </div>
                  </Col>
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={12}
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "-8px",
                    }}
                  >
                    <div>
                      <button
                        className="solve_button"
                        onClick={() => {
                          handleOpenMapDrawer(item);
                        }}
                      >
                        Map Questions
                      </button>
                    </div>
                  </Col>
                </Row>

                <div className="particular_assignment_questions_table_container">
                  <div className="questions_table_header">
                    <p className="column_question">Question</p>
                    <p className="column_company">Company</p>
                    {/* <p className="column_difficulty">Difficulty</p> */}
                    <p className="column_action">Action</p>
                  </div>

                  {item.questions.map((q, index) => (
                    <div className="questions_table_row" key={index}>
                      <div className="column_question">
                        <div className="question_title_container">
                          <p className="question_title">{q.question}</p>
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
                          <span className="badge_type code">
                            {q.question_type}
                          </span>
                          <span className="badge_score">
                            Score:{" "}
                            {`${q?.user_status?.score_obtained || 0} / ${q.question_type == "MCQ" ? 2 : 10}`}
                          </span>
                          <span className="badge_attempts">
                            Attempts: {q?.user_status?.num_of_attempt || 0}
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
                      {/* <div className="column_difficulty">
                        <span className="difficulty_badge easy">Easy</span>
                      </div> */}
                      <div className="column_action">
                        <button
                          className="solve_button"
                          onClick={() => {
                            handleSolve(q, item);
                          }}
                        >
                          Solve
                        </button>
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

      <Drawer
        title="Map Questions to Test"
        onClose={() => {
          setIsOpenMapQuestionDrawer(false);
          setSelectedQuestionIds([]);
          setSelectedQuestions([]);
          setAssignmentModuleId(null);
        }}
        open={isOpenMapQuestionDrawer}
        size="60%"
      >
        <Row gutter={16} style={{ marginBottom: "16px" }}>
          <Col span={7}>
            <CommonSelectField
              label="Category"
              isFilterField={true}
              options={categoriesData}
              onChange={(e) => {
                setCategoryIdFilter(e.target.value);
                getAllQuestions(1, 10, e.target.value, questionTypeFilter);
              }}
              value={categoryIdFilter}
            />
          </Col>
          <Col span={7}>
            <CommonSelectField
              label="Question Type"
              isFilterField={true}
              options={[
                { id: "MCQ", name: "Multiple Choice Question" },
                { id: "CODING", name: "Coding Question" },
              ]}
              onChange={(e) => {
                setQuestionTypeFilter(e.target.value);
                getAllQuestions(1, 10, categoryIdFilter, e.target.value);
              }}
              value={questionTypeFilter}
            />
          </Col>
        </Row>
        <CommonTable
          columns={getQuestionColumns()}
          dataSource={allQuestions}
          loading={drawerLoading}
          checkBox="true"
          size={"small"}
          selectedRowKeys={selectedQuestionIds}
          selectedDatas={(rows) => {
            setSelectedQuestions(rows);
            setSelectedQuestionIds(rows.map((r) => r.id));
          }}
          onPaginationChange={({ page, limit }) =>
            getAllQuestions(page, limit, categoryIdFilter, questionTypeFilter)
          }
          limit={questionsPagination.limit}
          page_number={questionsPagination.page}
          totalPageNumber={questionsPagination.total}
        />
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={() => setIsOpenMapQuestionDrawer(false)}
            style={{ marginRight: "10px" }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            loading={buttonLoading}
            onClick={handleMapQuestionsSubmit}
            className="courses_addmodule_modal_createbutton"
          >
            Submit
          </Button>
        </div>
      </Drawer>
    </div>
  );
}
