import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "antd";
import { CiSearch } from "react-icons/ci";
import CommonInputField from "../Common/CommonInputField";
import ZohoLogo from "../../assets/zoho_logo.png";
import BDILogo from "../../assets/bdi_logo.jpeg";
import { PiHeartBold, PiHeartFill } from "react-icons/pi";
import { IoArrowForwardOutline } from "react-icons/io5";
import "./styles.css";
import { getCompanyQuestions } from "../ApiService/action";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { useSelector } from "react-redux";
import CommonDeleteModal from "../Common/CommonDeleteModal";

export default function CompanyQuestions({ handleEdit }) {
  const navigate = useNavigate();
  const comapanyQuestionsData = useSelector(
    (state) => state.companyquestionlist,
  );
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  // useEffect(() => {
  //   getCompanyQuestionsData();
  // }, []);

  // const getCompanyQuestionsData = async () => {
  //   try {
  //     const response = await getCompanyQuestions();
  //     console.log("get company questions response", response);
  //     const company_questions_data = response?.data?.result || [];
  //     setComapanyQuestionsData(company_questions_data);
  //   } catch (error) {
  //     setComapanyQuestionsData([]);
  //     console.log("get company questions error", error);
  //   }
  // };

  const handleDeleteCompanyQuestion = () => {
    console.log("Hii");
  };

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
        {comapanyQuestionsData.map((item, index) => {
          return (
            <Col xs={24} sm={24} md={12} lg={8} key={index}>
              <div
                className="company_questions_cards"
                onClick={() => {
                  navigate(`/company-questions/${item.id}`, {
                    state: {
                      company_name: item?.company_name || "",
                      attachments: item?.attachments || [],
                    },
                  });
                }}
              >
                <div className="_card_header_1xrag_13">
                  <div className="_container_1xrag_19">
                    <div className="company_questions_logo_container">
                      <img
                        className="company_questions_logo"
                        src={`data:image/png;base64,${item.company_logo}`}
                      />
                      <p className="company_questions_company_name">
                        {item?.company_name || ""}
                      </p>
                    </div>

                    <PiHeartBold size={22} color="#2160ad" />
                  </div>

                  <div className="company_questions_card_tag_container">
                    {(typeof item?.skills === "string"
                      ? JSON.parse(item?.skills)
                      : item?.skills || []
                    ).map((skill, i) => {
                      const tagClasses = [
                        "company_tag--java",
                        "company_tag--program",
                        "company_tag--sql",
                        "company_tag--hibernate",
                      ];
                      return (
                        <div
                          key={i}
                          className={`company_tag ${tagClasses[i % 4]}`}
                        >
                          {skill}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="company_questions_card_getstart_button_container">
                  <p>Get Started</p>
                  <IoArrowForwardOutline size={19} />
                </div>

                <div className="company_cards_icon_container">
                  <AiOutlineEdit
                    size={16}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(item);
                    }}
                  />

                  <AiOutlineDelete
                    size={16}
                    className="action-delete-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpenDeleteModal(true);
                      setCompanyId(item.id);
                    }}
                  />
                </div>
              </div>
            </Col>
          );
        })}

        {/* delete modal */}
        <CommonDeleteModal
          open={isOpenDeleteModal}
          onCancel={() => {
            setIsOpenDeleteModal(false);
            setCompanyId(null);
          }}
          content="Are you sure want to delete the Comapany?"
          loading={buttonLoading}
          onClick={handleDeleteCompanyQuestion}
        />
      </Row>
    </div>
  );
}
