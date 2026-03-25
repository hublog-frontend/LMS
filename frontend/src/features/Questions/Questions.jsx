import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Space,
  Tooltip,
  Popconfirm,
  Drawer,
  Modal,
  Button,
  Table,
  Upload,
  Typography,
} from "antd";
import * as XLSX from "xlsx";
import {
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineCloudUpload,
  AiOutlineFileExcel,
  AiOutlineDownload,
  AiOutlinePlus,
} from "react-icons/ai";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import CommonTextArea from "../Common/CommonTextArea";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import CommonSpinner from "../Common/CommonSpinner";
import { addressValidator, selectValidator } from "../Common/Validation";
import {
  createCategory,
  createQuestion,
  deleteQuestion,
  getCategories,
  getQuestions,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import EllipsisTooltip from "../Common/EllipsisTooltip";

export default function Questions() {
  const { Dragger } = Upload;
  const { Text, Title, Paragraph } = Typography;

  const [questionsData, setQuestionsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [question, setQuestion] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionAError, setOptionAError] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionBError, setOptionBError] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionCError, setOptionCError] = useState("");
  const [optionD, setOptionD] = useState("");
  const [optionDError, setOptionDError] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [correctAnswerText, setCorrectAnswerText] = useState("");
  const [correctAnswerError, setCorrectAnswerError] = useState("");
  const [questionCategoryId, setQuestionCategoryId] = useState(null);
  const [questionCategoryIdError, setQuestionCategoryIdError] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  //category usestates
  const [categoriesData, setCategoriesData] = useState([]);
  const [categoryFilterId, setCategoryFilterId] = useState(null);
  const [isOpenCategoryModal, setIsOpenCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryNameError, setCategoryNameError] = useState("");
  const [questionTypeFilter, setQuestionTypeFilter] = useState(null);
  //bulk upload usesates
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkData, setBulkData] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState("");
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // coding question usestates
  const [questionType, setQuestionType] = useState("MCQ");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [constraints, setConstraints] = useState("");
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [difficulty, setDifficulty] = useState("EASY");
  const [testCases, setTestCases] = useState([
    { input: "", output: "", is_sample: true },
  ]);

  useEffect(() => {
    getQuestionsData(1, 10, null, null);
    getCategoriesData();
  }, []);

  const getQuestionsData = async (
    page,
    limit,
    categoryId,
    questionTypeFilter = null,
  ) => {
    setLoading(true);
    const payload = {
      page: page,
      pageSize: limit,
      category_id: categoryId,
      question_type: questionTypeFilter,
    };
    try {
      const response = await getQuestions(payload);
      console.log("get questions response", response);
      const questions_data = response?.data?.data?.questions || [];
      const pagination_data = response?.data?.data?.pagination || null;
      setQuestionsData(questions_data);
      setPagination({
        page: pagination_data?.page || 1,
        limit: pagination_data?.limit || 10,
        total: pagination_data?.total || 0,
        totalPages: pagination_data?.totalPages || 1,
      });
    } catch (error) {
      setQuestionsData([]);
      console.log("get questions error", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoriesData = async () => {
    try {
      const response = await getCategories();
      console.log("get categories response", response);
      const categories_data = response?.data?.result || [];
      setCategoriesData(categories_data);
    } catch (error) {
      setCategoriesData([]);
      console.log("get categories error", error);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      page: page,
      limit: limit,
    });
    getQuestionsData(page, limit, categoryFilterId, questionTypeFilter);
  };

  const getColumns = () => {
    const commonColumns = [
      {
        title: "Question Name",
        dataIndex: "question",
        key: "question",
        width: 220,
        render: (text) => <EllipsisTooltip text={text ? text : "-"} />,
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
      {
        title: "Category",
        dataIndex: "category_name",
        key: "category_name",
        width: 150,
        render: (text) => <EllipsisTooltip text={text ? text : "-"} />,
      },
    ];

    let typeSpecificColumns = [];

    if (questionTypeFilter === "CODING") {
      typeSpecificColumns = [
        {
          title: "Difficulty",
          dataIndex: "difficulty",
          key: "difficulty",
          width: 100,
          render: (text) => (
            <span
              style={{
                color:
                  text === "HARD"
                    ? "#f5222d"
                    : text === "MEDIUM"
                      ? "#fa8c16"
                      : "#52c41a",
                fontWeight: "600",
              }}
            >
              {text}
            </span>
          ),
        },
        {
          title: "Sample Input",
          dataIndex: "sample_input",
          key: "sample_input",
          width: 150,
          render: (text) => <EllipsisTooltip text={text || "-"} />,
        },
        {
          title: "Sample Output",
          dataIndex: "sample_output",
          key: "sample_output",
          width: 150,
          render: (text) => <EllipsisTooltip text={text || "-"} />,
        },
      ];
    } else {
      // Show MCQ columns if filtered by MCQ OR if no filter is applied
      typeSpecificColumns = [
        {
          title: "Option A",
          dataIndex: "option_a",
          key: "option_a",
          width: 150,
          render: (text) => <EllipsisTooltip text={text ? text : "-"} />,
        },
        {
          title: "Option B",
          dataIndex: "option_b",
          key: "option_b",
          width: 150,
          render: (text) => <EllipsisTooltip text={text ? text : "-"} />,
        },
        {
          title: "Option C",
          dataIndex: "option_c",
          key: "option_c",
          width: 150,
          render: (text) => <EllipsisTooltip text={text ? text : "-"} />,
        },
        {
          title: "Option D",
          dataIndex: "option_d",
          key: "option_d",
          width: 150,
          render: (text) => <EllipsisTooltip text={text ? text : "-"} />,
        },
        {
          title: "Correct Answer",
          dataIndex: "correct_answer",
          key: "correct_answer",
          width: 150,
          render: (text) => <EllipsisTooltip text={text ? text : "-"} />,
        },
      ];
    }

    const actionColumn = {
      title: "Action",
      key: "action",
      width: 100,
      fixed: "right",
      render: (text, record) => (
        <Space size="middle">
          <Tooltip title="Edit Question">
            <AiOutlineEdit size={18} style={{ cursor: "pointer" }} />
          </Tooltip>
          <Popconfirm
            title="Are you sure to delete?"
            onConfirm={() => handleQuestionDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Question">
              <span className="action-delete-icon">
                <AiOutlineDelete size={18} />
              </span>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    };

    return [...commonColumns, ...typeSpecificColumns, actionColumn];
  };

  const handleSubmit = async () => {
    const questionValidate = addressValidator(question);
    const categoryIdValidate = selectValidator(questionCategoryId);
    setQuestionError(questionValidate);
    setQuestionCategoryIdError(categoryIdValidate);

    let isValid = !questionValidate && !categoryIdValidate;

    if (questionType === "MCQ") {
      const optionAValidate = selectValidator(optionA);
      const optionBValidate = selectValidator(optionB);
      const optionCValidate = selectValidator(optionC);
      const optionDValidate = selectValidator(optionD);
      const correctAnswerValidate = selectValidator(correctAnswer);

      setOptionAError(optionAValidate);
      setOptionBError(optionBValidate);
      setOptionCError(optionCValidate);
      setOptionDError(optionDValidate);
      setCorrectAnswerError(correctAnswerValidate);

      if (
        optionAValidate ||
        optionBValidate ||
        optionCValidate ||
        optionDValidate ||
        correctAnswerValidate
      ) {
        isValid = false;
      }
    } else {
      const descriptionValidate = addressValidator(description);
      setDescriptionError(descriptionValidate);
      if (descriptionValidate) {
        isValid = false;
      }
    }

    if (!isValid) return;

    setButtonLoading(true);
    const payload = {
      questions: [
        {
          question: question,
          question_type: questionType,
          category_id: questionCategoryId,
          ...(questionType === "MCQ"
            ? {
                option_a: optionA,
                option_b: optionB,
                option_c: optionC,
                option_d: optionD,
                correct_answer: correctAnswerText,
              }
            : {
                description: description,
                constraints: constraints,
                difficulty: difficulty,
                sample_input: sampleInput,
                sample_output: sampleOutput,
              }),
        },
      ],
    };
    try {
      await createQuestion(payload);
      setTimeout(() => {
        CommonMessage("success", "Question Uploaded Successfully!");
        getQuestionsData(
          pagination.page,
          pagination.limit,
          categoryFilterId,
          questionTypeFilter,
        );
        formReset();
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

  const handleBulkUploadClick = () => {
    setIsBulkModalOpen(true);
    setBulkErrors([]);
    setBulkData([]);
    setSelectedFileName("");
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        Question: "",
        Category: "",
        "Question Type": "MCQ", // or "CODING"
        "Option A": "",
        "Option B": "",
        "Option C": "",
        "Option D": "",
        "Correct Answer": "",
        Description: "",
        Constraints: "",
        Difficulty: "EASY",
        "Sample Input": "",
        "Sample Output": "",
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Questions_Template.xlsx");
  };

  const handleFileDrop = (file) => {
    if (!file) return;

    setSelectedFileName(file.name);
    setBulkErrors([]);
    setBulkData([]);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const errors = [];
        const formattedQuestions = [];

        jsonData.forEach((row, index) => {
          const rowNum = index + 2;

          let q = row["Question"] || row["question"] || "";
          let cat = row["Category"] || row["category"] || "";
          let type = row["Question Type"] || row["question_type"] || "MCQ";
          let testCasesText = row["Test Cases"] || row["test_cases"] || "";
          let a = row["Option A"] || row["option_a"] || "";
          let b = row["Option B"] || row["option_b"] || "";
          let c = row["Option C"] || row["option_c"] || "";
          let d = row["Option D"] || row["option_d"] || "";
          let ca = row["Correct Answer"] || row["correct_answer"] || "";
          let desc = row["Description"] || row["description"] || "";
          let constr = row["Constraints"] || row["constraints"] || "";
          let diff = row["Difficulty"] || row["difficulty"] || "EASY";
          let si = row["Sample Input"] || row["sample_input"] || "";
          let so = row["Sample Output"] || row["sample_output"] || "";

          q = String(q).trim();
          type = String(type).trim().toUpperCase();
          a = String(a).trim();
          b = String(b).trim();
          c = String(c).trim();
          d = String(d).trim();
          ca = String(ca).trim();
          desc = String(desc).trim();
          constr = String(constr).trim();
          diff = String(diff).trim().toUpperCase();
          si = String(si).trim();
          so = String(so).trim();

          // if entirely empty, skip
          if (!q && !a && !b && !c && !d && !ca) return;

          let rowErrors = [];
          if (!q) rowErrors.push("Question is required");

          if (type === "MCQ") {
            if (!a) rowErrors.push("Option A is required");
            if (!b) rowErrors.push("Option B is required");
            if (!c) rowErrors.push("Option C is required");
            if (!d) rowErrors.push("Option D is required");
            if (!ca) rowErrors.push("Correct Answer is required");

            if (ca && ca !== a && ca !== b && ca !== c && ca !== d) {
              rowErrors.push(
                "Correct Answer must exactly match the text of one of the options",
              );
            }
          } else if (type === "CODING") {
            if (!desc) rowErrors.push("Description is required");
          }

          if (rowErrors.length > 0) {
            errors.push({
              key: rowNum,
              row: `Row ${rowNum}`,
              error: rowErrors.join(", "),
            });
          } else {
            const matchedCategory = categoriesData.find(
              (c) => c.name.toLowerCase() === cat.toLowerCase(),
            );

            formattedQuestions.push({
              question: q,
              question_type: type,
              category_id: matchedCategory ? matchedCategory.id : null,
              option_a: type === "MCQ" ? a : null,
              option_b: type === "MCQ" ? b : null,
              option_c: type === "MCQ" ? c : null,
              option_d: type === "MCQ" ? d : null,
              correct_answer: type === "MCQ" ? ca : null,
              description: type === "CODING" ? desc : null,
              constraints: type === "CODING" ? constr : null,
              difficulty: type === "CODING" ? diff : "EASY",
              sample_input: type === "CODING" ? si : null,
              sample_output: type === "CODING" ? so : null,
            });
          }
        });

        if (errors.length > 0) {
          setBulkErrors(errors);
          setBulkData([]);
        } else if (formattedQuestions.length === 0) {
          CommonMessage("error", "No valid questions found in the file.");
        } else {
          setBulkData(formattedQuestions);
        }
      } catch (error) {
        console.error(error);
        CommonMessage("error", "Failed to parse the excel file.");
      }
    };
    reader.onerror = () => {
      CommonMessage("error", "Error reading the file.");
    };
  };

  const handleBulkSubmit = async () => {
    if (bulkData.length === 0) {
      CommonMessage("error", "No valid data to upload.");
      return;
    }

    setBulkLoading(true);
    const payload = { questions: bulkData };

    try {
      await createQuestion(payload);
      setTimeout(() => {
        CommonMessage(
          "success",
          `${bulkData.length} Questions Uploaded Successfully!`,
        );
        getQuestionsData(
          pagination.page,
          pagination.limit,
          categoryFilterId,
          questionTypeFilter,
        );
        setIsBulkModalOpen(false);
      }, 300);
    } catch (error) {
      console.error(error);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Failed to upload bulk questions. Please try again.",
      );
    } finally {
      setBulkLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    const categoryNameValidate = addressValidator(categoryName);

    setCategoryNameError(categoryNameValidate);

    if (categoryNameValidate) return;

    setButtonLoading(true);
    const payload = {
      category_name: categoryName,
    };

    try {
      await createCategory(payload);
      setTimeout(() => {
        CommonMessage("success", "Category Created Successfully!");
        formReset();
        getCategoriesData();
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

  const handleQuestionDelete = async (question_id) => {
    // Simulate deleting a question
    try {
      await deleteQuestion(question_id);
      setTimeout(() => {
        getQuestionsData(pagination.page, pagination.limit, categoryFilterId);
        CommonMessage("success", `Question Deleted Successfully!`);
      }, 300);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const formReset = () => {
    setIsOpenAddDrawer(false);
    setIsOpenCategoryModal(false);
    setButtonLoading(false);
    setQuestion("");
    setQuestionError("");
    setOptionA("");
    setOptionAError("");
    setOptionB("");
    setOptionBError("");
    setOptionC("");
    setOptionCError("");
    setOptionD("");
    setOptionDError("");
    setCorrectAnswer("");
    setCorrectAnswerText("");
    setCorrectAnswerError("");
    setCategoryName("");
    setCategoryNameError("");
    setQuestionCategoryId(null);
    setQuestionCategoryIdError("");
    setQuestionType("MCQ");
    setDescription("");
    setDescriptionError("");
    setConstraints("");
    setSampleInput("");
    setSampleOutput("");
    setDifficulty("EASY");
    setTestCases([{ input: "", output: "", is_sample: false }]);
  };

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: "", output: "", is_sample: false }]);
  };

  const handleRemoveTestCase = (index) => {
    const list = [...testCases];
    list.splice(index, 1);
    setTestCases(list);
  };

  const handleTestCaseChange = (index, field, value) => {
    const list = [...testCases];
    list[index][field] = value;
    setTestCases(list);
  };

  return (
    <div className="questions_main_container">
      <Row className="questions_header_row">
        <Col xs={12} sm={12} md={12} lg={12}>
          <p className="common_heading questions_heading_margin">Questions</p>
        </Col>

        <Col
          xs={12}
          sm={12}
          md={12}
          lg={12}
          className="courses_createmodule_button_container"
        >
          {/* <div className="questions_create_button_col_inner"> */}
          <button
            className="courses_createcourse_button"
            onClick={() => {
              setIsOpenCategoryModal(true);
            }}
          >
            Create Category
          </button>
          <button
            className="courses_createcourse_button"
            onClick={handleBulkUploadClick}
          >
            Bulk Upload
          </button>
          <button
            className="courses_createcourse_button"
            onClick={() => {
              setIsOpenAddDrawer(true);
            }}
          >
            Create Question
          </button>
          {/* </div> */}
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={12} sm={12} md={12} lg={4}>
          <CommonSelectField
            label="Category"
            isFilterField={true}
            options={categoriesData}
            onChange={(e) => {
              setCategoryFilterId(e.target.value);
              getQuestionsData(
                1,
                pagination.limit,
                e.target.value,
                questionTypeFilter,
              );
            }}
            value={categoryFilterId}
          />
        </Col>
        <Col xs={12} sm={12} md={12} lg={4}>
          <CommonSelectField
            label="Question Type"
            isFilterField={true}
            options={[
              { id: "MCQ", name: "Multiple Choice Question" },
              { id: "CODING", name: "Coding Question" },
            ]}
            onChange={(e) => {
              setQuestionTypeFilter(e.target.value);
              getQuestionsData(
                1,
                pagination.limit,
                categoryFilterId,
                e.target.value,
              );
            }}
            value={questionTypeFilter}
          />
        </Col>
      </Row>
      <div className="questions_table_container">
        <CommonTable
          columns={getColumns()}
          scroll={{ x: 1200 }}
          dataSource={questionsData}
          size={"small"}
          loading={loading}
          checkBox="false"
          onPaginationChange={handlePaginationChange}
          limit={pagination.limit}
          page_number={pagination.page}
          totalPageNumber={pagination.total}
        />
      </div>

      <Modal
        open={isBulkModalOpen}
        onCancel={() => {
          setIsBulkModalOpen(false);
        }}
        footer={null}
        width={550}
        closeIcon={false}
        className="questions-bulk-modal"
      >
        <div className="questions-modal-body">
          <div className="questions-modal-header">
            <div>
              <Title level={4} className="questions-modal-title">
                Bulk Upload Questions
              </Title>
              <Text type="secondary" className="questions-modal-subtitle">
                Import questions using an Excel file.
              </Text>
            </div>
            <Button
              icon={<AiOutlineDownload size={16} />}
              onClick={handleDownloadTemplate}
              type="dashed"
              size="small"
              className="questions-download-template-btn"
            >
              Template
            </Button>
          </div>

          <Dragger
            accept=".xlsx, .xls, .csv"
            showUploadList={false}
            beforeUpload={(file) => {
              handleFileDrop(file);
              return false; // Prevent default upload
            }}
            className="questions-dragger"
          >
            <p className="ant-upload-drag-icon questions-dragger-icon-wrapper">
              <AiOutlineCloudUpload size={42} color="#2160ad" />
            </p>
            <p className="ant-upload-text questions-dragger-text">
              Click or drag file to upload
            </p>
            <p className="ant-upload-hint questions-dragger-hint">
              Supported formats: .xlsx, .xls, .csv
            </p>
          </Dragger>

          {selectedFileName && (
            <div
              className={`questions-file-status ${
                bulkErrors.length > 0
                  ? "questions-file-status-invalid"
                  : "questions-file-status-valid"
              }`}
            >
              <Space size="middle">
                <AiOutlineFileExcel
                  size={20}
                  color={bulkErrors.length > 0 ? "#ff4d4f" : "#52c41a"}
                />
                <Text strong className="questions-file-name">
                  {selectedFileName}
                </Text>
              </Space>
              {bulkErrors.length === 0 && bulkData.length > 0 && (
                <Text
                  type="success"
                  strong
                  className="questions-file-status-text"
                >
                  {bulkData.length} valid questions ready
                </Text>
              )}
            </div>
          )}

          {bulkErrors.length > 0 && (
            <div className="questions-error-container">
              <div className="questions-error-header">
                <div className="questions-error-title-wrapper">
                  <div className="questions-error-dot"></div>
                  <Text type="danger" strong className="questions-error-title">
                    Validation Errors ({bulkErrors.length})
                  </Text>
                </div>
                <Paragraph type="danger" className="questions-error-desc">
                  Please fix the following issues in your file and try uploading
                  again.
                </Paragraph>
              </div>
              <Table
                dataSource={bulkErrors}
                pagination={{ pageSize: 3, size: "small" }}
                size="small"
                columns={[
                  {
                    title: "Row",
                    dataIndex: "row",
                    key: "row",
                    width: 70,
                    align: "center",
                    render: (text) => (
                      <Text strong className="questions-error-row-text">
                        {text.replace("Row ", "")}
                      </Text>
                    ),
                  },
                  {
                    title: "Issues Found",
                    dataIndex: "error",
                    key: "error",
                    render: (text) => (
                      <Text className="questions-error-issue-text">{text}</Text>
                    ),
                  },
                ]}
                className="questions-error-table"
              />
            </div>
          )}

          <div className="questions-modal-footer">
            <Button
              onClick={() => setIsBulkModalOpen(false)}
              className="questions-modal-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={bulkLoading}
              onClick={handleBulkSubmit}
              className={`questions-modal-upload-btn ${
                bulkData.length === 0 || bulkErrors.length > 0
                  ? ""
                  : "questions-modal-upload-btn-active"
              }`}
            >
              Upload Questions
            </Button>
          </div>
        </div>
      </Modal>

      {/* create question drawer */}
      <Drawer
        title="Create a new Question"
        onClose={formReset}
        open={isOpenAddDrawer}
        size={"40%"}
        className="courses_createcourses_drawer questions-drawer"
      >
        <div className="questions-drawer-body">
          <div className="questions-drawer-field">
            <CommonSelectField
              label="Question Type"
              required={true}
              options={[
                { id: "MCQ", name: "Multiple Choice Question" },
                { id: "CODING", name: "Coding Question" },
              ]}
              onChange={(e) => {
                setQuestionType(e.target.value);
              }}
              value={questionType}
            />
          </div>

          <div className="questions-drawer-field-mt">
            <CommonSelectField
              label="Category"
              required={true}
              options={categoriesData}
              onChange={(e) => {
                setQuestionCategoryId(e.target.value);
                setQuestionCategoryIdError(selectValidator(e.target.value));
              }}
              value={questionCategoryId}
              error={questionCategoryIdError}
            />
          </div>

          <div className="questions-drawer-field-mt">
            <CommonTextArea
              label={questionType === "MCQ" ? "Question" : "Question Title"}
              required={true}
              onChange={(e) => {
                setQuestion(e.target.value);
                setQuestionError(addressValidator(e.target.value));
              }}
              value={question}
              error={questionError}
            />
          </div>

          {questionType === "CODING" && (
            <>
              <div className="questions-drawer-field-mt">
                <CommonTextArea
                  label="Description"
                  required={true}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setDescriptionError(addressValidator(e.target.value));
                  }}
                  value={description}
                  error={descriptionError}
                />
              </div>

              <div className="questions-drawer-field-mt">
                <CommonSelectField
                  label="Difficulty"
                  required={true}
                  options={[
                    { id: "EASY", name: "Easy" },
                    { id: "MEDIUM", name: "Medium" },
                    { id: "HARD", name: "Hard" },
                  ]}
                  onChange={(e) => setDifficulty(e.target.value)}
                  value={difficulty}
                />
              </div>

              <div className="questions-drawer-field-mt">
                <CommonTextArea
                  label="Constraints"
                  onChange={(e) => setConstraints(e.target.value)}
                  value={constraints}
                />
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <div className="questions-drawer-field-mt">
                    <CommonTextArea
                      label="Sample Input"
                      onChange={(e) => setSampleInput(e.target.value)}
                      value={sampleInput}
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div className="questions-drawer-field-mt">
                    <CommonTextArea
                      label="Sample Output"
                      onChange={(e) => setSampleOutput(e.target.value)}
                      value={sampleOutput}
                    />
                  </div>
                </Col>
              </Row>
            </>
          )}

          {questionType === "MCQ" && (
            <>
              <div className="questions-drawer-field-mt">
                <CommonInputField
                  label="Option A"
                  required={true}
                  onChange={(e) => {
                    setOptionA(e.target.value);
                    setCorrectAnswer("");
                    setOptionAError(selectValidator(e.target.value));
                  }}
                  value={optionA}
                  error={optionAError}
                />
              </div>
              <div className="questions-drawer-field-mt">
                <CommonInputField
                  label="Option B"
                  required={true}
                  onChange={(e) => {
                    setOptionB(e.target.value);
                    setCorrectAnswer("");
                    setOptionBError(selectValidator(e.target.value));
                  }}
                  value={optionB}
                  error={optionBError}
                />
              </div>
              <div className="questions-drawer-field-mt">
                <CommonInputField
                  label="Option C"
                  required={true}
                  onChange={(e) => {
                    setOptionC(e.target.value);
                    setCorrectAnswer("");
                    setOptionCError(selectValidator(e.target.value));
                  }}
                  value={optionC}
                  error={optionCError}
                />
              </div>
              <div className="questions-drawer-field-mt">
                <CommonInputField
                  label="Option D"
                  required={true}
                  onChange={(e) => {
                    setOptionD(e.target.value);
                    setCorrectAnswer("");
                    setOptionDError(selectValidator(e.target.value));
                  }}
                  value={optionD}
                  error={optionDError}
                />
              </div>
              <div className="questions-drawer-field-mt">
                <CommonSelectField
                  label="Correct Answer"
                  required={true}
                  options={[
                    { id: "Option A", name: "Option A" },
                    { id: "Option B", name: "Option B" },
                    { id: "Option C", name: "Option C" },
                    { id: "Option D", name: "Option D" },
                  ]}
                  onChange={(e) => {
                    const value = e.target.value;
                    const answer =
                      value == "Option A"
                        ? optionA
                        : value == "Option B"
                          ? optionB
                          : value == "Option C"
                            ? optionC
                            : value == "Option D"
                              ? optionD
                              : "";
                    setCorrectAnswer(value);
                    setCorrectAnswerText(answer);
                    setCorrectAnswerError(selectValidator(value));
                  }}
                  value={correctAnswer}
                  error={correctAnswerError}
                />
              </div>
            </>
          )}
        </div>

        {/* footer */}
        <div className="courses_createcourses_drawer_footer">
          <div className="courses_createcourses_drawer_submit_buttoncontainer">
            {buttonLoading ? (
              <button className="courses_createcourses_drawer_loadingsubmitbutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="courses_createcourses_drawer_submitbutton"
                onClick={handleSubmit}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </Drawer>

      {/* add category modal */}
      <Modal
        title={"Add New Category"}
        open={isOpenCategoryModal}
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
              onClick={handleCreateCategory}
              className="courses_addmodule_modal_createbutton"
            >
              Create
            </Button>
          ),
        ]}
      >
        <div style={{ marginTop: "20px", marginBottom: "24px" }}>
          <CommonInputField
            label="Category Name"
            required={true}
            onChange={(e) => {
              setCategoryName(e.target.value);
              setCategoryNameError(addressValidator(e.target.value));
            }}
            value={categoryName}
            error={categoryNameError}
          />
        </div>
      </Modal>
    </div>
  );
}
