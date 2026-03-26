const TestModel = require("../model/TestModel");

const createTopic = async (request, response) => {
  const { topic_id, topic_name, logo_image, created_date } = request.body;
  try {
    const result = await TestModel.createTopic(
      topic_id,
      topic_name,
      logo_image,
      created_date,
    );

    return response.status(201).send({
      message: "Topic updated successfully",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while updating topic",
      details: error.message,
    });
  }
};

const deleteTopic = async (request, response) => {
  const { topic_id } = request.query;
  try {
    const result = await TestModel.deleteTopic(topic_id);
    return response.status(200).send({
      message: "Topic deleted successfully",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while deleting topic",
      details: error.message,
    });
  }
};

const createTest = async (request, response) => {
  const { test_id, topic_id, test_name, duration, total_marks, created_date } =
    request.body;
  try {
    const result = await TestModel.createTest(
      test_id,
      topic_id,
      test_name,
      duration,
      total_marks,
      created_date,
    );

    return response.status(201).send({
      message: "Test updated successfully",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while updating test",
      details: error.message,
    });
  }
};

const getTopics = async (request, response) => {
  const { page, pageSize } = request.query;
  try {
    const result = await TestModel.getTopics(page, pageSize);
    return response.status(200).send({
      message: "Topics fetched successfully",
      ...result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while fetching topics",
      details: error.message,
    });
  }
};

const getTests = async (request, response) => {
  const { topic_id, page, pageSize } = request.query;
  try {
    const result = await TestModel.getTests(topic_id, page, pageSize);
    return response.status(200).send({
      message: "Tests fetched successfully",
      ...result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while fetching tests",
      details: error.message,
    });
  }
};

const insertTestResult = async (request, response) => {
  const {
    test_id,
    user_id,
    total_marks_scored,
    total_time_taken,
    test_results,
    created_date,
  } = request.body;
  try {
    const result = await TestModel.insertTestResult(
      test_id,
      user_id,
      total_marks_scored,
      total_time_taken,
      test_results,
      created_date,
    );
    return response.status(201).send({
      message: "Test result inserted successfully",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while inserting test result",
      details: error.message,
    });
  }
};

const getTestHistory = async (request, response) => {
  const { test_id, user_id, page, pageSize } = request.query;
  try {
    const result = await TestModel.getTestHistory(
      test_id,
      user_id,
      page,
      pageSize,
    );
    return response.status(200).send({
      message: "Test history fetched successfully",
      ...result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while fetching test history",
      details: error.message,
    });
  }
};

const getTestResult = async (request, response) => {
  const { history_id } = request.query;
  try {
    const result = await TestModel.getTestResult(history_id);
    return response.status(200).send({
      message: "Test result fetched successfully",
      ...result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while fetching test result",
      details: error.message,
    });
  }
};

const addQuestions = async (request, response) => {
  const { questions } = request.body;
  try {
    const result = await TestModel.addQuestions(questions);
    return response.status(201).send({
      message: "Questions added successfully",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while adding questions",
      details: error.message,
    });
  }
};

const getQuestions = async (request, response) => {
  const { page, pageSize, category_id, question_type } = request.body;
  try {
    const result = await TestModel.getQuestions(
      page,
      pageSize,
      category_id,
      question_type,
    );
    return response.status(200).send({
      message: "Questions fetched successfully",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while fetching questions",
      details: error.message,
    });
  }
};

const deleteQuestion = async (request, response) => {
  const { question_id } = request.query;
  try {
    const result = await TestModel.deleteQuestion(question_id);
    return response.status(200).send({
      message: "Question deleted successfully",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while deleting question",
      details: error.message,
    });
  }
};

const mapTestQuestions = async (request, response) => {
  const { test_id, questions, created_date } = request.body;
  try {
    const result = await TestModel.mapTestQuestions(
      test_id,
      questions,
      created_date,
    );
    return response.status(201).send({
      message: "Test questions mapped successfully",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while mapping test questions",
      details: error.message,
    });
  }
};

const getTestQuestions = async (request, response) => {
  const { test_id } = request.query;
  try {
    const result = await TestModel.getTestQuestions(test_id);
    return response.status(200).send({
      message: "Test questions fetched successfully",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while fetching test questions",
      details: error.message,
    });
  }
};

module.exports = {
  createTopic,
  createTest,
  getTopics,
  getTests,
  insertTestResult,
  getTestHistory,
  getTestResult,
  addQuestions,
  getQuestions,
  mapTestQuestions,
  getTestQuestions,
  deleteTopic,
  deleteQuestion,
};
