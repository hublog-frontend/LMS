import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Select,
  Radio,
  Tooltip,
  Modal,
} from "antd";
import {
  AiOutlineCloseCircle,
  AiOutlineFullscreen,
  AiOutlineHistory,
  AiOutlineArrowLeft,
  AiOutlineCode,
  AiOutlineWarning,
} from "react-icons/ai";
import {
  runCode,
  submitCode,
  getTestQuestionsData,
  insertTestResult,
  insertAssignmentAnswer,
} from "../ApiService/action";
import { formatToBackendIST } from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import "./TestAttempt.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const LANGUAGE_TEMPLATES = {
  Java: `class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
  Python: `# Your code here\nprint("Hello World")`,
  Cpp: `#include <iostream>\n\nint main() {\n    // Your code here\n    return 0;\n}`,
  Javascript: `// Your code here\nconsole.log("Hello World")`,
};

const AssignmentPractice = () => {
  const { testName, testId } = useParams();
  const navigate = useNavigate();

  const location = useLocation();
  const testDurationMinutes = location.state?.duration || 30;

  // States
  const [showInstructions, setShowInstructions] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // Stores answers by question ID
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("Java");
  const [executing, setExecuting] = useState(false);
  const [output, setOutput] = useState(null); // Stores { stdout, stderr, run }
  const [userOutputs, setUserOutputs] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showWrongModal, setShowWrongModal] = useState(false);

  const currentQuestion = questions[0]; // Only show the first (or single) question

  // Fetch Real Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setQuestions([location?.state?.question_item]);
      //  setQuestions([location?.state?.question_item]);
    };
    fetchQuestions();
  }, []);

  // Removed Tab Switch / Proctoring for Practice Mode

  // Removed submission logic for Practice Mode

  // Timer calculation - Count up from 0
  useEffect(() => {
    if (!showInstructions) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showInstructions]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleStartTest = () => {
    setShowInstructions(false);
    // Logic for Full Screen could go here
  };

  const handleQuitTest = () => {
    navigate("/tests");
  };

  // Removed navigation logic for single question mode

  const handleAnswerChange = (value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleLanguageChange = (value) => {
    setSelectedLanguage(value);
    // If no answer yet, set initial template
    if (!userAnswers[currentQuestion.id]) {
      handleAnswerChange(LANGUAGE_TEMPLATES[value]);
    }
  };

  const onRunCode = async () => {
    const code =
      userAnswers[currentQuestion.id] || LANGUAGE_TEMPLATES[selectedLanguage];
    if (!code) return;

    setExecuting(true);
    setOutput(null);

    try {
      const payload = {
        language: selectedLanguage.toLowerCase(),
        sourceCode: code,
        stdin: currentQuestion.sample_input || "",
      };

      const resp = await runCode(payload);
      if (resp?.data?.data) {
        setOutput(resp.data.data);
        setUserOutputs((prev) => ({
          ...prev,
          [currentQuestion.id]: resp.data.data.stdout || "",
        }));
      } else {
        CommonMessage("error", "Failed to get execution results");
      }
    } catch (error) {
      console.error(error);
      CommonMessage(
        "error",
        error.response?.data?.message || "Execution Error",
      );
    } finally {
      setExecuting(false);
    }
  };

  const onSubmitCode = async () => {
    // Current setup just runs code. Later we can add specific test-case validations.
    onRunCode();
    CommonMessage("success", "Code output displayed!");
  };

  if (loading) {
    return (
      <div className="test-instructions-overlay">
        <Title level={3} style={{ color: "white" }}>
          {userAnswers[currentQuestion.id]
            ? "Submitting..."
            : "Loading Test..."}
        </Title>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="test-instructions-overlay">
        <Title level={3} style={{ color: "white" }}>
          No questions found for this test.
        </Title>
      </div>
    );
  }

  const handleSubmitAssignment = async () => {
    const isCoding = currentQuestion.question_type === "CODING";
    const answer = userAnswers[currentQuestion.id];

    if (!isCoding && !answer) {
      CommonMessage("warning", "Please select an answer before submitting.");
      return;
    }

    if (
      isCoding &&
      (!answer || answer === LANGUAGE_TEMPLATES[selectedLanguage])
    ) {
      CommonMessage(
        "warning",
        "Please write and run your code before submitting.",
      );
      return;
    }

    setLoading(true);
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const user = JSON.parse(getloginUserDetails || "{}");

    const userOutput = userOutputs[currentQuestion.id] || "";

    let scoreObtained = 0;

    if (isCoding) {
      const expectedOutput = String(currentQuestion.sample_output || "")
        .replace(/^"|"$/g, "")
        .trim();
      const actualOutput = String(userOutput).replace(/^"|"$/g, "").trim();
      if (
        expectedOutput !== "" &&
        actualOutput !== "" &&
        expectedOutput === actualOutput
      ) {
        scoreObtained = 10;
      }
    } else {
      if (answer === currentQuestion.correct_answer) {
        scoreObtained = 2;
      }
    }

    const payload = {
      user_id: user?.id,
      module_question_id: currentQuestion?.mq_id,
      submitted_code: isCoding ? answer : null,
      result_output: isCoding ? userOutput : answer,
      language: isCoding ? selectedLanguage.toUpperCase() : null,
      score_obtained: scoreObtained,
      submitted_at: formatToBackendIST(new Date()),
      time_taken: timeElapsed,
    };

    try {
      await insertAssignmentAnswer(payload);
      if (scoreObtained > 0 || isCoding) {
        CommonMessage("success", "Assignment submitted successfully!");
        navigate(`/assignments`);
      } else {
        setShowWrongModal(true);
      }
    } catch (error) {
      console.error(error);
      CommonMessage("error", "Failed to submit assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-attempt-container">
      {/* Header */}
      <div className="test-attempt-header">
        <Title level={3} style={{ margin: 0 }}>
          {(location?.state?.module_item?.module_name || "") +
            " Assignment"}{" "}
        </Title>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {currentQuestion.question_type === "CODING" && (
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <Button
                className="submit-section-btn"
                onClick={() => handleSubmitAssignment()}
              >
                Submit & End section
              </Button>
            </div>
          )}
        </div>
      </div>

      {currentQuestion.question_type === "CODING" ? (
        <div className="test-coding-layout">
          {/* Column 1: Problem */}
          <div className="test-problem-sidebar">
            <Title level={4}>Problem</Title>
            <Paragraph>{currentQuestion.description}</Paragraph>

            <Title level={5} style={{ marginTop: "20px" }}>
              Input Format
            </Title>
            <Paragraph>{currentQuestion.input_format}</Paragraph>

            <Title level={5}>Output Format</Title>
            <Paragraph>{currentQuestion.output_format}</Paragraph>

            <Title level={5}>Sample Inputs & Outputs</Title>
            <div className="sample-case-card">
              <div className="sample-case-label">Sample Input</div>
              <div className="sample-case-box">
                {currentQuestion.sample_input}
              </div>
            </div>
            <div className="sample-case-card">
              <div className="sample-case-label">Sample Output</div>
              <div className="sample-case-box">
                {currentQuestion.sample_output}
              </div>
            </div>

            {currentQuestion.constraints && (
              <>
                <Title level={5}>Constraints</Title>
                <Paragraph>{currentQuestion.constraints}</Paragraph>
              </>
            )}
          </div>

          {/* Column 2: Editor */}
          <div className="test-editor-container">
            <div className="test-editor-header">
              <Text>{currentQuestion.category_name || "Coding Question"}</Text>
              <Space>{/* Navigation buttons removed */}</Space>
            </div>

            <div style={{ padding: "12px 20px", background: "#f9fafb" }}>
              <Select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                style={{ width: 120 }}
              >
                <Option value="Java">Java</Option>
                <Option value="Python">Python</Option>
                <Option value="Cpp">C++</Option>
                <Option value="Javascript">Javascript</Option>
              </Select>
            </div>

            <div style={{ flex: 1, padding: "12px 20px" }}>
              <textarea
                style={{
                  width: "100%",
                  height: "100%",
                  border: "1px solid #d0d5dd",
                  borderRadius: "4px",
                  padding: "16px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  outline: "none",
                  resize: "none",
                  background: "#1e1e1e",
                  color: "#d4d4d4",
                }}
                spellCheck={false}
                placeholder="// Start coding here..."
                value={
                  userAnswers[currentQuestion.id] ||
                  LANGUAGE_TEMPLATES[selectedLanguage]
                }
                onChange={(e) => handleAnswerChange(e.target.value)}
              />
            </div>

            {output && (
              <div
                style={{
                  padding: "16px 20px",
                  background: "#1e1e1e",
                  borderTop: "1px solid #333",
                  maxHeight: "150px",
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    marginBottom: "8px",
                    color: "#858585",
                  }}
                >
                  <AiOutlineCode />{" "}
                  <Text style={{ color: "#858585", fontSize: "12px" }}>
                    Output
                  </Text>
                </div>
                {output.stderr ? (
                  <pre
                    style={{ color: "#f85149", margin: 0, fontSize: "12px" }}
                  >
                    {output.stderr}
                  </pre>
                ) : (
                  <pre
                    style={{ color: "#7ee787", margin: 0, fontSize: "12px" }}
                  >
                    {output.stdout || "No output returned"}
                  </pre>
                )}
              </div>
            )}

            <div className="test-editor-footer">
              <Button
                type="default"
                style={{
                  background: "#039855",
                  color: "white",
                  border: "none",
                }}
                onClick={onRunCode}
                loading={executing}
              >
                Run code
              </Button>
              <Button
                type="primary"
                style={{ background: "#175cd3" }}
                onClick={() => handleSubmitAssignment()}
                loading={loading}
              >
                Submit code
              </Button>
            </div>
          </div>

          {/* Column 3: Status Sidebar */}
          <div className="test-status-sidebar">
            <div
              style={{
                background: "#f9fafb",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #eaecf0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space>
                <AiOutlineHistory />{" "}
                <Text strong>{location?.state?.module_item?.module_name}</Text>
              </Space>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  flexShrink: 0,
                }}
              >
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Time spent
                </Text>
                <Text strong style={{ whiteSpace: "nowrap" }}>
                  {formatTime(timeElapsed)}
                </Text>
              </div>
            </div>

            {/* Questions navigation grid removed */}

            <div
              style={{
                marginTop: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#039855",
                  }}
                ></div>
                <Text style={{ fontSize: "14px" }}>Answered</Text>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#f79009",
                  }}
                ></div>
                <Text style={{ fontSize: "14px" }}>Not Answered</Text>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#f9fafb",
                    border: "1px solid #d0d5dd",
                  }}
                ></div>
                <Text style={{ fontSize: "14px" }}>Not Visited</Text>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MCQ VIEW */
        <div className="test-mcq-container">
          <Card className="test-mcq-card" styles={{ body: { padding: 0 } }}>
            <div className="test-mcq-header">
              <Text strong style={{ color: "white" }}>
                {currentQuestion.category_name} MCQ
              </Text>
              <div
                style={{ display: "flex", gap: "24px", alignItems: "center" }}
              >
                <Text style={{ color: "white" }}>Max Score: 2</Text>
                <Text style={{ color: "white" }}>Question Practice</Text>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(255,255,255,0.2)",
                    padding: "4px 12px",
                    borderRadius: "16px",
                  }}
                >
                  <AiOutlineHistory color="white" size={16} />
                  <Text style={{ color: "white", fontWeight: "600" }}>
                    {formatTime(timeElapsed)}
                  </Text>
                </div>
              </div>
            </div>

            <div className="test-mcq-body">
              <Title
                level={4}
                style={{
                  fontWeight: "600",
                  marginBottom: "32px",
                  marginTop: "1px",
                }}
              >
                {currentQuestion.question}
              </Title>

              <div className="test-mcq-options-list">
                {[
                  { key: "option_a", label: currentQuestion.option_a },
                  { key: "option_b", label: currentQuestion.option_b },
                  { key: "option_c", label: currentQuestion.option_c },
                  { key: "option_d", label: currentQuestion.option_d },
                ].map((opt, idx) => (
                  <div
                    key={idx}
                    className={`test-mcq-option ${userAnswers[currentQuestion.id] === opt.label ? "selected" : ""}`}
                    onClick={() => handleAnswerChange(opt.label)}
                  >
                    <Radio
                      checked={userAnswers[currentQuestion.id] === opt.label}
                      className="test_attempt_radio"
                    />
                    <Text>{opt.label}</Text>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "40px",
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  onClick={() => handleSubmitAssignment()}
                  loading={loading}
                  style={{
                    background: "#175cd3",
                    padding: "0 32px",
                    fontWeight: "600",
                  }}
                >
                  Submit
                </Button>
              </div>
            </div>
          </Card>

          {/* MCQ Page Bottom Nav Legend */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "24px",
            }}
          >
            <Button
              shape="circle"
              size="large"
              style={{ background: "#175cd3", color: "white", border: "none" }}
              icon={<AiOutlineHistory size={24} />}
            />
          </div>
        </div>
      )}

      {/* Warning Modal Removed */}

      {/* Wrong Answer Modal */}
      <Modal
        open={showWrongModal}
        onCancel={() => setShowWrongModal(false)}
        footer={null}
        centered
        width={600}
        styles={{ body: { padding: "10px" } }}
        closable={false}
      >
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#FEF3F2",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <AiOutlineCloseCircle size={28} color="#D92D20" />
          </div>

          <Title level={4} style={{ marginBottom: "8px", fontWeight: "700" }}>
            Oops! Your answer is wrong
          </Title>
          <Text
            type="secondary"
            style={{ fontSize: "16px", display: "block", marginBottom: "32px" }}
          >
            This doesn't accurately represent the correct solution based on the
            given information. Please review and try again.
          </Text>

          <div style={{ display: "flex", gap: "12px" }}>
            <Button
              size="large"
              style={{ flex: 1, height: "48px", fontWeight: "600" }}
              className="assignment_practice_quit_button"
              onClick={() => {
                setShowWrongModal(false);
                navigate(`/assignments`);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              style={{
                flex: 1,
                background: "#175cd3",
                height: "48px",
                fontWeight: "600",
              }}
              onClick={() => setShowWrongModal(false)}
            >
              Try Again
            </Button>
          </div>
        </div>
      </Modal>

      {/* Instructions Overlay */}
      {showInstructions && (
        <div className="test-instructions-overlay">
          <div className="test-instructions-card">
            <div className="test-instructions-header">Before you start!</div>
            <div className="test-rules-list">
              {[
                "The timer starts as soon as you begin.",
                "You can practice both MCQ and Coding questions.",
                "Your progress is not tracked in practice mode.",
                "Use the sample inputs to test your code.",
              ].map((rule, idx) => (
                <div key={idx} className="test-rule-item">
                  <AiOutlineCode size={20} color="#175cd3" />
                  <span className="test-rule-text">{rule}</span>
                </div>
              ))}
            </div>
            <div className="test-instructions-actions">
              <Button
                type="primary"
                size="large"
                block
                style={{
                  height: "50px",
                  fontWeight: "600",
                  background: "#175cd3",
                }}
                onClick={handleStartTest}
              >
                I have read the instructions, let's go!
              </Button>
              <Button
                type="default"
                size="large"
                block
                style={{ height: "50px", fontWeight: "600" }}
                onClick={handleQuitTest}
                className="assignment_practice_quit_button"
              >
                I want to quit the test
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentPractice;
