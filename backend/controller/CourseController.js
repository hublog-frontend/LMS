const { request, response } = require("express");
const CourseModel = require("../model/CourseModel");

const createCourse = async (request, response) => {
  const { course_name, image, description, outcomes } = request.body;
  try {
    const courses = await CourseModel.createCourse(
      course_name,
      image,
      description,
      outcomes,
    );

    return response.status(201).send({
      message: "Course created successfully",
      data: courses,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while inserting course",
      details: error.message,
    });
  }
};

const getCourses = async (request, response) => {
  const { course_id } = request.query;
  try {
    const courses = await CourseModel.getCourses(course_id);

    return response.status(200).send({
      message: "Courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while fetching courses",
      details: error.message,
    });
  }
};

const createModule = async (request, response) => {
  const { course_id, module_name, title } = request.body;
  try {
    const module = await CourseModel.createModule(
      course_id,
      module_name,
      title,
    );

    return response.status(201).send({
      message: "Module created successfully",
      data: module,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while inserting module",
      details: error.message,
    });
  }
};

const getModules = async (request, response) => {
  const { course_id } = request.query;
  try {
    const modules = await CourseModel.getModules(course_id);

    return response.status(200).send({
      message: "Modules fetched successfully",
      data: modules,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while fetching modules",
      details: error.message,
    });
  }
};

const insertReview = async (request, response) => {
  const { course_id, user_id, rating, review, created_date } = request.body;
  try {
    const module = await CourseModel.insertReview(
      course_id,
      user_id,
      rating,
      review,
      created_date,
    );

    return response.status(201).send({
      message: "Module created successfully",
      data: module,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while inserting module",
      details: error.message,
    });
  }
};

const getReviews = async (request, response) => {
  const { course_id } = request.query;
  try {
    const reviews = await CourseModel.getReviews(course_id);

    return response.status(200).send({
      message: "Reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while fetching reviews",
      details: error.message,
    });
  }
};

const insertDiscussion = async (request, response) => {
  const { course_id, user_id, comments, created_date } = request.body;
  try {
    const result = await CourseModel.insertDiscussion(
      course_id,
      user_id,
      comments,
      created_date,
    );

    return response.status(201).send({
      message: "Discussion created",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while creating discussion",
      details: error.message,
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  createModule,
  getModules,
  insertReview,
  getReviews,
  insertDiscussion,
};
