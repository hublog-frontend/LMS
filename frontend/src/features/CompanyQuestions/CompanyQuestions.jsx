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
import {
  addCompanyQuestionToFavorite,
  deleteCompanyQuestion,
  getCompanyQuestions,
  getFavoriteCompanies,
  removeCompanyQuestionToFavorite,
} from "../ApiService/action";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { useSelector } from "react-redux";
import CommonDeleteModal from "../Common/CommonDeleteModal";
import { CommonMessage } from "../Common/CommonMessage";
import { useDispatch } from "react-redux";
import {
  storeCompanyQuestionList,
  storeCompanyQuestionSearchValue,
  storeFavoriteCompanyQuestionList,
} from "../Redux/Slice";

export default function CompanyQuestions({ handleEdit }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const comapanyQuestionsData = useSelector(
    (state) => state.companyquestionlist,
  );
  const searchValue = useSelector((state) => state.companyquestionsearchvalue);
  const favoriteSearchValue = useSelector(
    (state) => state.favoritecompanyquestionsearchvalue,
  );

  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  // useEffect(() => {
  //   getCompanyQuestionsData();
  // }, []);

  const getCompanyQuestionsData = async (company_name) => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    const payload = {
      company_name: company_name,
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
          `${type === "add" ? "Added to favorites!" : "Removed from favorites!"}`,
        );
        getFavoriteCompaniesData();
      }, 300);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const getFavoriteCompaniesData = async () => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    const payload = {
      user_id: converAsJson?.id || null,
      company_name: favoriteSearchValue,
    };
    try {
      const response = await getFavoriteCompanies(payload);
      console.log("get favorite company questions response", response);
      const favorites_questions_data = response?.data?.result || [];
      dispatch(storeFavoriteCompanyQuestionList(favorites_questions_data));
    } catch (error) {
      dispatch(storeFavoriteCompanyQuestionList([]));
      console.log("get await company questions error", error);
    } finally {
      getCompanyQuestionsData(searchValue);
    }
  };

  const handleDeleteCompanyQuestion = async () => {
    try {
      await deleteCompanyQuestion(companyId);
      setTimeout(() => {
        setButtonLoading(false);
        setIsOpenDeleteModal(false);
        getCompanyQuestionsData(searchValue);
        CommonMessage("success", `Company Deleted Successfully!`);
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

  return (
    <div>
      <div style={{ width: "30%" }}>
        <CommonInputField
          placeholder="Search by company name"
          prefix={<CiSearch size={16} />}
          onChange={(e) => {
            dispatch(storeCompanyQuestionSearchValue(e.target.value));
            setTimeout(() => {
              getCompanyQuestionsData(e.target.value);
            }, 300);
          }}
          value={searchValue}
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

                    {item.is_favourite == 0 ? (
                      <PiHeartBold
                        size={22}
                        color="#2160ad"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToFavorite("add", item?.id || null);
                        }}
                      />
                    ) : (
                      <PiHeartFill
                        size={22}
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToFavorite("remove", item?.id || null);
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
      </Row>

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
    </div>
  );
}
