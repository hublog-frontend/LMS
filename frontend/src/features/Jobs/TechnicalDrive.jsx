import React from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import CommonInputField from "../Common/CommonInputField";
import { Row, Col } from "antd";
import BuildingImage from "../../assets/building.png";
import { FiUser, FiCheckSquare } from "react-icons/fi";
import { PiMapPin } from "react-icons/pi";
import { PiWallet } from "react-icons/pi";
import { LuBookOpen } from "react-icons/lu";
import "./styles.css";

export default function TechnicalDrive() {
  const navigate = useNavigate();

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={12} lg={6}>
          <CommonInputField
            placeholder="Search"
            prefix={<CiSearch size={16} />}
          />
        </Col>
      </Row>
      {/* <div style={{ width: "30%" }}>
   
      </div> */}

      <Row
        gutter={[
          { xs: 24, sm: 24, md: 24, lg: 24 },
          { xs: 24, sm: 24, md: 24, lg: 24 },
        ]}
        style={{ marginTop: "20px" }}
      >
        <Col xs={24} sm={24} md={12} lg={8}>
          <div className="jobs_cards">
            <div className="jobs_cards_header">
              <img src={BuildingImage} className="job_cards_image" />
              <div>
                <p className="job_cards_title">TAP-JOB-ID-2469</p>
                <p className="job_cards_timing_text">Posted 5 minutes ago</p>
              </div>

              <div className="job_cards_closed_tag_container">
                <div className="job_cards_closed_tag_dot_div" />
                Closed
              </div>
            </div>

            <div className="jobs_cards_details_main_container">
              <div className="jobs_cards_details_container">
                <FiUser size={25} />
                <div>
                  <p style={{ fontSize: "12px" }}>Looking for</p>
                  <p style={{ fontWeight: 500 }}>Salesforce Developer</p>
                </div>
              </div>

              <div className="jobs_cards_details_container">
                <PiMapPin size={35} />
                <div>
                  <p style={{ fontSize: "12px" }}>Location</p>
                  <p style={{ fontWeight: 500 }}>Bengaluru, Andhra Pradesh</p>
                </div>
              </div>

              <div className="jobs_cards_details_container">
                <PiWallet size={24} />
                <div>
                  <p style={{ fontSize: "12px" }}>Salary</p>
                  <p style={{ fontWeight: 500 }}>Upto 4 LPA</p>
                </div>
              </div>

              <div className="jobs_cards_details_container">
                <LuBookOpen size={32} />
                <div>
                  <p style={{ fontSize: "12px" }}>Qualification</p>
                  <p style={{ fontWeight: 500 }}>
                    B.Sc, BCA, BE/B.Tech, MCA, M.Sc
                  </p>
                </div>
              </div>
            </div>

            <div className="jobs_cards_button_container">
              <button className="jobs_cards_apply_button">Apply</button>
              <button
                className="jobs_cards_knowmore_button"
                onClick={() => {
                  navigate("/jobs/4324324");
                }}
              >
                Know More
              </button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
