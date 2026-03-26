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

const TestAttempt = () => {
  const { testName, testId } = useParams();
  const navigate = useNavigate();

  const location = useLocation();
  const testDurationMinutes = location.state?.duration || 30;

  // States
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // Stores answers by question ID
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));
  const [timeLeft, setTimeLeft] = useState(testDurationMinutes * 60);
  const [questionTimeMap, setQuestionTimeMap] = useState({}); // Stores time (in seconds) per question ID
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("Java");
  const [executing, setExecuting] = useState(false);
  const [output, setOutput] = useState(null); // Stores { stdout, stderr, run }
  const [userOutputs, setUserOutputs] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Proctoring States
  const [switchCount, setSwitchCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  // Fetch Real Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await getTestQuestionsData(testId);
        const data = response?.data?.data || [];
        setQuestions(data);
      } catch (error) {
        console.error("fetch error", error);
        CommonMessage("error", "Failed to load test questions");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [testId]);

  // Tab Switch / Proctoring
  useEffect(() => {
    if (showInstructions || isTerminated) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation();
      }
    };

    const handleBlur = () => {
      handleViolation();
    };

    const handleViolation = () => {
      setSwitchCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          terminateTest(
            "Multiple tab switches detected. Your test has been automatically submitted.",
          );
        } else {
          setShowWarningModal(true);
        }
        return newCount;
      });
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [showInstructions, isTerminated]);

  const terminateTest = (reason) => {
    setIsTerminated(true);
    CommonMessage("warning", reason);
    handleSubmitTest(reason);
  };

  const handleSubmitTest = async (reason = "Test submitted successfully.") => {
    setLoading(true);
    let totalMarks = 0;

    const testResults = questions.map((q) => {
      const isCoding = q.question_type === "CODING";
      const answer = userAnswers[q.id];

      let marksScored = 0;
      let isSolved = 0;

      let expectedOutput = q.sample_output || "";
      let actualOutput = userOutputs[q.id] || "";

      expectedOutput = String(expectedOutput).replace(/^"|"$/g, "").trim();
      actualOutput = String(actualOutput).replace(/^"|"$/g, "").trim();

      if (!isCoding && answer && answer === q.correct_answer) {
        marksScored = 2; // MCQ question mark is 2
        isSolved = 1;
      } else if (isCoding && answer) {
        if (
          expectedOutput !== "" &&
          actualOutput !== "" &&
          expectedOutput === actualOutput
        ) {
          marksScored = 10; // Coding question mark is 10
          isSolved = 1;
        }
      }

      totalMarks += marksScored;

      return {
        question_id: q.id,
        submitted_code: isCoding ? answer || null : null,
        language: isCoding ? selectedLanguage.toUpperCase() : null,
        selected_option: !isCoding
          ? answer || null
          : actualOutput
            ? actualOutput
            : null,
        marks_scored: marksScored,
        time_taken: questionTimeMap[q.id] || 0,
        is_solved: isSolved,
      };
    });

    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const user = JSON.parse(getloginUserDetails || "{}");

    const payload = {
      test_id: testId,
      user_id: user?.id,
      total_marks_scored: totalMarks,
      total_time_taken: testDurationMinutes * 60 - timeLeft,
      test_results: testResults,
      created_date: formatToBackendIST(new Date()),
    };

    try {
      await insertTestResult(payload);
      CommonMessage("success", reason);
      navigate("/tests");
    } catch (error) {
      console.error(error);
      CommonMessage("error", "Error submitting test result");
      setLoading(false);
    }
  };

  // Timer calculation
  useEffect(() => {
    if (!showInstructions && timeLeft > 0 && !isTerminated) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);

        if (currentQuestion?.id) {
          setQuestionTimeMap((prev) => ({
            ...prev,
            [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1,
          }));
        }
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isTerminated) {
      terminateTest("Your time is up! Test submitted automatically.");
    }
  }, [showInstructions, timeLeft, isTerminated, currentQuestion]);

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

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setVisitedQuestions((prev) => new Set([...prev, nextIndex]));
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

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
          Loading Test...
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

  return (
    <div className="test-attempt-container">
      {/* Header */}
      <div className="test-attempt-header">
        <Title level={3} style={{ margin: 0 }}>
          {testName + " Test"}
        </Title>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Button
            className="submit-section-btn"
            onClick={() => handleSubmitTest()}
          >
            Submit & End section
          </Button>
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
              <Text>
                Question {currentQuestionIndex + 1} of {questions.length}
              </Text>
              <Space>
                <Button
                  icon={<AiOutlineArrowLeft />}
                  disabled={currentQuestionIndex === 0}
                  onClick={handlePrev}
                >
                  Previous
                </Button>
                <Button type="primary" onClick={handleNext}>
                  Next
                </Button>
              </Space>
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
              {/* <Button
                type="primary"
                style={{ background: "#175cd3" }}
                onClick={onSubmitCode}
              >
                Submit code
              </Button> */}
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
                <AiOutlineHistory /> <Text strong>{testName}</Text>
              </Space>
              <Text type="secondary">{formatTime(timeLeft)} mins</Text>
            </div>

            <div style={{ marginTop: "24px" }}>
              <Text strong>Questions</Text>
              <div className="question-nav-grid">
                {questions.map((q, idx) => {
                  let className = "question-nav-item";
                  if (idx === currentQuestionIndex) className += " active";
                  else if (userAnswers[q.id]) className += " answered";

                  return (
                    <div
                      key={idx}
                      className={className}
                      onClick={() => setCurrentQuestionIndex(idx)}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
            </div>

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
                <Text style={{ color: "white" }}>
                  Total Questions: {questions.length}
                </Text>
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
                    {formatTime(timeLeft)}
                  </Text>
                </div>
              </div>
            </div>

            <div className="test-mcq-body">
              <Title
                level={4}
                style={{ fontWeight: "600", marginBottom: "32px" }}
              >
                {currentQuestionIndex + 1}. {currentQuestion.question}
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
                  justifyContent: "space-between",
                }}
              >
                <Button
                  size="large"
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  type="primary"
                  size="large"
                  style={{ width: "120px" }}
                  onClick={() => {
                    if (currentQuestionIndex === questions.length - 1) {
                      handleSubmitTest();
                    } else {
                      handleNext();
                    }
                  }}
                >
                  {currentQuestionIndex === questions.length - 1
                    ? "Finish"
                    : "Next"}
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

      {/* Warning Modal */}
      <Modal
        open={showWarningModal}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => setShowWarningModal(false)}
          >
            I Understand
          </Button>,
        ]}
        closable={false}
        centered
        title={
          <Space>
            <AiOutlineWarning color="#faad14" /> <Text strong>Warning</Text>
          </Space>
        }
      >
        <Text>
          You have switched tabs/windows. This is not allowed during the test.
        </Text>
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            background: "#fffbe6",
            border: "1px solid #ffe58f",
            borderRadius: "8px",
          }}
        >
          <Text type="danger" strong>
            Warning {switchCount} of 2.{" "}
          </Text>
          <Text>
            Your test will be automatically submitted on the 3rd attempt.
          </Text>
        </div>
      </Modal>

      {/* Instructions Overlay */}
      {showInstructions && (
        <div className="test-instructions-overlay">
          <div className="test-instructions-card">
            <div className="test-instructions-header">Before you start!</div>
            <div className="test-rules-list">
              {[
                "Do not exit full screen",
                "Do not switch tabs",
                "Do not use multiple screens",
                "Do not use keyboard navigation",
                "Do not refresh the page",
                "Do not take try to test in mobile or tablet",
              ].map((rule, idx) => (
                <div key={idx} className="test-rule-item">
                  <AiOutlineCloseCircle size={20} color="#f04438" />
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

export default TestAttempt;
