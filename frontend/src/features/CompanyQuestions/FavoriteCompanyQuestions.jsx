import React from "react";
import { Row, Col } from "antd";
import { CiSearch } from "react-icons/ci";
import CommonInputField from "../Common/CommonInputField";
import BDILogo from "../../assets/bdi_logo.jpeg";
import { PiHeartBold, PiHeartFill } from "react-icons/pi";
import { IoArrowForwardOutline } from "react-icons/io5";
import "./styles.css";

export default function FavoriteCompanyQuestions() {
  return (
    <div>
      <div style={{ width: "30%" }}>
        <CommonInputField
          placeholder="Search by company name"
          prefix={<CiSearch size={16} />}
        />
      </div>

      <Row
        gutter={[
          { xs: 24, sm: 24, md: 24, lg: 24 },
          { xs: 24, sm: 24, md: 24, lg: 24 },
        ]}
        style={{ marginTop: "20px" }}
      >
        <Col xs={24} sm={24} md={12} lg={8}>
          <div className="company_questions_cards">
            <div className="_card_header_1xrag_13">
              <div className="_container_1xrag_19">
                <div className="company_questions_logo_container">
                  <img className="company_questions_logo" src={BDILogo} />
                  <p className="company_questions_company_name">
                    BDI Plus Lab Pvt.Ltd
                  </p>
                </div>

                <PiHeartFill size={23} color="red" />
              </div>

              <div className="company_questions_card_tag_container">
                <div className="company_tag company_tag--java">Core Java</div>
                <div className="company_tag company_tag--program">
                  Programming
                </div>
                <div className="company_tag company_tag--sql">SQL</div>
                <div className="company_tag company_tag--hibernate">
                  Hibernate
                </div>
              </div>
            </div>

            <div className="company_questions_card_getstart_button_container">
              <p>Get Started</p>
              <IoArrowForwardOutline size={19} />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
