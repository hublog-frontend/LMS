import React, { useState, useEffect } from "react";
import { Row, Col, Tooltip, Divider } from "antd";
import CommonInputField from "../Common/CommonInputField";
import CommonTextArea from "../Common/CommonTextArea";
import {
  deleteCertificate,
  getUserById,
  updateCertificate,
} from "../ApiService/action";
import {
  addressValidator,
  formatToBackendIST,
  yearValidator,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import CommonNodataFound from "../Common/CommonNoDataFound";
import { IoMdAdd } from "react-icons/io";
import BuildingImage from "../../assets/building.png";
import { AiOutlineDelete } from "react-icons/ai";
import { Popconfirm } from "antd";
import CommonSpinner from "../Common/CommonSpinner";

export default function Certificates({ userFulldetails, setUserFullDetails }) {
  const [certificatesData, setCertificatesData] = useState([]);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [certificateName, setCertificateName] = useState("");
  const [certificateNameError, setCertificateNameError] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationNameError, setOrganizationNameError] = useState("");
  const [year, setYear] = useState("");
  const [yearError, setYearError] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(false);

  useEffect(() => {
    setCertificatesData(userFulldetails?.certificates || []);
  }, [userFulldetails]);

  const getUserByIdData = async (user_id) => {
    try {
      const response = await getUserById(user_id);
      console.log("get userby id response", response);
      setUserFullDetails(response?.data?.data || []);
      setCertificatesData(response?.data?.data?.certificates || []);
    } catch (error) {
      setCertificatesData([]);
      console.log("get user by id error", error);
    }
  };

  const handleSubmit = async () => {
    setValidationTrigger(true);
    const certificateNameValidate = addressValidator(certificateName);
    const organizationNameValidate = addressValidator(organizationName);
    const yearValidate = yearValidator(year);
    const descriptionValidate = addressValidator(description);

    setCertificateNameError(certificateNameValidate);
    setOrganizationNameError(organizationNameValidate);
    setYearError(yearValidate);
    setDescriptionError(descriptionValidate);

    if (
      certificateNameValidate ||
      organizationNameValidate ||
      yearValidate ||
      descriptionValidate
    )
      return;

    setButtonLoading(true);
    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    const payload = {
      user_id: converAsJson?.id,
      title: certificateName,
      issuing_organization: organizationName,
      issued_year: year,
      description: description,
      created_date: formatToBackendIST(today),
    };

    try {
      await updateCertificate(payload);
      setTimeout(() => {
        CommonMessage("success", "Certificate Added");
        formReset();
        getUserByIdData(converAsJson?.id);
      }, 300);
    } catch (error) {
      console.log("error", error);
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleDelete = async (id) => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    try {
      await deleteCertificate(id);
      setTimeout(() => {
        CommonMessage("success", "Certificate Deleted");
        getUserByIdData(converAsJson?.id);
      }, 300);
    } catch (error) {
      console.log("error", error);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const formReset = () => {
    setButtonLoading(false);
    setIsOpenForm(false);
    setValidationTrigger(false);
    setCertificateName("");
    setCertificateNameError("");
    setOrganizationName("");
    setOrganizationNameError("");
    setYear("");
    setYearError("");
    setDescription("");
    setDescriptionError("");
  };

  return (
    <div
      className="profilepage_personalinfo_main_container"
      style={{ padding: 0 }}
    >
      {isOpenForm ? (
        <div style={{ padding: 24 }}>
          <Row gutter={16} style={{ marginBottom: "30px" }}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}
              style={{ marginBottom: "20px" }}
            >
              <CommonInputField
                required={true}
                label="Certificate Name"
                onChange={(e) => {
                  setCertificateName(e.target.value);
                  if (validationTrigger) {
                    setCertificateNameError(addressValidator(e.target.value));
                  }
                }}
                value={certificateName}
                error={certificateNameError}
              />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={12}
              style={{ marginBottom: "20px" }}
            >
              <CommonInputField
                required={true}
                label="Issuing Organization"
                onChange={(e) => {
                  setOrganizationName(e.target.value);
                  if (validationTrigger) {
                    setOrganizationNameError(addressValidator(e.target.value));
                  }
                }}
                value={organizationName}
                error={organizationNameError}
              />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={12}
              style={{ marginBottom: "20px" }}
            >
              <CommonInputField
                required={true}
                label="Year"
                type="number"
                onChange={(e) => {
                  setYear(e.target.value);
                  if (validationTrigger) {
                    setYearError(yearValidator(e.target.value));
                  }
                }}
                value={year}
                error={yearError}
              />
            </Col>
            <Col span={24}>
              <CommonTextArea
                label="Description"
                required={true}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (validationTrigger) {
                    setDescriptionError(addressValidator(e.target.value));
                  }
                }}
                value={description}
                error={descriptionError}
              />
            </Col>
          </Row>
          <div className="profilepages_personalinfo_button_container">
            <button
              className="coursereviews_rating_modal_btn coursereviews_rating_modal_cancelbutton"
              style={{ width: "max-content" }}
              onClick={formReset}
            >
              Cancel
            </button>
            {buttonLoading ? (
              <button
                style={{ width: "70px" }}
                className="coursereviews_rating_modal_btn coursereviews_rating_modal_loading_submitbutton"
              >
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="coursereviews_rating_modal_btn coursereviews_rating_modal_submitbutton"
                style={{ width: "max-content" }}
                onClick={handleSubmit}
              >
                Add
              </button>
            )}
          </div>
        </div>
      ) : certificatesData.length >= 1 ? (
        <>
          {certificatesData.map((item, index) => {
            return (
              <React.Fragment>
                <div style={{ width: "100%", padding: 24 }}>
                  <div className="profilepage_experience_card">
                    {/* -------left div------------ */}
                    <div className="profilepage_experience_card_name_container">
                      <div className="profilepage_experience_card_image_container">
                        <img
                          src={BuildingImage}
                          className="profilepage_experience_card_image"
                        />
                      </div>
                      <div className="profilepage_experience_details_div">
                        <p className="profilepage_experience_designation">
                          {item.title}
                        </p>
                        <p className="profilepage_experience_company_name">
                          {item.issuing_organization}
                        </p>
                        <div className="profilepage_experience_location_div">
                          <p className="profilepage_experience_location_details">
                            Year: {item.issued_year} |
                          </p>
                          <p className="profilepage_experience_location_details">
                            Description: {item.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* -------right div------------ */}
                    <div>
                      <Popconfirm
                        title="Are you sure you want to delete?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => {
                          handleDelete(item.id);
                        }}
                        placement="top"
                        cancelButtonProps={{
                          className: "popconfirm-cancel-btn",
                        }}
                      >
                        <AiOutlineDelete
                          size={16}
                          color="#333333b6"
                          style={{ cursor: "pointer" }}
                        />
                      </Popconfirm>
                    </div>
                  </div>
                </div>
                <Divider className="tests_completedtests_divider" />
              </React.Fragment>
            );
          })}

          <div
            className="profilepages_personalinfo_button_container"
            style={{ padding: 24 }}
          >
            <button
              className="coursereviews_rating_modal_btn coursereviews_rating_modal_submitbutton"
              style={{ width: "max-content" }}
              onClick={() => {
                setIsOpenForm(true);
              }}
            >
              <IoMdAdd size={21} /> Add Certificate
            </button>
          </div>
        </>
      ) : (
        <div style={{ padding: 24 }}>
          <CommonNodataFound message="Please add your certificate" />
          <div className="profilepages_personalinfo_button_container">
            <button
              className="coursereviews_rating_modal_btn coursereviews_rating_modal_submitbutton"
              style={{ width: "max-content" }}
              onClick={() => {
                setIsOpenForm(true);
              }}
            >
              <IoMdAdd size={21} /> Add Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
