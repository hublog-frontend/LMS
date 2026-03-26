import React from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { Collapse, Tabs, Button, Row, Col, Progress } from "antd";
import { AiOutlineClockCircle, AiOutlineStar } from "react-icons/ai";
import "./styles.css";
import { FiDownload } from "react-icons/fi";

export default function TestResult() {
  const resultData = [
    {
      id: 1,
      topic: "Loops",
      attempted: 1,
      solved: 0,
      timeTaken: "1801h:12m:8s",
      marksScored: "0 / 30",
      questions: [
        {
          id: 1,
          title: "Power Calculation",
          marks: "0 / 10",
          problem: {
            description:
              "Given two integers n and k, compute the power of n raised to k using a loop. The program should multiply n by itself k times to compute n^k without using built-in power functions.",
            inputFormat:
              "The first line contains an integer n. The second line contains an integer k.",
            outputFormat:
              "Print a single integer representing n raised to the power k.",
            sampleInput: "2 10",
            sampleOutput: "1024",
          },
          userCode: "// User's code for Power Calculation",
        },
        {
          id: 2,
          title: "Odd Multiples of N",
          marks: "0 / 10",
          problem: {
            description:
              "Given two positive integers N and M, print all the odd multiples of N till M.",
            inputFormat:
              "Two integers N and M (1 <= N, M <= 10^5) representing the base number and the maximum natural number.",
            outputFormat:
              "Print all the odd multiples of N till M, each separated by a space. If the multiples don't exist, print -1.",
            sampleInput: "3 20",
            sampleOutput: "3 9 15",
          },
          userCode: "// User's code for Odd Multiples of N",
        },
        {
          id: 3,
          title: "3Sum",
          marks: "0 / 10",
          problem: {
            description:
              "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
            inputFormat: "An integer array nums.",
            outputFormat: "A list of lists containing the unique triplets.",
            sampleInput: "[-1,0,1,2,-1,-4]",
            sampleOutput: "[[-1,-1,2],[-1,0,1]]",
          },
          userCode: "// User's code for 3Sum",
        },
      ],
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <IoArrowBackOutline size={26} style={{ cursor: "pointer" }} />
          <p className="common_heading" style={{ margin: 0 }}>
            Test Result
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button size="large">Collapse all</Button>
          <Button type="primary" size="large" icon={<FiDownload />}>
            Download Report
          </Button>
        </div>
      </div>

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
              <p className="testresult_top_cards_totaltime">0h:0m:33s</p>
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
              <p className="testresult_top_cards_totaltime">0/30</p>
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
                percent={0}
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
                  0%
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
        items={resultData.map((section) => ({
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
                          label: "Problem",
                          children: (
                            <Row gutter={24}>
                              <Col span={10}>
                                <div>
                                  <p
                                    style={{
                                      fontWeight: "700",
                                      fontSize: "16px",
                                      marginBottom: "8px",
                                    }}
                                  >
                                    Problem
                                  </p>
                                  <p
                                    style={{
                                      color: "#475467",
                                      lineHeight: "1.6",
                                    }}
                                  >
                                    {q.problem.description}
                                  </p>

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
                                      Sample Input 1
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
                                  </div>
                                </div>
                              </Col>
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
                                    <span>Java</span>
                                  </div>
                                  <div
                                    style={{
                                      padding: "16px",
                                      background: "#fff",
                                      minHeight: "300px",
                                      fontFamily: "monospace",
                                    }}
                                  >
                                    <div
                                      style={{ display: "flex", gap: "16px" }}
                                    >
                                      <span style={{ color: "#98a2b3" }}>
                                        1
                                      </span>
                                      <div
                                        style={{
                                          borderLeft: "1px solid #eaecf0",
                                          paddingLeft: "8px",
                                          width: "100%",
                                        }}
                                      >
                                        {q.userCode}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Col>
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
