import React, { useState, useEffect } from "react";
import { Row, Col, Tabs, Button, Drawer, Upload, Modal, Skeleton } from "antd";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaRegNoteSticky } from "react-icons/fa6";
import { LuClock4 } from "react-icons/lu";
import { IoIosArrowDown } from "react-icons/io";
import { FiVideo } from "react-icons/fi";
import { FiBookmark } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa6";
import { AiTwotoneCheckCircle } from "react-icons/ai";
import { RiCheckboxCircleFill } from "react-icons/ri";
import { IoCloudUploadOutline } from "react-icons/io5";
import "./styles.css";
import CourseOverview from "./CourseOverview";
import CourseDiscussion from "./CourseDiscussion";
import CourseReviews from "./CourseReviews";
import CommonSpinner from "../Common/CommonSpinner";
import CommonInputField from "../Common/CommonInputField";
import {
  addressValidator,
  selectValidator,
  youtubeLinkValidator,
} from "../Common/Validation";
import {
  createModule,
  getCourses,
  getModules,
  getReviews,
  getVideos,
  addBookmark,
  removeBookmark,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import NodataImage from "../../assets/nodata.png";
import CommonSelectField from "../Common/CommonSelectField";
import { MdDelete } from "react-icons/md";
import {
  uploadCourseVideo,
  deleteCourseVideo,
} from "../ApiService/MultipartApi";
import CommonNodataFound from "../Common/CommonNoDataFound";
import { CgPlayStopO } from "react-icons/cg";
import { DeleteOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

export default function CourseVideos({
  setIsOpenCourseTab,
  clickedCourseDetails,
  setClickedCourseDetails,
  setCoursesData,
}) {
  const [openAccordionIds, setOpenAccordionIds] = useState([]);
  const [modulesData, setModulesData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);
  const [isOpenAddModuleModal, setIsOpenAddModuleModal] = useState(false);
  const [moduleName, setModuleName] = useState("");
  const [moduleNameError, setModuleNameError] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleTitleError, setModuleTitleError] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  //upload video
  const [isOpenUploadVideoDrawer, setIsOpenUploadVideoDrawer] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoTitleError, setVideoTitleError] = useState("");
  const [moduleId, setModuleId] = useState(null);
  const [moduleIdError, setModuleIdError] = useState("");
  const videoTypeOptions = [
    { id: "video", name: "Internal Video" },
    { id: "youtube", name: "Youtube Link" },
  ];
  const [videoType, setVideoType] = useState("video");
  const [videoTypeError, setVideoTypeError] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeUrlError, setYoutubeUrlError] = useState("");
  const [courseVideo, setCourseVideo] = useState(null);
  const [courseVideoError, setCourseVideoError] = useState("");
  const [courseVideoArray, setCourseVideoArray] = useState([]);
  const [moduleVideosMap, setModuleVideosMap] = useState({});
  const [moduleVideosLoadingMap, setModuleVideosLoadingMap] = useState({});
  const [activeVideo, setActiveVideo] = useState(null);

  const loginUserDetails = JSON.parse(localStorage.getItem("loginUserDetails"));
  const loginUserId = loginUserDetails?.id;
  const [hours, minutes] = clickedCourseDetails.duration_period.split(":");

  useEffect(() => {
    getModulesData(true, true);
  }, []);

  const getModulesData = async (
    triggerGetReviewsApi = true,
    isInitialCall = false,
  ) => {
    try {
      const response = await getModules(clickedCourseDetails?.id);
      console.log("get modules response", response);
      const modules_data = response?.data?.data || [];
      setModulesData(modules_data);
      if (isInitialCall && modules_data.length >= 1) {
        setOpenAccordionIds([modules_data[0].id]);
        getModuleVideos(modules_data[0].id);
      }
    } catch (error) {
      setModulesData([]);
      console.log("get modules error", error);
    } finally {
      setTimeout(() => {
        if (triggerGetReviewsApi) {
          getReviewsData();
        }
      }, 300);
    }
  };

  const getReviewsData = async () => {
    try {
      const response = await getReviews(clickedCourseDetails?.id);
      console.log("get reviews response", response);
      setReviewsData(response?.data?.data || []);
    } catch (error) {
      setReviewsData([]);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const getCoursesData = async () => {
    try {
      const response = await getCourses();
      console.log("get courses response", response);
      const course_data = response?.data?.data || [];
      setCoursesData(course_data);
      const current_course_data = course_data.find(
        (f) => f.id == clickedCourseDetails?.id,
      );
      setClickedCourseDetails(current_course_data);
    } catch (error) {
      setCoursesData([]);
      console.log("get course error", error);
    } finally {
      setTimeout(() => {
        getModulesData(false);
      }, 300);
    }
  };

  const handleCreateModule = async () => {
    setValidationTrigger(true);
    const moduleNameValidate = addressValidator(moduleName);
    const moduleTitleValidate = addressValidator(moduleTitle);

    setModuleNameError(moduleNameValidate);
    setModuleTitleError(moduleTitleValidate);

    if (moduleNameValidate || moduleTitleValidate) return;

    setButtonLoading(true);
    const payload = {
      course_id: clickedCourseDetails?.id,
      module_name: moduleName,
      title: moduleTitle,
    };
    try {
      await createModule(payload);
      setTimeout(() => {
        setButtonLoading(false);
        formReset();
        getModulesData(false);
        CommonMessage("success", "Module Created Successfully!");
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

  const handleCourseVideo = ({ file }) => {
    console.log("fileeeeee", file);
    const ValidType =
      file.type?.startsWith("video/") ||
      file.name?.toLowerCase().endsWith(".mp4") ||
      file.name?.toLowerCase().endsWith(".mov");

    if (file.status === "uploading" || file.status === "removed") {
      setCourseVideo(null);
      setCourseVideoArray([]);
      return;
    }

    if (ValidType) {
      // Use originFileObj for Ant Design Upload
      const actualFile = file.originFileObj || file;
      setCourseVideo(actualFile);
      setCourseVideoArray([file]);
      console.log("DEBUG: File captured:", actualFile);
      CommonMessage("success", "Video selected");
    } else {
      setCourseVideo(null);
      setCourseVideoArray([]);
      CommonMessage("error", "Only video files are accepted");
    }
  };

  const handleVideoUpload = async () => {
    const titleValidate = addressValidator(videoTitle);
    const moduleIdValidate = selectValidator(moduleId);
    const youtubeUrlValidate =
      videoType === "youtube" ? youtubeLinkValidator(youtubeUrl) : "";
    const courseVideoValidate =
      videoType === "video" || videoType === "google_drive"
        ? selectValidator(courseVideo)
        : "";

    setVideoTitleError(titleValidate);
    setModuleIdError(moduleIdValidate);
    setYoutubeUrlError(youtubeUrlValidate);
    setCourseVideoError(courseVideoValidate);

    if (
      titleValidate ||
      moduleIdValidate ||
      youtubeUrlValidate ||
      courseVideoValidate
    )
      return;

    setButtonLoading(true);

    const formData = new FormData();

    formData.append("module_id", moduleId);
    formData.append("title", videoTitle);
    formData.append("content_type", videoType);
    formData.append("content_url", youtubeUrl);
    formData.append("content", courseVideo);

    console.log("DEBUG: Sending Payload:", {
      module_id: moduleId,
      title: videoTitle,
      content_type: videoType,
      content_url: youtubeUrl,
      file: courseVideo?.name,
    });

    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    try {
      const response = await uploadCourseVideo(formData);
      const currentModuleId = moduleId; // Capture moduleId before formReset
      setTimeout(() => {
        CommonMessage("success", "Video Uploaded Successfully!");

        // Refresh the specific module's videos immediately
        if (currentModuleId) {
          getModuleVideos(currentModuleId);
          // Automatically open the accordion for that module
          if (!openAccordionIds.includes(currentModuleId)) {
            setOpenAccordionIds((prev) => [...prev, currentModuleId]);
          }
        }

        formReset();
        getCoursesData();
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

  const handleDeleteVideo = (lesson) => {
    Modal.confirm({
      title: "Delete Video",
      content: `Are you sure you want to delete "${lesson.title}"?`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const filename =
            lesson.content_type === "video" ? lesson.filename : null;
          await deleteCourseVideo({ id: lesson.id, filename });
          setTimeout(() => {
            CommonMessage("success", "Video Deleted Successfully!");
            getModuleVideos(lesson.module_id);
            getCoursesData();
          }, 300);
        } catch (error) {
          CommonMessage("error", "Failed to delete video");
        }
      },
    });
  };

  const getModuleVideos = async (id) => {
    setModuleVideosLoadingMap((prev) => ({ ...prev, [id]: true }));
    const payload = {
      course_id: clickedCourseDetails?.id,
      module_id: id,
      user_id: loginUserId,
    };
    try {
      const response = await getVideos(payload);
      console.log("get module videos response", response);
      const videos = response?.data?.videos || [];
      setModuleVideosMap((prev) => ({ ...prev, [id]: videos }));
      if (videos.length >= 1 && !activeVideo) {
        setActiveVideo(videos[0]);
      }
    } catch (error) {
      setModuleVideosMap((prev) => ({ ...prev, [id]: [] }));
      console.log("get module videos error", error);
    } finally {
      setModuleVideosLoadingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  const getYoutubeId = (url) => {
    if (!url) return "";

    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.hostname === "youtu.be") {
        return parsedUrl.pathname.slice(1);
      }

      return parsedUrl.searchParams.get("v");
    } catch {
      return "";
    }
  };
  const getMinutes = (duration) => {
    const [hours, minutes, seconds] = duration.split(":").map(Number);

    const totalMinutes = hours * 60 + minutes;
    return `${totalMinutes} mins`;
  };

  const handleAddOrRemoveBookmark = async (lesson) => {
    try {
      if (lesson.is_bookmarked) {
        // Prepare remove payload for the enhanced removeBookmark API
        const removePayload = {
          user_id: loginUserId,
          category_type: "Video",
          key_column: lesson.id,
        };
        await removeBookmark(removePayload);
        CommonMessage("success", "Bookmark removed!");
      } else {
        const payload = {
          user_id: loginUserId,
          category_type: "Video",
          key_column: lesson.id,
          created_date: new Date(),
        };
        await addBookmark(payload);
        CommonMessage("success", "Bookmark added!");
      }

      // Refresh the specific module's videos to update UI
      getModuleVideos(lesson.module_id);

      // Update active video state if currently bookmarked video is being played
      if (activeVideo && activeVideo.id === lesson.id) {
        setActiveVideo((prev) => ({
          ...prev,
          is_bookmarked: lesson.is_bookmarked ? 0 : 1,
        }));
      }
    } catch (error) {
      console.error("Bookmark Error:", error);
    }
  };

  const formReset = () => {
    setValidationTrigger(false);
    setIsOpenAddModuleModal(false);
    setIsOpenUploadVideoDrawer(false);
    setButtonLoading(false);
    setModuleName("");
    setModuleNameError("");
    setModuleTitle("");
    setModuleTitleError("");
    //videos usestates
    setVideoTitle("");
    setVideoTitleError("");
    setModuleId(null);
    setModuleIdError("");
    setVideoType("video");
    setVideoTypeError("");
    setCourseVideo("");
    setCourseVideoArray([]);
    setCourseVideoError("");
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={12} lg={12}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <IoArrowBackOutline
              size={30}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setIsOpenCourseTab(true);
                setClickedCourseDetails(null);
              }}
            />
            <p className="common_heading">Problem Solving</p>
          </div>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={12}
          lg={12}
          className="courses_createmodule_button_container"
        >
          <button
            className="courses_createcourse_button"
            onClick={() => setIsOpenAddModuleModal(true)}
          >
            Create Module
          </button>

          <button
            className="courses_createcourse_button"
            onClick={() => setIsOpenUploadVideoDrawer(true)}
          >
            Upload Video
          </button>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} sm={24} md={24} lg={15} style={{ marginTop: "40px" }}>
          {activeVideo ? (
            activeVideo.content_type === "youtube" ? (
              <iframe
                key={activeVideo?.file_path}
                src={`https://www.youtube.com/embed/${getYoutubeId(activeVideo?.file_path)}`}
                allowFullScreen
                allow="autoplay; encrypted-media"
                className="courses_iframevideos"
                style={{ height: "400px" }}
              ></iframe>
            ) : activeVideo.content_type === "google_drive" ? (
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  height: "400px",
                  width: "100%",
                  borderRadius: "8px",
                  border: "1px solid #eaecf0",
                }}
              >
                <iframe
                  key={activeVideo?.file_path}
                  src={`https://drive.google.com/file/d/${activeVideo?.filename}/preview?authuser=0&rm=minimal`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: "-48px", // Cropping the Google Drive header
                    left: "0",
                    width: "100%",
                    height: "calc(100% + 48px)",
                    border: "none",
                  }}
                ></iframe>
              </div>
            ) : (
              <video
                key={activeVideo?.file_path}
                controls
                controlsList="nodownload"
                className="courses_iframevideos"
              >
                <source
                  src={`${import.meta.env.VITE_API_URL}${activeVideo?.file_path}`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            )
          ) : (
            <div
              className="courses_iframevideos"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f9fafb",
                border: "1px solid #eaecf0",
                height: "400px",
              }}
            >
              <CommonNodataFound message="No videos found" />
            </div>
          )}
          <p className="coursevideos_active_video_title">
            {activeVideo ? activeVideo.title : "Select a video to play"}
          </p>
          <div>
            <Tabs
              className="report_tabs"
              defaultActiveKey="1"
              items={[
                {
                  label: "Overview",
                  key: "1",
                  children: (
                    <CourseOverview courseDetails={clickedCourseDetails} />
                  ),
                },
                {
                  label: "Discussion",
                  key: "2",
                  children: (
                    <CourseDiscussion
                      courseDetails={clickedCourseDetails}
                      reviewsData={reviewsData}
                    />
                  ),
                },
                {
                  label: "Reviews",
                  key: "3",
                  children: (
                    <CourseReviews
                      courseDetails={clickedCourseDetails}
                      reviewsData={reviewsData}
                    />
                  ),
                },
              ]}
            />
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={9} style={{ marginTop: "40px" }}>
          <p className="coursevideos_content_heading">Course Content</p>

          <div className="coursevideos_modules_container">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FaRegNoteSticky size={19} />
              <p style={{ fontSize: "16px" }}>
                {clickedCourseDetails.module_count} Modules
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LuClock4 size={19} />
              <p style={{ fontSize: "16px" }}>
                {" "}
                {`${parseInt(hours)} Hr ${parseInt(minutes)} mins`}
              </p>
            </div>
          </div>

          {/* ----------------modules accordion---------------- */}
          {modulesData.map((item, index) => {
            const [hours, minutes] = item.duration_period.split(":");
            const isOpen = openAccordionIds.includes(item.id);
            const currentVideos = moduleVideosMap[item.id] || [];
            const isVideosLoading = moduleVideosLoadingMap[item.id];

            return (
              <div
                className="coursevideos_accordion_maincontainer"
                key={item.id}
              >
                <div
                  className={
                    isOpen
                      ? "coursevideos_active_accordion_sub_container"
                      : "coursevideos_accordion_sub_container"
                  }
                >
                  <header
                    className={
                      isOpen
                        ? "coursevideos_accordion_active_header"
                        : "coursevideos_accordion_header"
                    }
                    onClick={() => {
                      if (isOpen) {
                        setOpenAccordionIds(
                          openAccordionIds.filter((id) => id !== item.id),
                        );
                      } else {
                        setOpenAccordionIds([...openAccordionIds, item.id]);
                        if (!moduleVideosMap[item.id]) {
                          getModuleVideos(item.id);
                        }
                      }
                    }}
                  >
                    {/* --------------header left--------------- */}
                    <div>
                      <p className="coursevideos_modulename_text">
                        {item.module_name}
                        <span
                          style={{
                            color: isOpen ? "#fff" : "#667085",
                          }}
                        >
                          {item.title}
                        </span>
                      </p>

                      {isOpen ? (
                        <div className="coursevideos_active_accordion_modules_container">
                          <div className="coursevideos_lessons_container">
                            <FaRegNoteSticky size={13} />
                            <p>{item.video_count} Lessons</p>
                          </div>

                          <div className="coursevideos_hours_conatiner">
                            <LuClock4 size={12} />
                            <p>
                              {`${parseInt(hours)} Hr ${parseInt(minutes)} mins`}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="coursevideos_modules_container">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <FaRegNoteSticky size={19} />
                            <p style={{ fontSize: "16px" }}>
                              {item.video_count} Lessons
                            </p>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <LuClock4 size={19} />
                            <p style={{ fontSize: "16px" }}>
                              {`${parseInt(hours)} Hr ${parseInt(minutes)} mins`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>{" "}
                    {/* --------------header right--------------- */}
                    <div className="coursevideos_accordion_arrowcontainer">
                      <IoIosArrowDown size={19} />
                    </div>
                  </header>

                  {isOpen && (
                    <>
                      {isVideosLoading ? (
                        <div
                          style={{ padding: "20px" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {[1, 2, 3].map((item) => (
                            <Skeleton
                              key={item}
                              active
                              avatar={{ shape: "square" }}
                              paragraph={{ rows: 1 }}
                              title={{ width: "60%" }}
                            />
                          ))}
                        </div>
                      ) : currentVideos.length >= 1 ? (
                        <>
                          {currentVideos.map((lesson, idx) => {
                            return (
                              <React.Fragment key={idx}>
                                <div
                                  className="coursevideos_accordion_content_container"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("hoooo", lesson);
                                    setActiveVideo(lesson);
                                  }}
                                >
                                  <div className="coursevideos_videoicon_conatiner">
                                    <FiVideo color="#fff" width={16} />
                                  </div>

                                  <div style={{ flex: 1 }}>
                                    <p
                                      className="coursevideos_videoname"
                                      style={{
                                        fontWeight:
                                          activeVideo?.id === lesson.id
                                            ? "600"
                                            : "400",
                                        color:
                                          activeVideo?.id === lesson.id
                                            ? "#2160ad"
                                            : "#344054",
                                      }}
                                    >
                                      {lesson.title}
                                      {lesson.is_bookmarked ? (
                                        <FaBookmark
                                          size={17}
                                          color="#2160ad"
                                          style={{
                                            flexShrink: 0,
                                            cursor: "pointer",
                                            marginLeft: "10px",
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddOrRemoveBookmark(lesson);
                                          }}
                                        />
                                      ) : (
                                        <FiBookmark
                                          size={18}
                                          color="#2160ad"
                                          style={{
                                            flexShrink: 0,
                                            cursor: "pointer",
                                            marginLeft: "10px",
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddOrRemoveBookmark(lesson);
                                          }}
                                        />
                                      )}
                                    </p>
                                    <p className="coursevideos_videotiming">
                                      {getMinutes(lesson.duration)}
                                    </p>
                                  </div>

                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      gap: "12px",
                                      fontSize: "16px",
                                    }}
                                    className="delete-btn"
                                  >
                                    <DeleteOutlined
                                      size={20}
                                      className="coursevideos_delete_icon"
                                      color="#f5222d"
                                      style={{
                                        flexShrink: 0,
                                        cursor: "pointer",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteVideo(lesson);
                                      }}
                                    />
                                    {activeVideo?.id === lesson.id ? (
                                      <CgPlayStopO size={22} color="#2160ad" />
                                    ) : (
                                      <RiCheckboxCircleFill
                                        size={20}
                                        color="#667085"
                                      />
                                    )}
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          })}
                        </>
                      ) : (
                        <div
                          className="coursevideos_nolessons_container"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img src={NodataImage} />
                          <p>No lessons found</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </Col>
      </Row>

      {/* create module modal */}
      <Modal
        title={"Add Module"}
        open={isOpenAddModuleModal}
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
              onClick={handleCreateModule}
              className="courses_addmodule_modal_createbutton"
            >
              {"Create"}
            </Button>
          ),
        ]}
      >
        <div style={{ marginTop: "20px" }}>
          <CommonInputField
            label="Module Name"
            required={true}
            onChange={(e) => {
              setModuleName(e.target.value);
              if (validationTrigger) {
                setModuleNameError(addressValidator(e.target.value));
              }
            }}
            value={moduleName}
            error={moduleNameError}
          />
        </div>

        <div style={{ marginTop: "30px", marginBottom: "25px" }}>
          <CommonInputField
            label="Title"
            required={true}
            onChange={(e) => {
              setModuleTitle(e.target.value);
              if (validationTrigger) {
                setModuleTitleError(addressValidator(e.target.value));
              }
            }}
            value={moduleTitle}
            error={moduleTitleError}
          />
        </div>
      </Modal>

      {/* upload video drawer */}
      <Drawer
        title="Upload Video"
        open={isOpenUploadVideoDrawer}
        onClose={formReset}
        size={"40%"}
        style={{ position: "relative", paddingBottom: "60px" }}
        className="courses_createcourses_drawer"
      >
        <Row gutter={16} className="courses_createcourse_drawer_row_div">
          <Col xs={24} sm={24} md={24} lg={24} style={{ marginTop: "30px" }}>
            <CommonInputField
              required={true}
              label="Title"
              onChange={(e) => {
                setVideoTitle(e.target.value);
                setVideoTitleError(addressValidator(e.target.value));
              }}
              value={videoTitle}
              error={videoTitleError}
            />
          </Col>

          <Col xs={24} sm={24} md={24} lg={12} style={{ marginTop: "30px" }}>
            <CommonSelectField
              required={true}
              label="Module"
              options={modulesData}
              onChange={(e) => {
                setModuleId(e.target.value);
                setModuleIdError(selectValidator(e.target.value));
              }}
              value={moduleId}
              error={moduleIdError}
            />
          </Col>

          <Col xs={24} sm={24} md={24} lg={12} style={{ marginTop: "30px" }}>
            <CommonSelectField
              required={true}
              label="Video Type"
              options={videoTypeOptions}
              onChange={(e) => {
                setVideoType(e.target.value);
                setVideoTypeError(selectValidator(e.target.value));
              }}
              value={videoType}
              error={videoTypeError}
              allowClear={false}
            />
          </Col>

          {videoType === "youtube" ? (
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}
              style={{ marginTop: "30px", marginBottom: "40px" }}
            >
              <CommonInputField
                required={true}
                label="Youtube Url"
                onChange={(e) => {
                  setYoutubeUrl(e.target.value);
                  setYoutubeUrlError(youtubeLinkValidator(e.target.value));
                }}
                value={youtubeUrl}
                error={youtubeUrlError}
              />
            </Col>
          ) : (
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}
              style={{ marginTop: "30px", marginBottom: "40px" }}
            >
              <p className="common_inputfields_label">
                Video <span style={{ color: "#d32f2f" }}>*</span>
              </p>
              <Dragger
                className="profilepage_personalinfo_dragger"
                multiple={false}
                accept="video/*"
                beforeUpload={(file) => {
                  console.log(file);
                  return false; // Prevent auto-upload
                }}
                maxCount={1}
                onChange={handleCourseVideo}
                fileList={courseVideoArray}
              >
                <IoCloudUploadOutline
                  size={45}
                  color="#0056b3"
                  style={{ marginBottom: "16px" }}
                />
                <p className="ant-upload-text">
                  Click or drag video to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Strictly prohibited from uploading company data or other
                  banned files.
                </p>
              </Dragger>
              {courseVideoError && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#d32f2f",
                    marginTop: "4px",
                  }}
                >
                  Course Video{courseVideoError}
                </p>
              )}
            </Col>
          )}
        </Row>

        <div className="courses_createcourses_drawer_footer">
          <div className="courses_createcourses_drawer_submit_buttoncontainer">
            {buttonLoading ? (
              <button className="courses_createcourses_drawer_loadingsubmitbutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="courses_createcourses_drawer_submitbutton"
                onClick={handleVideoUpload}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
