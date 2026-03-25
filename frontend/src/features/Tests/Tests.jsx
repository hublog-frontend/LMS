import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Divider, Button, Modal } from "antd";
import TestImage from "../../assets/test-B9eTwMz3.png";
import BuildingImage from "../../assets/building.png";
import "./styles.css";
import CommonSpinner from "../Common/CommonSpinner";
import CommonInputField from "../Common/CommonInputField";
import { addressValidator, formatToBackendIST } from "../Common/Validation";
import { createTopic, deleteTopic, getTopics } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import CommonNodataFound from "../Common/CommonNoDataFound";
import CommonDeleteModal from "../Common/CommonDeleteModal";

export default function Tests() {
  const navigate = useNavigate();
  const [isOpenAddTopicModal, setIsOpenAddTopicModal] = useState(false);
  const [editTopicId, setEditTopicId] = useState(null);
  const [topicName, setTopicName] = useState("");
  const [topicNameError, setTopicNameError] = useState("");
  const [topicLogoBase64, setTopicLogoBase64] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [topicsData, setTopicsData] = useState([]);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  useEffect(() => {
    getTopicsData();
  }, []);

  const getTopicsData = async () => {
    try {
      const response = await getTopics();
      console.log("get topics response", response);
      const topics_data = response?.data?.topics || [];
      setTopicsData(topics_data);
    } catch (error) {
      setTopicsData([]);
      console.log("get modules error", error);
    }
  };

  const handleCreateTopic = async () => {
    setValidationTrigger(true);
    const topicNameValidate = addressValidator(topicName);

    setTopicNameError(topicNameValidate);

    if (topicNameValidate) return;

    setButtonLoading(true);
    const today = new Date();

    const payload = {
      ...(editTopicId ? { topic_id: editTopicId } : {}),
      topic_name: topicName,
      logo_image: topicLogoBase64,
      created_date: formatToBackendIST(today),
    };

    try {
      await createTopic(payload);
      setTimeout(() => {
        setButtonLoading(false);
        formReset();
        getTopicsData();
        CommonMessage(
          "success",
          `Topic ${editTopicId ? "Updated" : "Created"} Successfully!`,
        );
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

  const handleDeleteTopic = async () => {
    try {
      await deleteTopic(editTopicId);
      setTimeout(() => {
        setButtonLoading(false);
        formReset();
        getTopicsData();
        CommonMessage("success", `Topic Deleted Successfully!`);
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

  const formReset = () => {
    setIsOpenAddTopicModal(false);
    setIsOpenDeleteModal(false);
    setTopicName("");
    setTopicNameError("");
    setEditTopicId(null);
    setTopicLogoBase64("");
    setValidationTrigger(false);
    setButtonLoading(false);
  };

  return (
    <div>
      {/* <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          marginTop: "10px",
        }}
      >
        <p className="common_heading" style={{ margin: 0 }}>
          Tests
        </p>

        <div className="courses_createmodule_button_container">
          <button
            className="courses_createcourse_button"
            onClick={() => setIsOpenAddTopicModal(true)}
          >
            Create Topic
          </button>
        </div>
      </div> */}
      <Row>
        <Col xs={12} sm={12} md={12} lg={12}>
          <p className="common_heading" style={{ margin: 0 }}>
            Tests
          </p>
        </Col>

        <Col
          xs={12}
          sm={12}
          md={12}
          lg={12}
          className="tests_createtopic_button_container"
        >
          <button
            className="courses_createcourse_button"
            onClick={() => setIsOpenAddTopicModal(true)}
          >
            Create Topic
          </button>
        </Col>
      </Row>

      <div className="tests_banner_main_container">
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12} lg={12} style={{ marginBottom: "20px" }}>
            <div className="tests_banner_left_container">
              <div>
                <p className="tests_banner_heading">Employability Test</p>
                <p className="tests_banner_sub_heading">
                  We are here to help you get your dream job through this test.
                </p>

                <div style={{ marginTop: "30px" }}>
                  <button className="tests_banner_viewhistory_button">
                    View History
                  </button>
                </div>
              </div>
            </div>
          </Col>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={12}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "20px",
            }}
          >
            <div className="tests_banner_left_container">
              <img src={TestImage} />
            </div>
          </Col>
        </Row>
      </div>

      <Row gutter={16} style={{ marginTop: "40px" }}>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "20px" }}>
          <div className="tests_completetest_container">
            <div className="tests_completedtest_header">
              <p className="tests_completedtest_heading">Upcoming Test</p>
              <p className="tests_completedtest_viewall_text">View All</p>
            </div>

            <Divider className="tests_completedtests_divider" />

            <div className="tests_completedtests_empty_container">
              <p className="tests_completedtests_empty_container_text">
                No Upcoming Test currently!
              </p>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: "20px" }}>
          <div className="tests_completetest_container">
            <div className="tests_completedtest_header">
              <p className="tests_completedtest_heading">Completed Test</p>
              <p className="tests_completedtest_viewall_text">View All</p>
            </div>

            <Divider className="tests_completedtests_divider" />

            <div>
              <div className="tests_completedtests_card_title_container">
                <p className="tests_completedtests_card_title">Arrays Test</p>
              </div>

              <div className="tests_completedtests_duration_container">
                <p className="tests_completedtests_duration_text">
                  <span style={{ color: "#667085" }}>Duration:</span> 1h:0
                </p>

                <p className="tests_completedtests_duration_text">
                  <span style={{ color: "#667085" }}>Type:</span> Arrays
                </p>
              </div>

              <div className="tests_completedtests_conducted_container">
                <div className="tests_completedtests_conducted_date_tag">
                  Conducted on Jan 17 2026
                </div>
                <div className="tests_completedtests_conducted_time_tag">
                  10:42 AM
                </div>
              </div>

              <div className="tests_completedtests_viewresult_container">
                <button className="tests_completedtests_viewresult_button">
                  View Result
                </button>
              </div>
            </div>

            {/* <div className="tests_completedtests_empty_container">
              <p className="tests_completedtests_empty_container_text">
                No Completed Test currently!
              </p>
            </div> */}
          </div>
        </Col>
      </Row>

      <p className="tests_ondemand_heading">On Demand - Topic Tests</p>

      {topicsData.length >= 1 ? (
        <div className="tests_ondemand_cards_main_container">
          {topicsData.map((item, index) => {
            return (
              <React.Fragment key={index}>
                <div
                  className="tests_ondemand_cards"
                  onClick={() => {
                    navigate(`/tests/onDemandTests/${item.id}`);
                  }}
                >
                  <div className="tests_topics_icon_container">
                    <AiOutlineEdit
                      size={15}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTopicId(item.id);
                        setTopicName(item.topic_name);
                        setTopicLogoBase64(item.logo_image);
                        setIsOpenAddTopicModal(true);
                      }}
                    />

                    <AiOutlineDelete
                      size={15}
                      className="action-delete-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpenDeleteModal(true);
                        setEditTopicId(item.id);
                      }}
                    />
                  </div>
                  {item.logo_image ? (
                    <img
                      src={`data:image/png;base64,${item.logo_image}`}
                      className="tests_ondemand_cards_image"
                    />
                  ) : (
                    <img
                      src={BuildingImage}
                      className="tests_ondemand_cards_image"
                    />
                  )}
                  <div style={{ width: "150px" }}>
                    <p className="tests_ondemand_cards_names">
                      {item.topic_name}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <CommonNodataFound message="No topics found" />
      )}

      {/* add topic modal */}
      <Modal
        title={"Add New Topic"}
        open={isOpenAddTopicModal}
        onCancel={formReset}
        width="35%"
        footer={[
          <Button
            key="cancel"
            onClick={formReset}
            className="courses_addmodule_modal_cancelbutton"
          >
            Cancel
          </Button>,

          buttonLoading ? (
            <Button
              key="create"
              type="primary"
              className="courses_addmodule_modal_loading_createbutton"
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              key="create"
              type="primary"
              onClick={handleCreateTopic}
              className="courses_addmodule_modal_createbutton"
            >
              {editTopicId ? "Update" : "Create"}
            </Button>
          ),
        ]}
      >
        <div style={{ marginTop: "20px" }}>
          <ImageUploadCrop
            label="Logo"
            aspect={1}
            maxSizeMB={1}
            required={false}
            value={topicLogoBase64}
            onChange={(base64) => setTopicLogoBase64(base64)}
            onErrorChange={""} // ✅ pass setter directly
          />{" "}
        </div>

        <div style={{ marginTop: "20px", marginBottom: "24px" }}>
          <CommonInputField
            label="Topic Name"
            required={true}
            onChange={(e) => {
              setTopicName(e.target.value);
              if (validationTrigger) {
                setTopicNameError(addressValidator(e.target.value));
              }
            }}
            value={topicName}
            error={topicNameError}
          />
        </div>
      </Modal>

      {/* delete modal */}
      <CommonDeleteModal
        open={isOpenDeleteModal}
        onCancel={() => {
          setIsOpenDeleteModal(false);
          setEditTopicId(null);
        }}
        content="Are you sure want to delete the Topic?"
        loading={buttonLoading}
        onClick={handleDeleteTopic}
      />
    </div>
  );
}
