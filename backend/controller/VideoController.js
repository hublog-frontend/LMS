const VideoModel = require("../model/VideoModel");
const compressVideo = require("../validation/CompressVideo");
const fssync = require("fs");
const fs = require("fs/promises");
const path = require("path");
const { getVideoDurationInSeconds } = require("get-video-duration");

class VideoController {
  static async uploadContent(request, response) {
    const { module_id, content_type, content_url, title } = request.body;

    try {
      if (!module_id || !content_type) {
        return response.status(400).send({
          message: "Missing required fields (module_id, content_type)",
        });
      }

      let contentDate;

      switch (content_type) {
        case "video":
          if (!request.file) {
            return response
              .status(400)
              .send({ message: "No video file uploaded" });
          }

          const originalPath = request.file.path;
          const duration = await getVideoDurationInSeconds(originalPath);
          const compressedPath = path.join(
            path.dirname(originalPath),
            "compressed-" + path.basename(originalPath),
          );

          // Prepare content data (save original path)
          contentDate = {
            type: "video",
            fileName: request.file.filename,
            originalname: request.file.originalname,
            size: fssync.statSync(originalPath).size,
            duration: duration, // in seconds
            mimetype: request.file.mimetype,
            path: `/uploads/course-videos/${request.file.filename}`, // public path (same)
          };

          // ✅ Save to DB immediately (show original)
          const contentId = await VideoModel.createContent(
            module_id,
            title,
            contentDate,
          );

          // ✅ Respond to client (with original video path)
          response.status(201).send({
            message: "Video uploaded successfully",
            data: {
              contentId,
              type: content_type,
              path: contentDate.path, // original shown immediately
            },
          });

          // ⏳ Compress in background, then replace original file
          compressVideo(originalPath, compressedPath)
            .then(() => fs.unlink(originalPath)) // delete original
            .then(() => fs.rename(compressedPath, originalPath)) // replace with compressed
            .catch((err) => {
              console.error("Compression failed:", err.message);
            });

          return;

        case "youtube":
          if (!content_url) {
            return response
              .status(400)
              .send({ message: "YouTube URL is required" });
          }

          contentDate = {
            type: "youtube",
            fileName: null,
            originalname: null,
            size: null,
            mimetype: null,
            path: content_url,
          };
          break;

        default:
          return response.status(400).send({ message: "Invalid content type" });
      }

      // This part will run only for non-video types
      const contentId = await VideoModel.createContent(
        module_id,
        title,
        contentDate,
      );

      return response.status(201).send({
        message: "Content uploaded successfully",
        data: {
          contentId,
          type: content_type,
          path: contentDate.path,
        },
      });
    } catch (error) {
      return response.status(500).send({
        message: "Failed to upload content",
        details: error.message,
      });
    }
  }

  static async deleteContent(request, response) {
    const { filename, id } = request.query;
    try {
      if (filename) {
        const filePath = path.join(
          __dirname,
          `../uploads/course-videos/${filename}`,
        );
        await fs.unlink(filePath);
      }
      const result = await VideoModel.deleteContent(id);
      response.status(200).send({
        message: "Content has been deleted",
      });
    } catch (error) {
      response.status(500).send({
        message: "Error deleting content",
        details: error.message,
      });
    }
  }

  static async getCourseVideos(request, response) {
    const { course_id, module_id } = request.query;
    try {
      const videos = await VideoModel.getVideosByCourse(course_id, module_id);

      return response.status(200).send({
        message: "Videos fetched successfully",
        videos,
      });
    } catch (error) {
      return response.status(500).send({
        message: "Failed to fetch videos",
        details: error.message,
      });
    }
  }
}

module.exports = VideoController;
