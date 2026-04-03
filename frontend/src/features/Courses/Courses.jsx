import React, { useState, useEffect } from "react";
import { Col, Drawer, Row } from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { FaRegNoteSticky } from "react-icons/fa6";
import { LuClock4 } from "react-icons/lu";
import { IoArrowForwardOutline } from "react-icons/io5";
import ProblemSolvingImage from "../../assets/problem_solving_tab academy.png";
import "./styles.css";
import CourseVideos from "./CourseVideos";
import CommonInputField from "../Common/CommonInputField";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import { addressValidator, selectValidator, isAdmin } from "../Common/Validation";
import CommonSpinner from "../Common/CommonSpinner";
import { CommonMessage } from "../Common/CommonMessage";
import { getCourses, createCourse } from "../ApiService/action";
import CommonNodataFound from "../Common/CommonNoDataFound";

export default function Courses() {
  const [coursesData, setCoursesData] = useState([]);
  const [clickedCourseDetails, setClickedCourseDetails] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [isOpenCourseTab, setIsOpenCourseTab] = useState(true);
  const [isOpenAddCourseDrawer, setIsOpenAddCourseDrawer] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseNameError, setCourseNameError] = useState("");
  const [courseBannerBase64, setCourseBannerBase64] = useState("");
  const [courseBannerError, setCourseBannerError] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [outcomes, setOutcomes] = useState("");
  const [outcomesError, setOutcomesError] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    getCoursesData();
  }, []);

  const getCoursesData = async () => {
    try {
      const response = await getCourses();
      console.log("get courses response", response);
      setCoursesData(response?.data?.data || []);
    } catch (error) {
      setCoursesData([]);
      console.log("get course error", error);
    }
  };

  const handleSearch = (e) => {
    console.log(e.target.value);
    setSearchValue(e.target.value);
  };

  const handleCourseCreate = async () => {
    setValidationTrigger(true);
    const courseNameValidate = addressValidator(courseName);
    const courseBannerValidate = selectValidator(courseBannerBase64);
    const descriptionValidate = addressValidator(description);
    const outcomesValidate = addressValidator(outcomes);

    setCourseNameError(courseNameValidate);
    setCourseBannerError(courseBannerValidate);
    setDescriptionError(descriptionValidate);
    setOutcomesError(outcomesValidate);

    if (
      courseNameValidate ||
      courseBannerValidate ||
      descriptionValidate ||
      outcomesValidate
    )
      return;

    setButtonLoading(true);

    const payload = {
      course_name: courseName,
      image: courseBannerBase64,
      description: description,
      outcomes: outcomes,
    };

    try {
      await createCourse(payload);
      setTimeout(() => {
        CommonMessage("success", "Course Created Successfully!");
        formReset();
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
    setButtonLoading(false);
    setValidationTrigger(false);
    setIsOpenAddCourseDrawer(false);
    setCourseName("");
    setCourseNameError("");
    setCourseBannerBase64("");
    setCourseBannerError("");
    setDescription("");
    setDescriptionError("");
    setOutcomes("");
    setOutcomesError("");
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {isOpenCourseTab ? (
        <>
          <p className="common_heading">Courses</p>

          <Row gutter={12} style={{ marginTop: "20px" }}>
            <Col xs={15} sm={15} md={15} lg={6}>
              {/* <CommonOutlinedInput
                label="Search for Course"
                width="100%"
                height="36px"
                labelFontSize="12px"
                icon={
                  searchValue ? (
                    <div
                      className="courses_filter_closeIconContainer"
                      onClick={() => {
                        setSearchValue("");
                      }}
                    >
                      <IoIosClose size={11} />
                    </div>
                  ) : (
                    <CiSearch size={16} />
                  )
                }
                labelMarginTop="0px"
                style={{
                  padding: searchValue ? "0px 26px 0px 0px" : "0px 8px 0px 0px",
                }}
                onChange={handleSearch}
                value={searchValue}
              /> */}
              <CommonInputField
                placeholder="Search for Course"
                prefix={<CiSearch size={16} />}
              />
            </Col>

            <Col
              xs={9}
              sm={9}
              md={9}
              lg={18}
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              {isAdmin() && (
                <button
                  className="courses_createcourse_button"
                  onClick={() => setIsOpenAddCourseDrawer(true)}
                >
                  Create Course
                </button>
              )}
            </Col>
          </Row>

          {coursesData.length >= 1 ? (
            <Row gutter={16} style={{ marginTop: "20px" }}>
              {coursesData.map((item, index) => {
                const [hours, minutes] = item.duration_period.split(":");
                return (
                  <React.Fragment key={index}>
                    <Col xs={24} sm={24} md={24} lg={8}>
                      <div
                        className="courses_cards"
                        onClick={() => {
                          setClickedCourseDetails(item);
                          setIsOpenCourseTab(false);
                        }}
                      >
                        <img
                          src={`data:image/png;base64,${item.base64string}`}
                          className="courses_images"
                          alt="course"
                        />

                        <div className="courses_cards_contentcontainer">
                          <p className="courses_course_title">
                            {item.course_name}
                          </p>

                          <Row className="courses_modules_row_container">
                            <Col
                              span={12}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <FaRegNoteSticky size={16} />
                              <p style={{ fontSize: "16px" }}>
                                {item.module_count} Modules
                              </p>
                            </Col>

                            <Col
                              span={12}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <LuClock4 size={16} />
                              <p style={{ fontSize: "16px" }}>
                                {/* 28 Hr 13.5 mins */}
                                {`${parseInt(hours)} Hr ${parseInt(minutes)} mins`}
                              </p>
                            </Col>
                          </Row>

                          <div className="courses_getstart_container">
                            <p>Get Started</p>
                            <IoArrowForwardOutline size={19} />
                          </div>
                        </div>
                      </div>
                    </Col>
                  </React.Fragment>
                );
              })}
            </Row>
          ) : (
            <CommonNodataFound />
          )}
        </>
      ) : (
        <CourseVideos
          setIsOpenCourseTab={setIsOpenCourseTab}
          clickedCourseDetails={clickedCourseDetails}
          setClickedCourseDetails={setClickedCourseDetails}
          setCoursesData={setCoursesData}
        />
      )}

      <Drawer
        title="Create Course"
        open={isOpenAddCourseDrawer}
        onClose={formReset}
        size={"40%"}
        style={{ position: "relative", paddingBottom: "60px" }}
        className="courses_createcourses_drawer"
      >
        <Row
          gutter={16}
          className="courses_createcourse_drawer_row_div"
          style={{ marginTop: "30px" }}
        >
          <Col xs={24} sm={24} md={24} lg={12}>
            <CommonInputField
              label="Course Name"
              required={true}
              onChange={(e) => {
                setCourseName(e.target.value);
                if (validationTrigger) {
                  setCourseNameError(addressValidator(e.target.value));
                }
              }}
              value={courseName}
              error={courseNameError}
            />
          </Col>
          <Col xs={24} sm={24} md={24} lg={12}>
            <ImageUploadCrop
              label="Course Bannner"
              aspect={1}
              maxSizeMB={1}
              required={true}
              value={courseBannerBase64}
              onChange={(base64) => setCourseBannerBase64(base64)}
              onErrorChange={setCourseBannerError} // ✅ pass setter directly
            />
            {courseBannerError && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#d32f2f",
                  marginTop: 4,
                }}
              >
                {`Course Bannner ${courseBannerError}`}
              </p>
            )}
          </Col>
        </Row>

        <Row
          gutter={16}
          className="courses_createcourse_drawer_row_div"
          style={{ marginTop: "30px" }}
        >
          <Col xs={24} sm={24} md={24} lg={12}>
            <CommonInputField
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
          <Col xs={24} sm={24} md={24} lg={12}>
            <CommonInputField
              label="Outcomes"
              required={true}
              onChange={(e) => {
                setOutcomes(e.target.value);
                if (validationTrigger) {
                  setOutcomesError(addressValidator(e.target.value));
                }
              }}
              value={outcomes}
              error={outcomesError}
            />
          </Col>
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
                onClick={handleCourseCreate}
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
