const BookmarkModel = require("../model/BookmarkModel");

const addBookmark = async (request, response) => {
  try {
    const { category_type, key_column, created_date } = request.body;
    const result = await BookmarkModel.addBookmark(
      category_type,
      key_column,
      created_date,
    );
    response
      .status(200)
      .json({ message: "Bookmark added successfully", result });
  } catch (error) {
    response
      .status(500)
      .json({ message: "Error adding bookmark", error: error.message });
  }
};

const removeBookmark = async (request, response) => {
  try {
    const { category_type, key_column } = request.body;
    const result = await BookmarkModel.removeBookmark(
      category_type,
      key_column,
    );
    response
      .status(200)
      .json({ message: "Bookmark removed successfully", result });
  } catch (error) {
    response
      .status(500)
      .json({ message: "Error removing bookmark", error: error.message });
  }
};

module.exports = { addBookmark, removeBookmark };
