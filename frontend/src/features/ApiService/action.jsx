import React from "react";
import axios from "axios";
import { Modal, Button } from "antd";
import "../Common/commonstyles.css";

let isModalVisible = false;
let modalInstance = null; // Track modal instance for manual control

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const AccessToken = localStorage.getItem("AccessToken");
    if (AccessToken) {
      const expired = isTokenExpired(AccessToken);
      if (expired === true) {
        ShowModal();
        return Promise.reject(new Error("Token is expired"));
      }
      config.headers.Authorization = `Bearer ${AccessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const isTokenExpired = (token) => {
  if (!token) return true; // No token means it's "expired"

  try {
    // split the token into parts
    const payloadBase64 = token.split(".")[1];

    // decode the base64 payload
    const decodedPayload = JSON.parse(atob(payloadBase64));

    // get the current time in seconds
    const currentTime = Date.now() / 1000;

    // check if the token has expired
    return decodedPayload.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

const handleSessionModal = () => {
  const event = new Event("tokenExpireUpdated");
  window.dispatchEvent(event);
  if (modalInstance) {
    modalInstance.destroy(); // Manually close the modal
    modalInstance = null;
  }
  isModalVisible = false;
};

const ShowModal = () => {
  if (isModalVisible) {
    return; // Don't open a new modal if one is already visible
  }

  isModalVisible = true;

  modalInstance = Modal.warning({
    title: "Session Expired",
    centered: true,
    content: "Your session has expired. Please log in again.",
    onOk() {
      handleSessionModal();
    },
    onCancel() {
      handleSessionModal();
    },
    onClose() {
      handleSessionModal();
    },
    footer: [
      <div className="sessionmodal_okbuttonContainer">
        <Button className="sessionmodal_okbutton" onClick={handleSessionModal}>
          OK
        </Button>
      </div>,
    ],
  });

  return;
};

//login api
export const LoginApi = async (payload) => {
  try {
    const response = await api.post("/api/login", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (payload) => {
  try {
    const response = await api.post("/api/forgotPassword", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const verifyOTP = async (payload) => {
  try {
    const response = await api.post("/api/verifyOTP", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (payload) => {
  try {
    const response = await api.post("/api/resetPassword", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateFirebaseToken = async (payload) => {
  try {
    const response = await api.post("/api/updateFirebaseToken", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

//course api's
export const getCourses = async (payload) => {
  try {
    const response = await api.get("/api/getCourses", { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const createCourse = async (payload) => {
  try {
    const response = await api.post("/api/createCourse", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

//module api's
export const createModule = async (payload) => {
  try {
    const response = await api.post("/api/createModule", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getModules = async (course_id) => {
  try {
    const response = await api.get(`/api/getModules?course_id=${course_id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

//discussion and reviews api's
export const insertDiscussion = async (payload) => {
  try {
    const response = await api.post(`/api/insertDiscussion`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const insertReview = async (payload) => {
  try {
    const response = await api.post(`/api/insertReview`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getReviews = async (course_id) => {
  try {
    const response = await api.get(`/api/getReviews?course_id=${course_id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const insertTestResult = async (payload) => {
  try {
    const response = await api.post(`/api/insertTestResult`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTestHistory = async (payload) => {
  try {
    const response = await api.get(`/api/getTestHistory`, { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

// videos api's
export const getVideos = async (payload) => {
  try {
    const response = await api.get(`/api/getVideos`, { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

// profile api's
export const updateProfile = async (payload) => {
  try {
    const response = await api.post(`/api/updateUser`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (user_id) => {
  try {
    const response = await api.get(`/api/getUserById?user_id=${user_id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAllUsers = async (payload) => {
  try {
    const response = await api.post(`/api/getAllUsers`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateExperience = async (payload) => {
  try {
    const response = await api.post(`/api/updateExperience`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteExperience = async (experience_id) => {
  try {
    const response = await api.delete(
      `/api/deleteExperience?experience_id=${experience_id}`,
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateEducation = async (payload) => {
  try {
    const response = await api.post(`/api/updateEducation`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateProject = async (payload) => {
  try {
    const response = await api.post(`/api/updateProject`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteProject = async (project_id) => {
  try {
    const response = await api.delete(
      `/api/deleteProject?project_id=${project_id}`,
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateCertificate = async (payload) => {
  try {
    const response = await api.post(`/api/updateCertificate`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteCertificate = async (certificate_id) => {
  try {
    const response = await api.delete(
      `/api/deleteCertificate?certificate_id=${certificate_id}`,
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const addUser = async (payload) => {
  try {
    const response = await api.post(`/api/addUser`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getRegion = async () => {
  try {
    const response = await api.get(`/api/getRegion`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getBranches = async (region_id) => {
  try {
    const response = await api.get(`/api/getBranches?region_id=${region_id}`);
    return response;
  } catch (error) {
    throw error;
  }
};
//topic api's
export const createTopic = async (payload) => {
  try {
    const response = await api.post(`/api/createTopic`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTopics = async (payload) => {
  try {
    const response = await api.get(`/api/getTopics`, { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteTopic = async (topic_id) => {
  try {
    const response = await api.delete(`/api/deleteTopic?topic_id=${topic_id}`);
    return response;
  } catch (error) {
    throw error;
  }
};
//test api's
export const getTests = async (payload) => {
  try {
    const response = await api.get(`/api/getTests`, { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const createTest = async (payload) => {
  try {
    const response = await api.post(`/api/createTest`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTestResult = async (payload) => {
  try {
    const response = await api.get(`/api/getTestResult`, { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const userWiseTestFullHistory = async (payload) => {
  try {
    const response = await api.post(`/api/userWiseTestHistory`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};
// question api's
export const createQuestion = async (payload) => {
  try {
    const response = await api.post(`/api/addQuestions`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateQuestion = async (payload) => {
  try {
    const response = await api.post(`/api/updateQuestion`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getQuestions = async (payload) => {
  try {
    const response = await api.post(`/api/getQuestions`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteQuestion = async (question_id) => {
  try {
    const response = await api.delete(
      `/api/deleteQuestion?question_id=${question_id}`,
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const mapQuestionsToTest = async (payload) => {
  try {
    const response = await api.post(`/api/mapTestQuestions`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTestQuestionsData = async (test_id) => {
  try {
    const response = await api.get(`/api/getTestQuestions?test_id=${test_id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// category api's
export const createCategory = async (payload) => {
  try {
    const response = await api.post(`/api/addCategory`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCategories = async (payload) => {
  try {
    const response = await api.get(`/api/getCategory`, { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (category_id) => {
  try {
    const response = await api.delete(
      `/api/deleteCategory?category_id=${category_id}`,
    );
    return response;
  } catch (error) {
    throw error;
  }
};

//assignment api's
export const getAssignments = async (payload) => {
  try {
    const response = await api.post(`/api/userWiseAssignments`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createAssignment = async (payload) => {
  try {
    const response = await api.post(`/api/createAssignment`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createAssignmentModule = async (payload) => {
  try {
    const response = await api.post(`/api/createAssignmentModule`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAssignmentModules = async (payload) => {
  try {
    const response = await api.post(`/api/userWiseModules`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const mapQuestionsToAssignment = async (payload) => {
  try {
    const response = await api.post(`/api/mapAssignmentQuestion`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const insertAssignmentAttempt = async (payload) => {
  try {
    const response = await api.post(`/api/insertAssignmentAttempt`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const insertAssignmentAnswer = async (payload) => {
  try {
    const response = await api.post(`/api/insertAssignmentAnswer`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};
// company question api's
export const getCompanySkills = async (payload) => {
  try {
    const response = await api.get(`/api/getSkill`, { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCompanyQuestions = async (payload) => {
  try {
    const response = await api.post(`/api/userWiseCompanyQuestions`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteCompanyQuestion = async (company_id) => {
  try {
    const response = await api.delete(
      `/api/deleteCompanyQuestion?company_id=${company_id}`,
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const addCompanyQuestionToFavorite = async (payload) => {
  try {
    const response = await api.post(`/api/addToFavorite`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const removeCompanyQuestionToFavorite = async (payload) => {
  try {
    const response = await api.post(`/api/removeFromFavorite`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getFavoriteCompanies = async (payload) => {
  try {
    const response = await api.get(`/api/getFavoriteCompanies`, {
      params: payload,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const runCode = async (payload) => {
  try {
    const response = await api.post(`/api/runCode`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const submitCode = async (payload) => {
  try {
    const response = await api.post(`/api/submitCode`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

// bookmark api's
export const addBookmark = async (payload) => {
  try {
    const response = await api.post(`/api/addBookmark`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const removeBookmark = async (payload) => {
  try {
    const response = await api.post(`/api/removeBookmark`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const userWiseBookmarks = async (payload) => {
  try {
    const response = await api.post(`/api/userWiseBookmarks`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

// job api's
export const getJobs = async (payload) => {
  try {
    const response = await api.get(`/api/getJobs`, { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getJobById = async (id) => {
  try {
    const response = await api.get(`/api/getJobById/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getStreams = async (payload) => {
  try {
    const response = await api.get(`/api/getStreams`, { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getUpcomingTests = async (payload) => {
  try {
    const response = await api.get(`/api/getUpcomingTests`, {
      params: payload,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCompletedTests = async (payload) => {
  try {
    const response = await api.get(`/api/getCompletedTests`, {
      params: payload,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getUserProgress = async (user_id) => {
  try {
    const response = await api.get(`/api/getUserProgress?user_id=${user_id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const setVideoProgress = async (payload) => {
  try {
    const response = await api.post(`/api/setVideoProgress`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};
