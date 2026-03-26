import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Modal, Button } from "antd";
import { IoArrowBackOutline } from "react-icons/io5";
import { HiOutlineClipboard } from "react-icons/hi";
import CommonInputField from "../Common/CommonInputField";
import { CiSearch } from "react-icons/ci";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { createTest, getTests } from "../ApiService/action";
import CommonNodataFound from "../Common/CommonNoDataFound";
import {
  addressValidator,
  formatToBackendIST,
  selectValidator,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import { AiOutlineEdit } from "react-icons/ai";
import { Drawer } from "antd";
import {
  getCategories,
  getQuestions,
  mapQuestionsToTest,
} from "../ApiService/action";
import CommonSelectField from "../Common/CommonSelectField";
import CommonTable from "../Common/CommonTable";
import EllipsisTooltip from "../Common/EllipsisTooltip";

export default function TestTopics() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const [editTestId, setEditTestId] = useState(null);
  const [isOpenAddTestModal, setIsOpenAddTestModal] = useState(false);
  const [testName, setTestName] = useState("");
  const [testNameError, setTestNameError] = useState("");
  const [duration, setDuration] = useState("");
  const [durationError, setDurationError] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [testsData, setTestsData] = useState([]);
  const [isOpenMapQuestionDrawer, setIsOpenMapQuestionDrawer] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [mappingTestId, setMappingTestId] = useState(null);
  const [questionsPagination, setQuestionsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [categoriesData, setCategoriesData] = useState([]);
  const [categoryIdFilter, setCategoryIdFilter] = useState(null);
  const [questionTypeFilter, setQuestionTypeFilter] = useState(null);

  const data = [
    { id: 1, name: "Loops" },
    { id: 2, name: "Arrays" },
    { id: 3, name: "Patterns" },
  ];
  const [isHistory, setIsHistory] = useState(false);
  const historyData = [
    { id: 1, name: "Loops Test" },
    { id: 2, name: "Loops Test" },
    { id: 3, name: "Loops Test" },
  ];

  useEffect(() => {
    console.log("paramssss", topicId);
    getTestsData();
    getCategoriesData();
  }, []);

  const getCategoriesData = async () => {
    try {
      const response = await getCategories();
      setCategoriesData(response?.data?.result || []);
    } catch (error) {
      console.log("get categories error", error);
    }
  };

  const getTestsData = async () => {
    const payload = {
      topic_id: topicId,
      page: 1,
      pageSize: 1000,
    };
    try {
      const response = await getTests(payload);
      console.log("get tests response", response);
      const tests_data = response?.data?.tests || [];
      setTestsData(tests_data);
    } catch (error) {
      setTestsData([]);
      console.log("get tests error", error);
    }
  };

  const handleCreateTest = async () => {
    setValidationTrigger(true);
    const testNameValidate = addressValidator(testName);
    const durationValidate = selectValidator(String(duration));

    setTestNameError(testNameValidate);
    setDurationError(durationValidate);

    if (testNameValidate || durationValidate) return;

    setButtonLoading(true);
    const today = new Date();

    const payload = {
      ...(editTestId ? { test_id: editTestId } : {}),
      topic_id: topicId,
      test_name: testName,
      duration: Number(duration),
      created_date: formatToBackendIST(today),
    };

    try {
      await createTest(payload);
      setTimeout(() => {
        setButtonLoading(false);
        formReset();
        getTestsData();
        CommonMessage(
          "success",
          `Test ${editTestId ? "Updated" : "Created"} Successfully!`,
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
    setIsOpenAddTestModal(false);
    setTestName("");
    setTestNameError("");
    setDuration("");
    setDurationError("");
    setValidationTrigger(false);
    setButtonLoading(false);
  };

  const handleOpenMapDrawer = (test) => {
    setMappingTestId(test.id);
    setIsOpenMapQuestionDrawer(true);
    setCategoryIdFilter(null);
    setQuestionTypeFilter(null);

    // Parse comma-separated question_ids already available in the test object from getTests API
    const ids = test.question_ids
      ? String(test.question_ids)
          .split(",")
          .map((id) => Number(id.trim()))
      : [];
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

  const handleMapQuestionsSubmit = async () => {
    if (selectedQuestionIds.length === 0) {
      CommonMessage("warning", "Please select at least one question");
      return;
    }

    setButtonLoading(true);
    const today = new Date();
    const payload = {
      test_id: mappingTestId,
      questions: selectedQuestionIds.map((question_id) => ({ question_id })),
      created_date: formatToBackendIST(today),
    };

    try {
      await mapQuestionsToTest(payload);
      CommonMessage("success", "Questions mapped successfully!");
      getTestsData();
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

  return (
    <div>
      <Row>
        <Col xs={12} sm={12} md={12} lg={12}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <IoArrowBackOutline
              size={30}
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (isHistory == false) {
                  navigate("/tests");
                } else {
                  setIsHistory(false);
                }
              }}
            />
            <p className="common_heading">OnDemand Tests</p>
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
            onClick={() => setIsOpenAddTestModal(true)}
          >
            Create Test
          </button>
        </Col>
      </Row>

      {isHistory == false ? (
        <Row
          gutter={[
            { xs: 16, sm: 16, md: 16, lg: 16 },
            { xs: 16, sm: 16, md: 16, lg: 24 },
          ]}
          className="assignments_count_cards_main_container"
        >
          {testsData.length >= 1 ? (
            <>
              {testsData.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    <Col xs={24} sm={24} md={24} lg={12}>
                      <div className="test_topics_cards">
                        <div className="ondemand_tests_question_batch_main_container">
                          <div className="ondemand_tests_question_batch_container">
                            <p>{item.question_count || 0} questions</p>
                          </div>
                        </div>
                        <div className="ondemand_tests_icon_container">
                          <AiOutlineEdit
                            size={16}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditTestId(item.id);
                              setTestName(item.test_name);
                              setDuration(
                                item.duration ? String(item.duration) : "",
                              );
                              setIsOpenAddTestModal(true);
                            }}
                          />
                        </div>
                        <div className="test_topicscards_header_container">
                          <div className="tests_topiccards_header_icon_container">
                            <HiOutlineClipboard color="#667085" size={22} />
                          </div>
                          <p className="tests_topiccards_header_heading">
                            {item.test_name}
                          </p>
                        </div>

                        <div className="test_topicscards_footer_container">
                          <button
                            key="cancel"
                            className="coursereviews_rating_modal_btn coursereviews_rating_modal_cancelbutton"
                            onClick={() => {
                              setIsHistory(true);
                            }}
                          >
                            View History
                          </button>

                          <button
                            className="coursereviews_rating_modal_btn coursereviews_rating_modal_cancelbutton"
                            onClick={() => handleOpenMapDrawer(item)}
                          >
                            Map Question
                          </button>

                          <button
                            key="create"
                            type="primary"
                            className="coursereviews_rating_modal_btn coursereviews_rating_modal_submitbutton"
                            onClick={() =>
                              navigate(
                                `/test-attempt/${item.test_name}/${item.id}`,
                                { state: { duration: item.duration } }
                              )
                            }
                          >
                            Retake Test
                          </button>
                        </div>
                      </div>
                    </Col>
                  </React.Fragment>
                );
              })}
            </>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <CommonNodataFound message="No tests found" />
            </div>
          )}
        </Row>
      ) : (
        <>
          <Row gutter={16} className="assignments_count_cards_main_container">
            <Col xs={24} sm={24} md={16} lg={8}>
              <CommonInputField
                placeholder="Search for Test"
                prefix={<CiSearch size={18} />}
              />
            </Col>
          </Row>

          <Row
            gutter={[
              { xs: 16, sm: 16, md: 16, lg: 16 },
              { xs: 16, sm: 16, md: 16, lg: 24 },
            ]}
            className="assignments_count_cards_main_container"
          >
            {historyData.map((item, index) => {
              return (
                <React.Fragment key={index}>
                  <Col xs={24} sm={24} md={24} lg={12} xl={8} xxl={8}>
                    <div className="testhistory_cards">
                      <div className="test_history_cards_header_container">
                        <p className="tests_topiccards_header_heading">
                          {item.name}
                        </p>
                        <IoIosCheckmarkCircle size={24} color="#039855" />
                      </div>

                      <div className="test_history_card_tag_main_container">
                        <div className="test_history_card_tag_row_div">
                          <div className="test_history_card_typetag_div">
                            On Demand Test
                          </div>
                          <div className="test_history_card_datetag_div">
                            Conducted on Jan 10 2026
                          </div>
                        </div>

                        <div className="test_history_card_timetag_container">
                          03:43 PM
                        </div>

                        <div style={{ marginTop: "12px" }}>
                          <button className="test_history_card_viewresult_button">
                            View Result
                          </button>
                        </div>
                      </div>
                    </div>
                  </Col>
                </React.Fragment>
              );
            })}
          </Row>
        </>
      )}

      {/* add test modal */}
      <Modal
        title={"Add New Test"}
        open={isOpenAddTestModal}
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
              onClick={handleCreateTest}
              className="courses_addmodule_modal_createbutton"
            >
              {editTestId ? "Update" : "Create"}
            </Button>
          ),
        ]}
      >
        <div style={{ marginTop: "20px", marginBottom: "24px" }}>
          <CommonInputField
            label="Test Name"
            required={true}
            onChange={(e) => {
              setTestName(e.target.value);
              if (validationTrigger) {
                setTestNameError(addressValidator(e.target.value));
              }
            }}
            value={testName}
            error={testNameError}
          />

          <div style={{ marginTop: "20px" }}>
            <CommonInputField
              label="Duration (mins)"
              type="number"
              required={true}
              onChange={(e) => {
                setDuration(e.target.value);
                if (validationTrigger) {
                  setDurationError(selectValidator(String(e.target.value)));
                }
              }}
              value={duration}
              error={durationError}
            />
          </div>
        </div>
      </Modal>

      <Drawer
        title="Map Questions to Test"
        onClose={() => {
          setIsOpenMapQuestionDrawer(false);
          setSelectedQuestionIds([]);
          setSelectedQuestions([]);
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
