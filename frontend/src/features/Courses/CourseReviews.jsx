import React, { useState, useEffect } from "react";
import { Button, Progress, Rate } from "antd";
import CommonInputField from "../Common/CommonInputField";
import { FiUser } from "react-icons/fi";
import { getReviews, insertReview } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import { addressValidator, formatToBackendIST } from "../Common/Validation";
import { Modal } from "antd";
import CommonSpinner from "../Common/CommonSpinner";
import moment from "moment";

export default function CourseReviews({ courseDetails, reviewsData }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState("");
  const [detailsRatings, setDetailsRatings] = useState(null);
  const [comments, setComments] = useState("");
  const [commentsError, setCommentsError] = useState("");
  //rating modal
  const [isOpenRatingModal, setIsOpenRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    console.log("reviewsData", reviewsData);
    setAverageRating(reviewsData?.average_rating || "");
    setReviews(reviewsData?.reviews || []);
    setDetailsRatings(reviewsData?.distribution || null);
  }, [reviewsData]);

  const getReviewsData = async () => {
    try {
      const response = await getReviews(courseDetails?.id);
      console.log("get reviews response", response);
      setReviews(response?.data?.data?.reviews || []);
    } catch (error) {
      setReviews([]);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleIsOpenRateModal = async () => {
    const commentsValidate = addressValidator(comments);

    setCommentsError(commentsValidate);

    if (commentsValidate) return;

    setIsOpenRatingModal(true);
    return;
  };

  const handleReviewSubmit = async () => {
    setRatingLoading(true);
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log("getloginUserDetails", converAsJson);

    const today = new Date();

    const payload = {
      course_id: courseDetails?.id,
      rating: rating,
      review: comments,
      user_id: converAsJson?.id,
      created_date: formatToBackendIST(today),
    };

    try {
      await insertReview(payload);
      setTimeout(() => {
        setComments("");
        setCommentsError("");
        formReset();
        CommonMessage("success", "Comment Added");
        getReviewsData();
      }, 300);
    } catch (error) {
      setRatingLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const formReset = () => {
    setRatingLoading(false);
    setRating(0);
    setIsOpenRatingModal(false);
  };

  return (
    <div style={{ marginTop: "16px" }}>
      <div className="coursereviews_rating_container">
        {/* ----------left container-------------- */}
        <div className="coursereviews_rating_sub_container">
          <p className="coursereviews_averagerating_heading">Average Rating</p>
          <div className="coursereviews_averagerating_container">
            <p className="coursereviews_ratingvalue">
              {averageRating ? Number(averageRating) : "0"}
            </p>
            <Rate
              allowHalf
              value={averageRating ? Number(averageRating) : "0"}
              style={{ color: "#fdb002" }}
              disabled={true}
            />
            <p className="coursereviews_rating_text">Rating</p>
          </div>
        </div>

        {/* ----------right container-------------- */}
        <div className="coursereviews_rating_sub_container">
          <p className="coursereviews_averagerating_heading">Detailed Rating</p>
          {/* ----------rating 5------------- */}
          <div className="coursevideos_detailrating_rowconatiner">
            <Rate
              allowHalf
              defaultValue={5}
              style={{ color: "#fdb002" }}
              disabled={true}
            />
            <Progress
              percent={detailsRatings ? Number(detailsRatings[5]) : "0"}
              strokeColor="#4d80bd"
              status="normal"
            />
          </div>

          {/* ----------rating 4------------- */}
          <div className="coursevideos_detailrating_rowconatiner">
            <Rate
              allowHalf
              defaultValue={4}
              style={{ color: "#fdb002" }}
              disabled={true}
            />
            <Progress
              percent={detailsRatings ? Number(detailsRatings[4]) : "0"}
              strokeColor="#4d80bd"
              status="normal"
            />
          </div>

          {/* ----------rating 3------------- */}
          <div className="coursevideos_detailrating_rowconatiner">
            <Rate
              allowHalf
              defaultValue={3}
              style={{ color: "#fdb002" }}
              disabled={true}
            />
            <Progress
              percent={detailsRatings ? Number(detailsRatings[3]) : "0"}
              strokeColor="#4d80bd"
              status="normal"
            />
          </div>

          {/* ----------rating 2------------- */}
          <div className="coursevideos_detailrating_rowconatiner">
            <Rate
              allowHalf
              defaultValue={2}
              style={{ color: "#fdb002" }}
              disabled={true}
            />
            <Progress
              percent={detailsRatings ? Number(detailsRatings[2]) : "0"}
              strokeColor="#4d80bd"
              status="normal"
            />
          </div>

          {/* ----------rating 1------------- */}
          <div className="coursevideos_detailrating_rowconatiner">
            <Rate
              allowHalf
              defaultValue={1}
              style={{ color: "#fdb002" }}
              disabled={true}
            />
            <Progress
              percent={detailsRatings ? Number(detailsRatings[1]) : "0"}
              strokeColor="#4d80bd"
              status="normal"
            />
          </div>
        </div>
      </div>

      <div className="coursediscussion_commentfield_container">
        <div style={{ width: "100%" }}>
          <CommonInputField
            placeholder="Add a review"
            multiline={true}
            onChange={(e) => {
              setComments(e.target.value);
              setCommentsError(addressValidator(e.target.value));
            }}
            value={comments}
            error={commentsError}
          />
        </div>
        <button
          className="coursedisscion_addcomment_button"
          onClick={handleIsOpenRateModal}
        >
          Submit
        </button>
      </div>

      {reviews.length >= 1 ? (
        <div className="coursereviews_reviews_container">
          {reviews.map((item) => {
            return (
              <div>
                <div className="coursereviews_discussion_header">
                  <div className="coursereviews_discussion_avatar_main_container">
                    <div className="coursereviews_discussion_avatar_div">
                      <FiUser size={20} color="#2160ad" />
                    </div>

                    <div>
                      <p className="coursereviews_username">
                        {item.user_name}{" "}
                      </p>
                      <p className="coursereviews_review_datetime">
                        {" "}
                        {moment(item.created_date).format("DD MMM YYYY")}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Rate
                      allowHalf
                      defaultValue={4.0}
                      style={{ color: "#fdb002" }}
                    />
                  </div>
                </div>

                <p className="coursereviews_review_datetime">{item.review}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="coursereviews_nodata_container">
          <p>No reviews found</p>
        </div>
      )}

      <Modal
        title={
          <div style={{ textAlign: "center", width: "100%" }}>
            How much would you like to rate?
          </div>
        }
        open={isOpenRatingModal}
        centered
        closable={false} // ❌ removes top-right close icon
        onCancel={formReset}
        width="25%"
        footer={
          <div
            style={{
              marginTop: "30px",
              marginBottom: "4px",
              display: "flex",
              gap: "12px",
            }}
          >
            <button
              key="cancel"
              onClick={formReset}
              className="coursereviews_rating_modal_btn coursereviews_rating_modal_cancelbutton"
            >
              Cancel
            </button>

            {ratingLoading ? (
              <button
                key="create"
                type="primary"
                className="coursereviews_rating_modal_btn coursereviews_rating_modal_loading_submitbutton"
              >
                <CommonSpinner />
              </button>
            ) : (
              <button
                key="create"
                type="primary"
                className="coursereviews_rating_modal_btn coursereviews_rating_modal_submitbutton"
                onClick={handleReviewSubmit}
              >
                Submit
              </button>
            )}
          </div>
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
            marginBottom: "25px",
          }}
        >
          <Rate
            className="coursereviews_rating"
            size="large"
            style={{ color: "#fdb002", fontSize: "40px" }}
            value={rating}
            onChange={(value) => {
              console.log("rating:", value);
              setRating(value);
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
