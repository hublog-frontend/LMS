import React from "react";
import { Row, Col, Tabs } from "antd";
import { useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import BuildingImage from "../../assets/building.png";
import { FiUser, FiCheckSquare } from "react-icons/fi";
import { PiMapPin } from "react-icons/pi";
import { PiWallet } from "react-icons/pi";
import { LuBookOpen } from "react-icons/lu";
import { FiCalendar } from "react-icons/fi";
import { FiBriefcase } from "react-icons/fi";
import { LuClock4 } from "react-icons/lu";
import { FiBook } from "react-icons/fi";
import { IoTransgenderSharp } from "react-icons/io5";
import { AiOutlinePercentage } from "react-icons/ai";
import { IoMdCode } from "react-icons/io";
import { MdBlockFlipped } from "react-icons/md";
import { FiCheck } from "react-icons/fi";

export default function DriveDetails() {
  const navigate = useNavigate();

  return (
    <div>
      <Row>
        <Col xs={12} sm={12} md={12} lg={12}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <IoArrowBackOutline
              size={30}
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate("/jobs");
              }}
            />
            <p className="common_heading">Job Details</p>
          </div>
        </Col>
        <Col
          xs={12}
          sm={12}
          md={12}
          lg={12}
          className="tests_createtopic_button_container"
        ></Col>
      </Row>

      <div className="drive_title_container">
        <img src={BuildingImage} className="job_cards_image" />
        <p className="drive_main_title">TAP-JOB-ID-2469</p>
      </div>

      <Tabs
        className="companyquestions_tabs"
        defaultActiveKey={"1"} // ✅ auto select first visible tab
        items={[
          {
            label: "Drive Details",
            key: "1",
            children: (
              <div>
                <div className="drive_content_header_container">
                  Job Criteria
                </div>

                <Row className="drive_content_row_container">
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <FiUser
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Looking for</p>
                      <p className="drive_content_section_title">
                        Salesforce Developer
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <PiMapPin
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Location</p>
                      <p className="drive_content_section_title">
                        Bengaluru, Andhra Pradesh
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <PiMapPin
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Service Agreement</p>
                      <p style={{ fontWeight: 500 }}>3 Years</p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <PiWallet
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Salary</p>
                      <p className="drive_content_section_title">Upto 4 LPA</p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <LuBookOpen
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Qualification</p>
                      <p className="drive_content_section_title">
                        B.Sc, BCA, BE/B.Tech, MCA, M.Sc
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <FiCalendar
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Year of Passing</p>
                      <p className="drive_content_section_title">
                        2024, 2023, 2022, 2021, 2020, 2019, 2018
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <FiBriefcase
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Interview Rounds</p>
                      <p className="drive_content_section_title">
                        <ol style={{ margin: "0px", padding: "8px 12px" }}>
                          <li>Communication Round</li>
                          <li> Technical coding Round</li>
                          <li>HR Round</li>
                        </ol>
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <FiCalendar
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Interview Date</p>
                      <p className="drive_content_section_title">
                        30-03-2026 ( online )
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <LuClock4
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Shift</p>
                      <p className="drive_content_section_title">
                        based on project
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <FiBook
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Streams</p>
                      <p className="drive_content_section_title">
                        Computer Science Engineering , Computer Science and
                        Business Systems , Computer Science and Data Science ,
                        Artificial Intelligence and Data Science , Computer
                        Science - Any Streams , Electronics and Communication
                        Engineering , Information Technology , Information
                        Science , AI - ML{" "}
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <IoTransgenderSharp
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>genderPreference</p>
                      <p className="drive_content_section_title">
                        Male & Female
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <AiOutlinePercentage
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>
                        Min Required Percentage
                      </p>
                      <p className="drive_content_section_title">
                        SSLC : 35 PUC/Diploma : 35 Degree : 35{" "}
                      </p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={6}
                    className="drive_content_col_container"
                  >
                    <IoMdCode
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Skills Required</p>
                      <div className="drive_content_skills_div">
                        <ul style={{ padding: "0px", margin: "4px 0px" }}>
                          <li>Any programming language</li>
                          <li>communication</li>
                        </ul>
                      </div>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={4}
                    className="drive_content_col_container"
                  >
                    <MdBlockFlipped
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Blocking Period</p>
                      <p className="drive_content_section_title">6 months</p>
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={6}
                    className="drive_content_col_container"
                  >
                    <IoMdCode
                      color="#000000"
                      size={24}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ color: "gray" }}>
                      <p style={{ fontSize: "13px" }}>Other Criterias</p>
                      <div className="drive_content_other_criterias_div">
                        <ul style={{ padding: "0px", margin: "4px 0px" }}>
                          <li>
                            Gap In Education{" "}
                            <FiCheck
                              size={16}
                              color="#111929"
                              style={{ flexShrink: 0 }}
                            />
                          </li>
                          <li>
                            Relocation{" "}
                            <FiCheck
                              size={16}
                              color="#111929"
                              style={{ flexShrink: 0 }}
                            />
                          </li>
                          <li>
                            Certificate Submission{" "}
                            <FiCheck
                              size={16}
                              color="#111929"
                              style={{ flexShrink: 0 }}
                            />
                          </li>
                        </ul>
                      </div>{" "}
                    </div>
                  </Col>
                </Row>

                <div
                  className="drive_content_header_container"
                  style={{ marginTop: "20px" }}
                >
                  Notes
                </div>

                <div className="drive_content_row_container">
                  <div style={{ color: "#101828", fontWeight: 500 }}>
                    <p>Please Note:</p>
                    <br />
                    <p>
                      The company will provide Salesforce training . Candidates
                      who are willing to learn and wor
                    </p>
                    <br />
                    <p>
                      The company has openings based on pass-out year and
                      location:
                    </p>
                    <br />
                    <p>
                      2016 – 2022 pass-out candidates: Openings are available in
                      Bangalore
                    </p>
                    <p>
                      2023 – 2024 pass-out candidates: Openings are available in
                      Anantapur, Andhra Pradesh
                    </p>
                    <br />
                    <p>Salary Details:</p>
                    <p>
                      A stipend of ₹5,000 will be provided to all candidates
                      during the initial period.
                    </p>
                    <br />
                    <p>2016 – 2022 pass-outs: ₹4 LPA</p>
                    <p>2023 – 2024 pass-outs: ₹3 LPA</p>

                    <br />
                    <p>
                      A 2-year bond is applicable for candidates who passed out
                      between 2016 and 2022, and a 3-year bond is applicable for
                      candidates who passed out in 2023 and 2024
                    </p>
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
