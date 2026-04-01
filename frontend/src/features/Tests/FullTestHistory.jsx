import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Modal, Button, Progress } from "antd";
import { CiSearch } from "react-icons/ci";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { userWiseTestFullHistory } from "../ApiService/action";
import CommonNodataFound from "../Common/CommonNoDataFound";
import { CommonMessage } from "../Common/CommonMessage";
import CommonInputField from "../Common/CommonInputField";
import Chart from "react-apexcharts";
import { AiOutlineClockCircle, AiOutlineStar } from "react-icons/ai";
import CommonSpinner from "../Common/CommonSpinner";

export default function FullTestHistory() {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [isOpenResultModal, setIsOpenResultModal] = useState(false);
  const [selectedResultData, setSelectedResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setPage(1);
    setHistoryData([]);
    setHasMore(true);
    getTestFullHistoryData(null, 1, true);
  }, []);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 1 >=
        document.documentElement.scrollHeight &&
      !apiLoading &&
      hasMore
    ) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [apiLoading, hasMore]);

  useEffect(() => {
    if (page > 1) {
      getTestFullHistoryData(null, page);
    }
  }, [page]);

  const getTestFullHistoryData = async (
    searchValue,
    pageNum = 1,
    isFirst = false,
  ) => {
    if (pageNum > 1) {
      setApiLoading(true);
    } else {
      setLoading(true);
    }
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const user = JSON.parse(getloginUserDetails || "{}");

    const payload = {
      test_name: searchValue,
      user_id: user?.id,
      page: pageNum,
      pageSize: 10,
    };
    try {
      const response = await userWiseTestFullHistory(payload);
      console.log("test full history", response);

      const tests_data = response?.data?.data?.testHistory || [];

      if (isFirst || pageNum === 1) {
        setHistoryData(tests_data);
      } else {
        setHistoryData((prev) => [...prev, ...tests_data]);
      }

      if (tests_data.length < 10) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      if (pageNum === 1) setHistoryData([]);
      console.log("get test history error", error);
    } finally {
      if (pageNum > 1) {
        setApiLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setTimeout(() => {
      getTestFullHistoryData(e.target.value, 1);
    }, 300);
  };

  return (
    <>
      <Row>
        <Col xs={12} sm={12} md={12} lg={12}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <IoArrowBackOutline
              size={30}
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate("/tests");
              }}
            />
            <p className="common_heading">Test History</p>
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

      <Row gutter={16} className="assignments_count_cards_main_container">
        <Col xs={24} sm={24} md={16} lg={8}>
          <CommonInputField
            placeholder="Search for Test"
            prefix={<CiSearch size={18} />}
            value={search}
            onChange={handleSearch}
          />
        </Col>
      </Row>

      <Row
        gutter={[
          { xs: 16, sm: 16, md: 16, lg: 16 },
          { xs: 16, sm: 16, md: 16, lg: 24 },
        ]}
        className="assignments_count_cards_main_container"
      >
        {historyData.length > 0 ? (
          historyData.map((item, index) => {
            return (
              <React.Fragment key={index}>
                <Col xs={24} sm={24} md={24} lg={12} xl={8} xxl={8}>
                  <div className="testhistory_cards">
                    <div className="test_history_cards_header_container">
                      <p className="tests_topiccards_header_heading">
                        {item.test_name}
                      </p>
                      <IoIosCheckmarkCircle size={24} color="#039855" />
                    </div>

                    <div className="test_history_score_container">
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          color: "#667085",
                        }}
                      >
                        Score: <strong>{item.total_marks_scored}</strong> |
                        Time:{" "}
                        <strong>
                          {Math.floor(item.total_time_taken / 60)}m{" "}
                          {item.total_time_taken % 60}s
                        </strong>
                      </p>
                    </div>

                    <div className="test_history_card_tag_main_container">
                      <div className="test_history_card_tag_row_div">
                        <div className="test_history_card_typetag_div">
                          On Demand Test
                        </div>
                        <div className="test_history_card_datetag_div">
                          Conducted on{" "}
                          {new Date(item.created_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </div>

                      <div className="test_history_card_timetag_container">
                        {new Date(item.created_date).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </div>

                      <div style={{ marginTop: "12px" }}>
                        <button
                          className="test_history_card_viewresult_button"
                          onClick={() => {
                            setSelectedResultData(item);
                            setIsOpenResultModal(true);
                          }}
                        >
                          View Result
                        </button>
                      </div>
                    </div>
                  </div>
                </Col>
              </React.Fragment>
            );
          })
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              marginTop: "40px",
            }}
          >
            <CommonNodataFound message="No test history found" />
          </div>
        )}
      </Row>
      {apiLoading && (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            width: "100%",
          }}
        >
          <CommonSpinner />
        </div>
      )}

      {/* Result Overview Modal */}
      <Modal
        title={
          <span style={{ fontSize: "20px", fontWeight: "600" }}>
            {selectedResultData?.test_name || "Test Result"}
          </span>
        }
        open={isOpenResultModal}
        onCancel={() => setIsOpenResultModal(false)}
        footer={null}
        width={900}
        centered
      >
        <div style={{ padding: "10px 0" }}>
          {/* Charts Section */}
          <div
            style={{
              border: "1px solid #eaecf0",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
              background: "#fff",
            }}
          >
            <Chart
              options={{
                chart: {
                  id: "marks-comparison",
                  toolbar: { show: false },
                },
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: "30%",
                    borderRadius: 4,
                  },
                },
                dataLabels: { enabled: false },
                stroke: {
                  show: true,
                  width: 2,
                  colors: ["transparent"],
                },
                xaxis: {
                  categories: [selectedResultData?.test_name || "Topic"],
                  axisBorder: { show: false },
                },
                yaxis: {
                  title: {
                    text: "Total Marks",
                    style: { color: "#667085", fontWeight: 400 },
                  },
                  min: 0,
                  max: selectedResultData?.max_mark,
                },
                fill: { opacity: 1 },
                legend: {
                  position: "top",
                  horizontalAlign: "right",
                  markers: { radius: 12 },
                },
                colors: ["#98bee7", "#175cd3"],
              }}
              series={[
                {
                  name: "Maximum Marks",
                  data: [selectedResultData?.max_mark],
                },
                {
                  name: "Scored Marks",
                  data: [selectedResultData?.total_marks_scored || 0],
                },
              ]}
              type="bar"
              height={300}
            />
          </div>

          <Row gutter={16}>
            <Col span={10}>
              <div
                style={{
                  border: "1px solid #eaecf0",
                  borderRadius: "12px",
                  padding: "0px 20px",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
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
                  <AiOutlineClockCircle size={30} color="#53389e" />
                </div>
                <div>
                  <p style={{ margin: 0, color: "#667085", fontSize: "14px" }}>
                    Total time
                  </p>
                  <p style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
                    {Math.floor(selectedResultData?.total_time_taken / 3600)}h:
                    {Math.floor(
                      (selectedResultData?.total_time_taken % 3600) / 60,
                    )}
                    m:
                    {selectedResultData?.total_time_taken % 60}s
                  </p>
                </div>
              </div>
            </Col>
            <Col span={10}>
              <div
                style={{
                  border: "1px solid #eaecf0",
                  borderRadius: "12px",
                  padding: "0px 20px",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
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
                  <AiOutlineStar size={30} color="#027a48" />
                </div>
                <div>
                  <p style={{ margin: 0, color: "#667085", fontSize: "14px" }}>
                    Total marks
                  </p>
                  <p style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
                    {selectedResultData?.total_marks_scored || 0} /{" "}
                    {selectedResultData?.max_mark}
                  </p>
                </div>
              </div>
            </Col>
            <Col span={4}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "160px",
                    height: "100px",
                  }}
                >
                  <Progress
                    type="dashboard"
                    percent={Math.round(
                      ((selectedResultData?.total_marks_scored || 0) / 30) *
                        100,
                    )}
                    strokeColor="#175cd3"
                    strokeWidth={10}
                    size={120}
                    gapDegree={180}
                    showInfo={false}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "14px",
                      left: "50%",
                      transform: "translateX(-52%)",
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#667085",
                          fontWeight: 400,
                        }}
                      >
                        {selectedResultData?.total_marks_scored || 0} /{" "}
                        {selectedResultData?.max_mark}
                      </span>
                      <span
                        style={{
                          fontSize: "24px",
                          fontWeight: "600",
                          color: "#101828",
                        }}
                      >
                        {Math.round(
                          ((selectedResultData?.total_marks_scored || 0) /
                            (selectedResultData?.max_mark || 1)) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          <Button
            type="primary"
            size="large"
            className="courses_addmodule_modal_createbutton"
            style={{
              marginTop: "30px",
              width: "fit-content",
              padding: "0 24px",
            }}
            onClick={() => {
              navigate(
                `/testresult/${selectedResultData?.test_name}/${selectedResultData?.history_id}`,
                {
                  state: {
                    test_id: selectedResultData?.test_id, // Correctly using the prop
                    topic_id: selectedResultData?.topic_id,
                  },
                },
              );
            }}
          >
            View Detailed Result
          </Button>
        </div>
      </Modal>
    </>
  );
}
