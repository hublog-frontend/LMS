import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import { Collapse, Tabs, Button, Row, Col, Progress } from "antd";
import { AiOutlineClockCircle, AiOutlineStar } from "react-icons/ai";
import "./styles.css";
import { FiDownload } from "react-icons/fi";
import { getTestResult } from "../ApiService/action";

export default function TestResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { testName, history_id } = useParams();
  const [testResultData, setTestResultData] = useState([]);
  const [summary, setSummary] = useState({
    totalTime: "0h:0m:0s",
    totalMarks: "0 / 0",
    percentage: 0,
  });

  useEffect(() => {
    getTestResultData();
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h:${m}m:${s}s`;
  };

  const getTestResultData = async () => {
    const payload = {
      history_id: history_id,
    };
    try {
      const response = await getTestResult(payload);
      const data = response?.data?.testResult || [];

      if (data.length > 0) {
        // Calculate Summary and Combine all Questions
        let totalScored = 0;
        let totalPossible = 0;
        let totalSeconds = 0;
        let totalSolved = 0;

        const allQuestions = data.map((item, index) => {
          const qMark = item.question_type === "CODING" ? 10 : 2;
          totalScored += parseFloat(item.marks_scored) || 0;
          totalPossible += qMark;
          totalSeconds += parseInt(item.time_taken) || 0;
          if (item.is_solved) totalSolved += 1;

          return {
            id: index + 1,
            question_id: item.question_id,
            title: item.question,
            marks: `${item.marks_scored || 0} / ${qMark}`,
            question_type: item.question_type,
            problem: {
              description: item.description,
              inputFormat: item.input_format || "Standard Input",
              outputFormat: item.output_format || "Standard Output",
              sampleInput: item.sample_input,
              sampleOutput: item.sample_output,
              constraints: item.constraints,
            },
            userCode: item.submitted_code,
            language: item.language,
            selected_option: item.selected_option,
            correct_answer: item.correct_answer,
            options: [
              { label: item.option_a, key: "A" },
              { label: item.option_b, key: "B" },
              { label: item.option_c, key: "C" },
              { label: item.option_d, key: "D" },
            ],
          };
        });

        const mappedData = [
          {
            id: 1,
            topic: testName,
            attempted: allQuestions.length,
            solved: totalSolved,
            timeTaken: formatTime(totalSeconds),
            marksScored: `${totalScored} / ${totalPossible}`,
            questions: allQuestions,
          },
        ];

        setTestResultData(mappedData);
        setSummary({
          totalTime: formatTime(totalSeconds),
          totalMarks: `${totalScored} / ${totalPossible}`,
          percentage:
            totalPossible > 0
              ? Math.round((totalScored / totalPossible) * 100)
              : 0,
        });
      }
    } catch (error) {
      setTestResultData([]);
      console.log("get test result error", error);
    }
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
                navigate(`/tests/onDemandTests/${location?.state?.topic_id}`, {
                  state: {
                    showHistory: true,
                    test_id: location?.state?.test_id,
                  },
                });
              }}
            />
            <p className="common_heading">Test Result</p>
          </div>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="1"
        className="testresult_main_tabs"
        items={[
          {
            key: "1",
            label: "Result Details",
          },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: "30px" }}>
        <Col xs={24} sm={24} md={24} lg={8}>
          <div className="testresult_top_cards">
            <div
              style={{
                background: "#f4f3ff",
                padding: "12px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AiOutlineClockCircle size={30} color="#6938ef" />
            </div>
            <div>
              <p style={{ margin: 0, color: "#667085", fontSize: "14px" }}>
                Total time
              </p>
              <p className="testresult_top_cards_totaltime">
                {summary.totalTime}
              </p>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={8}>
          <div className="testresult_top_cards">
            <div
              style={{
                background: "#ecfdf3",
                padding: "12px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AiOutlineStar size={30} color="#039855" />
            </div>
            <div>
              <p style={{ margin: 0, color: "#667085", fontSize: "14px" }}>
                Total marks
              </p>
              <p className="testresult_top_cards_totaltime">
                {summary.totalMarks}
              </p>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={8}>
          <div
            className="testresult_top_cards"
            style={{ justifyContent: "center", padding: "10px 20px" }}
          >
            <div
              style={{ position: "relative", width: "160px", height: "96px" }}
            >
              <Progress
                type="dashboard"
                percent={summary.percentage}
                strokeColor="#175cd3"
                strokeWidth={10}
                size={140}
                gapDegree={180}
                showInfo={false}
                style={{ marginTop: "8px" }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "48%",
                  transform: "translateX(-56%)",
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#101828",
                  }}
                >
                  {summary.percentage}%
                </span>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Collapse
        defaultActiveKey={["1"]}
        expandIconPosition="end"
        className="testresult_main_collapse"
        items={testResultData.map((section) => ({
          key: section.id,
          label: (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "96%",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    background: "#f4f3ff",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    color: "#6938ef",
                    fontWeight: "600",
                  }}
                >
                  {section.id}
                </div>
                <span style={{ fontSize: "18px", fontWeight: "600" }}>
                  {section.topic}
                </span>
              </div>
              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <div className="testresult_header_tag tag_attempted">
                  Attempted: {section.attempted}
                </div>
                <div className="testresult_header_tag tag_solved">
                  Solved: {section.solved}
                </div>
                <div className="testresult_header_tag tag_time">
                  Time Taken: {section.timeTaken}
                </div>
                <div className="testresult_header_tag tag_marks">
                  Marks Scored: {section.marksScored}
                </div>
              </div>
            </div>
          ),
          children: (
            <Collapse
              ghost
              expandIconPosition="end"
              className="testresult_questions_collapse"
              items={section.questions.map((q) => ({
                key: q.id,
                label: (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "99%",
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>
                      {q.id}. {q.title}
                    </span>
                    <div className="testresult_header_tag tag_marks">
                      Marks Scored: {q.marks}
                    </div>
                  </div>
                ),
                children: (
                  <div style={{ padding: "0 20px 20px" }}>
                    <Tabs
                      defaultActiveKey="1"
                      className="testresult_problem_tabs"
                      items={[
                        {
                          key: "1",
                          label:
                            q.question_type === "CODING"
                              ? "Problem"
                              : "Solution",
                          children: (
                            <Row gutter={24}>
                              <Col
                                span={q.question_type === "CODING" ? 10 : 24}
                              >
                                <div>
                                  <p
                                    style={{
                                      fontWeight: "700",
                                      fontSize: "16px",
                                      marginBottom: "8px",
                                    }}
                                  >
                                    {q.question_type === "CODING"
                                      ? "Problem"
                                      : "Question"}
                                  </p>
                                  <p
                                    style={{
                                      color: "#475467",
                                      lineHeight: "1.6",
                                    }}
                                  >
                                    {q.problem.description || q.title}
                                  </p>

                                  {q.question_type === "CODING" ? (
                                    <>
                                      <p
                                        style={{
                                          fontWeight: "700",
                                          fontSize: "16px",
                                          marginTop: "16px",
                                          marginBottom: "8px",
                                        }}
                                      >
                                        Input Format
                                      </p>
                                      <p style={{ color: "#475467" }}>
                                        {q.problem.inputFormat}
                                      </p>

                                      <p
                                        style={{
                                          fontWeight: "700",
                                          fontSize: "16px",
                                          marginTop: "16px",
                                          marginBottom: "8px",
                                        }}
                                      >
                                        Output Format
                                      </p>
                                      <p style={{ color: "#475467" }}>
                                        {q.problem.outputFormat}
                                      </p>

                                      <p
                                        style={{
                                          fontWeight: "700",
                                          fontSize: "16px",
                                          marginTop: "16px",
                                          marginBottom: "8px",
                                        }}
                                      >
                                        Sample Inputs & Outputs
                                      </p>
                                      <div
                                        style={{
                                          padding: "12px",
                                          border: "1px solid #eaecf0",
                                          borderRadius: "8px",
                                          background: "#f9fafb",
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontWeight: "600",
                                            marginBottom: "4px",
                                          }}
                                        >
                                          Sample Input
                                        </p>
                                        <pre
                                          style={{
                                            margin: 0,
                                            padding: 0,
                                            background: "none",
                                            border: "none",
                                          }}
                                        >
                                          {q.problem.sampleInput}
                                        </pre>
                                        <p
                                          style={{
                                            fontWeight: "600",
                                            marginTop: "8px",
                                            marginBottom: "4px",
                                          }}
                                        >
                                          Sample Output
                                        </p>
                                        <pre
                                          style={{
                                            margin: 0,
                                            padding: 0,
                                            background: "none",
                                            border: "none",
                                          }}
                                        >
                                          {q.problem.sampleOutput}
                                        </pre>
                                      </div>
                                    </>
                                  ) : (
                                    <div
                                      className="test-mcq-options-list"
                                      style={{ marginTop: "24px" }}
                                    >
                                      {q.options.map((opt, idx) => {
                                        const isSelected =
                                          q.selected_option === opt.label;
                                        const isCorrect =
                                          q.correct_answer === opt.label;
                                        let borderColor = "#eaecf0";
                                        let bgColor = "#fff";

                                        if (isSelected && isCorrect) {
                                          borderColor = "#039855";
                                          bgColor = "#ecfdf3";
                                        } else if (isSelected && !isCorrect) {
                                          borderColor = "#d92d20";
                                          bgColor = "#fef3f2";
                                        } else if (isCorrect) {
                                          borderColor = "#039855";
                                          bgColor = "#f6fef9";
                                        }

                                        return (
                                          <div
                                            key={idx}
                                            style={{
                                              padding: "12px 16px",
                                              border: `2px solid ${borderColor}`,
                                              borderRadius: "8px",
                                              background: bgColor,
                                              marginBottom: "12px",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "12px",
                                            }}
                                          >
                                            <div
                                              style={{
                                                width: "24px",
                                                height: "24px",
                                                borderRadius: "50%",
                                                border: `1px solid ${isSelected ? borderColor : "#d0d5dd"}`,
                                                background: isSelected
                                                  ? borderColor
                                                  : "#fff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: isSelected
                                                  ? "white"
                                                  : "#667085",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                              }}
                                            >
                                              {opt.key}
                                            </div>
                                            <span
                                              style={{
                                                color: "#344054",
                                                fontWeight: isSelected
                                                  ? "600"
                                                  : "400",
                                              }}
                                            >
                                              {opt.label}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </Col>
                              {q.question_type === "CODING" && (
                                <Col span={14}>
                                  <div
                                    style={{
                                      border: "1px solid #eaecf0",
                                      borderRadius: "8px",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <div
                                      style={{
                                        padding: "8px 16px",
                                        background: "#f9fafb",
                                        borderBottom: "1px solid #eaecf0",
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <span>
                                        {q.language
                                          ? q.language.charAt(0).toUpperCase() +
                                            q.language.slice(1).toLowerCase()
                                          : ""}
                                      </span>
                                    </div>
                                    <div
                                      style={{
                                        padding: "16px",
                                        background: "#fff",
                                        minHeight: "300px",
                                        fontFamily: "monospace",
                                        overflow: "auto",
                                      }}
                                    >
                                      <pre
                                        style={{
                                          margin: 0,
                                          whiteSpace: "pre-wrap",
                                        }}
                                      >
                                        {q.userCode || "// No code submitted"}
                                      </pre>
                                    </div>
                                  </div>
                                </Col>
                              )}
                            </Row>
                          ),
                        },
                      ]}
                    />
                  </div>
                ),
              }))}
            />
          ),
        }))}
      />
    </div>
  );
}
