import React, { useState, useEffect } from "react";
import { Rate } from "antd";
import CommonInputField from "../Common/CommonInputField";
import { LuSend } from "react-icons/lu";
import { FiUser } from "react-icons/fi";
import { addressValidator, formatToBackendIST } from "../Common/Validation";
import { getReviews, insertDiscussion } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import moment from "moment";

export default function CourseDiscussion({ reviewsData, courseDetails }) {
  const [discussionData, setDiscussionData] = useState([]);
  const [comments, setComments] = useState("");
  const [commentsError, setCommentsError] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    setDiscussionData(reviewsData?.discussions || []);
  }, []);

  const getReviewsData = async () => {
    try {
      const response = await getReviews(courseDetails?.id);
      console.log("get reviews response", response);
      setDiscussionData(response?.data?.data?.discussions || []);
    } catch (error) {
      setDiscussionData([]);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleSubmit = async () => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log("getloginUserDetails", converAsJson);

    const commentsValidate = addressValidator(comments);

    setCommentsError(commentsValidate);

    if (commentsValidate) return;

    setButtonLoading(true);
    const today = new Date();

    const payload = {
      course_id: courseDetails?.id,
      comments: comments,
      user_id: converAsJson?.id,
      created_date: formatToBackendIST(today),
    };

    try {
      await insertDiscussion(payload);
      setTimeout(() => {
        setButtonLoading(false);
        setComments("");
        setCommentsError("");
        CommonMessage("success", "Comment Added");
        getReviewsData();
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
    <div style={{ marginTop: "16px" }}>
      <div className="coursediscussion_commentfield_container">
        <div style={{ width: "100%" }}>
          <CommonInputField
            placeholder="Comment"
            multiline={true}
            onChange={(e) => {
              setComments(e.target.value);
              setCommentsError(addressValidator(e.target.value));
            }}
            value={comments}
            error={commentsError}
          />
        </div>
        {buttonLoading ? (
          <button className="coursedisscion_addcomment_loading_button">
            <CommonSpinner />
          </button>
        ) : (
          <button
            className="coursedisscion_addcomment_button"
            onClick={handleSubmit}
          >
            <LuSend size={19} />
          </button>
        )}
      </div>

      {discussionData.length >= 1 ? (
        <div className="coursereviews_reviews_container">
          {discussionData.map((item) => {
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
                        {moment(item.created_date).format("DD MMM YYYY")}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="coursereviews_review_datetime">{item.comments}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="coursereviews_nodata_container">
          <p>No discussion found</p>
        </div>
      )}
    </div>
  );
}
