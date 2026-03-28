import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "antd";
import { CiSearch } from "react-icons/ci";
import CommonInputField from "../Common/CommonInputField";
import BDILogo from "../../assets/bdi_logo.jpeg";
import { PiHeartBold, PiHeartFill } from "react-icons/pi";
import { IoArrowForwardOutline } from "react-icons/io5";
import "./styles.css";
import {
  addCompanyQuestionToFavorite,
  getCompanyQuestions,
  getFavoriteCompanies,
  removeCompanyQuestionToFavorite,
} from "../ApiService/action";
import { useDispatch, useSelector } from "react-redux";
import {
  storeCompanyQuestionList,
  storeFavoriteCompanyQuestionList,
} from "../Redux/Slice";
import CommonNodataFound from "../Common/CommonNoDataFound";
import { CommonMessage } from "../Common/CommonMessage";

export default function FavoriteCompanyQuestions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const favoriteComapanyQuestionsData = useSelector(
    (state) => state.favoritecompanyquestionlist,
  );
  const [data, setData] = useState([]);

  useEffect(() => {
    getFavoriteCompaniesData();
  }, []);

  const getFavoriteCompaniesData = async (callCompanyQuestionsApi = false) => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    try {
      const response = await getFavoriteCompanies(converAsJson?.id || null);
      console.log("get favorite company questions response", response);
      const favorites_questions_data = response?.data?.result || [];
      dispatch(storeFavoriteCompanyQuestionList(favorites_questions_data));
    } catch (error) {
      dispatch(storeFavoriteCompanyQuestionList([]));
      console.log("get await company questions error", error);
    } finally {
      if (callCompanyQuestionsApi) {
        getCompanyQuestionsData();
      }
    }
  };

  const addToFavorite = async (type, company_id) => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log(converAsJson);

    const payload = {
      company_id: company_id,
      user_id: converAsJson?.id || null,
    };
    try {
      if (type == "add") {
        await addCompanyQuestionToFavorite(payload);
      } else {
        await removeCompanyQuestionToFavorite(payload);
      }
      setTimeout(() => {
        CommonMessage(
          "success",
          `${type == "add" ? "Added" : "Removed"} to favorites!`,
        );
        getFavoriteCompaniesData(true);
      }, 300);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const getCompanyQuestionsData = async () => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    const payload = {
      user_id: converAsJson?.id || null,
    };
    try {
      const response = await getCompanyQuestions(payload);
      console.log("get company questions response", response);
      const company_questions_data = response?.data?.result || [];
      dispatch(storeCompanyQuestionList(company_questions_data));
    } catch (error) {
      dispatch(storeCompanyQuestionList([]));
      console.log("get company questions error", error);
    }
  };

  return (
    <div>
      <div style={{ width: "30%" }}>
        <CommonInputField
          placeholder="Search by company name"
          prefix={<CiSearch size={16} />}
        />
      </div>

      {favoriteComapanyQuestionsData.length >= 1 ? (
        <Row
          gutter={[
            { xs: 24, sm: 24, md: 24, lg: 24 },
            { xs: 24, sm: 24, md: 24, lg: 24 },
          ]}
          style={{ marginTop: "20px" }}
        >
          {favoriteComapanyQuestionsData.map((item, index) => {
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

                      {item.is_favourite == 0 ? (
                        <PiHeartBold
                          size={22}
                          color="#2160ad"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToFavorite("add", item?.company_id || null);
                          }}
                        />
                      ) : (
                        <PiHeartFill
                          size={22}
                          color="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToFavorite("remove", item?.company_id || null);
                          }}
                        />
                      )}
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
                </div>
              </Col>
            );
          })}
        </Row>
      ) : (
        <CommonNodataFound />
      )}
    </div>
  );
}
