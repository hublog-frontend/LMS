import React, { useEffect, useState, useRef } from "react";
import { Tabs, Button, Popconfirm, Skeleton, Empty } from "antd";
import {
  UnorderedListOutlined,
  CodeOutlined,
  VideoCameraOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { MdClose } from "react-icons/md";
import { userWiseBookmarks, removeBookmark } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import { useNavigate } from "react-router-dom";
import CommonPdfViewer from "../Common/CommonPdfViewer";
import "./styles.css";

export default function Bookmarks() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Question");
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);

  // PDF Viewer state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [currentPdf, setCurrentPdf] = useState({ url: "", title: "" });

  // Video Preview state
  const [isVideoFullOpen, setIsVideoFullOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState({ url: "", title: "" });

  const API_URL = import.meta.env.VITE_API_URL;
  const loginUserDetails = JSON.parse(localStorage.getItem("loginUserDetails"));
  const loginUserId = loginUserDetails?.id;

  useEffect(() => {
    fetchBookmarks();
  }, [activeTab]);

  // Sync Video Exit with Fullscreen change
  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement && isVideoFullOpen) {
        setIsVideoFullOpen(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, [isVideoFullOpen]);

  const fetchBookmarks = async () => {
    if (!loginUserId) return;
    setLoading(true);
    try {
      const payload = {
        user_id: loginUserId,
        category_type: activeTab,
      };
      const response = await userWiseBookmarks(payload);
      setBookmarks(response?.data?.result || []);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookmarkId) => {
    try {
      const payload = {
        bookmark_id: bookmarkId,
      };
      await removeBookmark(payload);
      CommonMessage("success", "Bookmark removed successfully");
      fetchBookmarks();
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      CommonMessage("error", "Failed to remove bookmark");
    }
  };

  const getIcon = (item) => {
    if (activeTab === "Question") {
      return item.question_type === "MCQ" ? (
        <UnorderedListOutlined />
      ) : (
        <CodeOutlined />
      );
    }
    if (activeTab === "Video") return <VideoCameraOutlined />;
    if (activeTab === "Lecture") return <FileTextOutlined />;
    return <FileTextOutlined />;
  };

  const getTitle = (item) => {
    if (activeTab === "Question") return item.question;
    if (activeTab === "Video") return item.video_title;
    if (activeTab === "Lecture") return item.title || item.original_name;
    return "";
  };

  const getActionText = (item) => {
    if (activeTab === "Question") {
      return item.question_type === "MCQ" ? "Solve MCQ" : "Solve Challenge";
    }
    if (activeTab === "Video") return "Watch video";
    if (activeTab === "Lecture") return "View PDF";
    return "View";
  };

  const handleAction = (item) => {
    if (activeTab === "Question") {
      const question_item = {
        ...item,
        mq_id: item.key_column,
        id: item.question_id,
        user_status: { score_obtained: 0, num_of_attempt: 0 },
      };

      const module_item = {
        id: item.assignment_module_id,
        module_name: "Bookmarked Question",
      };

      navigate("/assignment-practice", {
        state: {
          question_item: question_item,
          module_item: module_item,
        },
      });
    } else if (activeTab === "Video") {
      setCurrentVideo({
        url: `${API_URL}${item.file_path}`,
        title: item.video_title,
      });
      setIsVideoFullOpen(true);

      // Trigger fullscreen on user gesture
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err) => {
          console.error("Error attempting full-screen:", err);
        });
      }
    } else if (activeTab === "Lecture") {
      setCurrentPdf({
        url: `${API_URL}${item.file_path}`,
        title: item.title || item.original_name,
      });
      setIsPdfModalOpen(true);
    }
  };

  const closeVideo = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsVideoFullOpen(false);
  };

  const BookmarkList = () => {
    if (loading) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              active
              avatar
              paragraph={{ rows: 1 }}
              block
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "10px",
              }}
            />
          ))}
        </div>
      );
    }

    if (bookmarks.length === 0) {
      return (
        <div style={{ marginTop: "60px" }}>
          <Empty
            description={`No bookmarked ${activeTab.toLowerCase()}s found`}
          />
        </div>
      );
    }

    return (
      <div className="bookmarks-list">
        {bookmarks.map((item) => (
          <div key={item.bookmark_id} className="bookmark-card">
            <div className="bookmark-left" onClick={() => handleAction(item)}>
              <div className="bookmark-icon-wrapper">{getIcon(item)}</div>
              <span className="bookmark-title">{getTitle(item)}</span>
            </div>
            <div className="bookmark-right">
              <Button className="action-btn" onClick={() => handleAction(item)}>
                {getActionText(item)}
              </Button>
              <Popconfirm
                title="Remove Bookmark?"
                description="Are you sure you want to remove this bookmark?"
                onConfirm={() => handleDelete(item.bookmark_id)}
                okText="Yes"
                cancelText="No"
              >
                <div className="delete-btn">
                  <DeleteOutlined />
                </div>
              </Popconfirm>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabItems = [
    { label: "Question", key: "Question" },
    { label: "Video", key: "Video" },
    { label: "Lecture Notes", key: "Lecture" },
  ];

  return (
    <div className="bookmarks-container">
      <p className="common_heading bookmark_heading">Bookmarks</p>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="bookmarks_tabs"
        items={tabItems.map((tab) => ({
          ...tab,
          children: <BookmarkList />,
        }))}
      />

      <CommonPdfViewer
        open={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        pdfUrl={currentPdf.url}
        title={currentPdf.title}
        isFullScreen={true}
      />

      {/* Full Screen Video Viewer Overlay */}
      {isVideoFullOpen && (
        <div className="video-full-page-viewer-overlay">
          <div className="video-full-screen-container">
            <div className="video-viewer-header">
              <h3 className="video-viewer-title">{currentVideo.title}</h3>
              <Button
                icon={<MdClose size={28} />}
                onClick={closeVideo}
                type="text"
                className="video-close-btn"
              />
            </div>
            <div className="video-content-area">
              <video controls autoPlay className="full-video-player">
                <source src={currentVideo.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
