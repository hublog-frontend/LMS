import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Progress,
  Carousel,
  Avatar,
  List,
  Card,
  Skeleton,
  Modal,
  Input,
} from "antd";
import { TrophyOutlined, RocketFilled, UserOutlined } from "@ant-design/icons";
import { getDashboardData } from "../ApiService/action";
import CrownImage from "../../assets/Crown-CyzW1Rzh.svg";
import LearningBanner from "../../assets/learning_banner.jpg";
import JourneyBanner from "../../assets/journey_banner.png";
import AIBanner from "../../assets/ai_banner.png";
import JourneyPDF from "../../assets/ShareYourJourney_Student.pdf";
import { FiShare2 } from "react-icons/fi";
import { IoIosCloseCircle } from "react-icons/io";
import "./styles.css";
import CommonTextArea from "../Common/CommonTextArea";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState([
    "#fullstack",
    "#javafullstack",
    "#ACTETechnologies",
  ]);
  const [shareContent, setShareContent] = useState(
    "Thrilled to share that I've ranked among the top coders on the TAP Academy leaderboard! Excited to keep pushing my limits and sharpening my coding skills.",
  );

  const availableHashtags = [
    "#java",
    "#sql",
    "#coding",
    "#programming",
    "#job",
    "#jobs",
    "#hiring",
    "#developer",
    "#coder",
    "#30DaysCodeAtACTE",
    "#ProgrammingChallenge",
    "#Day30",
    "#CodeNewbie",
    "#CodingCommunity",
    "#ProblemSolving",
    "#CodeWithACTE",
    "#30DaysCodeAtACTETechnologies",
  ];

  const handleAddHashtag = (tag) => {
    if (!selectedHashtags.includes(tag)) {
      setSelectedHashtags([...selectedHashtags, tag]);
    }
  };

  const handleRemoveHashtag = (tag) => {
    setSelectedHashtags(selectedHashtags.filter((t) => t !== tag));
  };

  const [data, setData] = useState({
    banners: [],
    leaderboard: [],
    userRank: 0,
    userTotalScore: 0,
    progress: { course: 0, assignment: 0, test: 0 },
  });

  const loginUserDetails = JSON.parse(localStorage.getItem("loginUserDetails"));
  const userId = loginUserDetails?.id;
  const userName = loginUserDetails?.user_name;
  const [progressBarsize, setProgressBarsize] = useState(120);

  const bannerData = [
    {
      id: 1,
      image_url: (
        <img src={LearningBanner} className="dashboard_banner_image" />
      ),
    },
    {
      id: 2,
      image_url: (
        <a href={JourneyPDF} target="_blank" rel="noreferrer">
          <img src={JourneyBanner} className="dashboard_banner_image" />
        </a>
      ),
    },
    {
      id: 3,
      image_url: <img src={AIBanner} className="dashboard_banner_image" />,
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 400) {
        setProgressBarsize(60); // mobile
      } else if (window.innerWidth < 576) {
        setProgressBarsize(80); // mobile
      } else if (window.innerWidth < 992) {
        setProgressBarsize(100); // tablet
      } else {
        setProgressBarsize(120); // desktop
      }
    };

    handleResize(); // initial call
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function fetchDashboard() {
    setLoading(true);
    try {
      if (userId) {
        const response = await getDashboardData(userId);
        setData(response?.data?.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const renderLeaderboardPodium = () => {
    if (data.leaderboard.length === 0) return null;

    const top3 = data.leaderboard.slice(0, 3);
    // Visual Order: [Rank 2, Rank 1, Rank 3]
    const visualOrder = [top3[1], top3[0], top3[2]];

    return (
      <div className="leaderboard_top_section">
        {visualOrder.map((user, index) => {
          if (!user) return null;
          const rankIndex = top3.indexOf(user) + 1;
          const rankClass = `rank_${rankIndex}`;
          const isCurrentUser = user.user_name === userName;

          return (
            <div
              key={user.user_name}
              className={`leaderboard_podium_item ${rankClass}`}
            >
              <div className="leaderboard_avatar_container">
                {rankIndex === 1 && (
                  <img src={CrownImage} className="leaderboard_crown" />
                )}
                <div className="leaderboard_rank_badge">{rankIndex}</div>
                {user.profile_image ? (
                  <Avatar
                    src={user.profile_image}
                    className="leaderboard_avatar"
                  />
                ) : (
                  <Avatar
                    icon={<UserOutlined />}
                    className="leaderboard_avatar"
                    style={{
                      backgroundColor:
                        rankIndex === 1
                          ? "#D9E3D8"
                          : rankIndex === 2
                            ? "#EAB308"
                            : "#FDBA74",
                      color: "#fff",
                      fontSize: rankIndex === 1 ? 55 : 45,
                    }}
                  >
                    {user.user_name.charAt(0)}
                  </Avatar>
                )}
              </div>
              <p className="leaderboard_name">{user.user_name}</p>
              <p className="leaderboard_score">{user.total_score}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="dashboard_container">
      {/* Banner Section */}
      <div className="dashboard_banner_container">
        {loading ? (
          <Skeleton.Button
            active
            style={{ width: "100%", height: 380, borderRadius: 16 }}
          />
        ) : (
          <Carousel
            autoplay
            arrows={true}
            className="dashboard_carousel"
            draggable
            effect="fade"
            speed={1000}
          >
            {bannerData.map((banner, idx) => (
              <div key={idx}>
                {/* <img
                  src={banner.image_url}
                  alt={`Banner ${idx}`}
                  className="dashboard_banner_image"
                /> */}
                {banner.image_url}
              </div>
            ))}
          </Carousel>
        )}
      </div>

      <Row gutter={[24, 24]}>
        {/* Progress Section */}
        <Col xs={24} lg={12} style={{ height: "100%" }}>
          <div className="dashboard_section_card">
            <h3 className="dashboard_section_title">
              <RocketFilled style={{ color: "#2160ad" }} /> Your Learning
              Progress
            </h3>
            <div className="dashboard_progress_grid">
              <div className="dashboard_progress_item">
                <Progress
                  type="circle"
                  percent={data.progress.course}
                  strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
                  size={progressBarsize}
                  strokeWidth={8}
                />
                <span className="dashboard_progress_label">Courses</span>
              </div>
              <div className="dashboard_progress_item">
                <Progress
                  type="circle"
                  percent={data.progress.assignment}
                  strokeColor={{ "0%": "#2160ad", "100%": "#6366f1" }}
                  size={progressBarsize}
                  strokeWidth={8}
                />
                <span className="dashboard_progress_label">Assignments</span>
              </div>
              <div className="dashboard_progress_item">
                <Progress
                  type="circle"
                  percent={data.progress.test}
                  strokeColor={{ "0%": "#f59e0b", "100%": "#ef4444" }}
                  size={progressBarsize}
                  strokeWidth={8}
                />
                <span className="dashboard_progress_label">Tests</span>
              </div>
            </div>
          </div>
        </Col>

        {/* Leaderboard Section */}
        <Col xs={24} lg={12}>
          <div className="dashboard_section_card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h3 className="dashboard_section_title" style={{ margin: 0 }}>
                <TrophyOutlined style={{ color: "#ffb800" }} /> Leaderboard
              </h3>
              <FiShare2
                size={24}
                color="#333"
                style={{ cursor: "pointer" }}
                onClick={() => setIsShareModalOpen(true)}
              />
            </div>

            <Modal
              title={
                <span style={{ fontSize: "18px", fontWeight: 600 }}>
                  Linkedin Post
                </span>
              }
              open={isShareModalOpen}
              onCancel={() => setIsShareModalOpen(false)}
              footer={null}
              width={650}
              centered
              className="linkedin_share_modal"
            >
              <div style={{ padding: "10px 0" }}>
                <div style={{ marginBottom: "20px" }}>
                  <CommonTextArea
                    rows={4}
                    value={shareContent}
                    onChange={(e) => setShareContent(e.target.value)}
                    className="dashboard_linkedin_message_inputfield"
                  />
                </div>

                <div
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid #eaecf0",
                    borderRadius: "12px",
                    padding: "0px 20px 16px 20px",
                    marginBottom: "20px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      marginBottom: "10px",
                    }}
                  >
                    Linkedin Message
                  </h4>
                  <p style={{ color: "#475467", marginBottom: "12px" }}>
                    {shareContent}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "6px",
                    }}
                  >
                    {selectedHashtags.map((tag) => (
                      <span key={tag} className="linkedin_hashtag_pill_light">
                        {tag}{" "}
                        {tag == "#ACTETechnologies" ? (
                          ""
                        ) : (
                          <IoIosCloseCircle
                            style={{
                              cursor: "pointer",
                              fontSize: "16px",
                              verticalAlign: "middle",
                            }}
                            onClick={() => handleRemoveHashtag(tag)}
                          />
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "30px",
                  }}
                >
                  {availableHashtags.map((tag) => (
                    <span
                      key={tag}
                      className="linkedin_hashtag_pill"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleAddHashtag(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  className="linkedin_post_button"
                  onClick={() => {
                    const baseUrl = "https://www.linkedin.com/feed/";
                    const hashtagsStr = selectedHashtags.join(" ");
                    const fullText = `${shareContent} \n\n ${hashtagsStr}`;
                    window.open(
                      `${baseUrl}?shareActive=true&text=${encodeURIComponent(fullText)}`,
                      "_blank",
                    );
                    setIsShareModalOpen(false);
                  }}
                >
                  Post on Linkedin
                </button>
              </div>
            </Modal>

            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <>
                {renderLeaderboardPodium()}

                <div className="leaderboard_list">
                  {data.leaderboard.slice(3).map((user, idx) => {
                    const isCurrentUser = user.user_name === userName;
                    return (
                      <div
                        key={user.user_name}
                        className={`leaderboard_list_item ${isCurrentUser ? "is_login_user" : ""}`}
                      >
                        <span className="leaderboard_list_rank">{idx + 4}</span>
                        <Avatar
                          src={user.profile_image}
                          icon={<UserOutlined />}
                          className="leaderboard_list_avatar"
                        />
                        <span className="leaderboard_list_name">
                          {user.user_name} {isCurrentUser && "(You)"}
                        </span>
                        <span className="leaderboard_list_score">
                          {user.total_score}
                        </span>
                      </div>
                    );
                  })}

                  {/* My Rank Section (if User is outside Top 10) */}
                  {data.userRank > 10 && (
                    <div
                      className="leaderboard_list_item is_login_user"
                      style={{ marginTop: 24 }}
                    >
                      <span className="leaderboard_list_rank">
                        {data.userRank}
                      </span>
                      <Avatar
                        src={loginUserDetails?.profile_image}
                        icon={<UserOutlined />}
                        className="leaderboard_list_avatar"
                      />
                      <span className="leaderboard_list_name">{userName}</span>
                      <span className="leaderboard_list_score">
                        {data.userTotalScore}
                      </span>
                    </div>
                  )}

                  {data.leaderboard.length === 0 && (
                    <p style={{ textAlign: "center" }}>No results yet</p>
                  )}
                </div>
              </>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
