const JobModel = require("../model/JobModel");
const fs = require("fs/promises");

const JobController = {
  createJob: async (req, res) => {
    try {
      let fileData = null;
      if (req.file) {
        fileData = {
          fileName: req.file.filename,
          originalName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          path: `/uploads/documents/${req.file.filename}`,
        };
      }

      const jobData = {
        ...req.body,
        fileData,
      };

      // Usually req.body comes as form-data, so JSON arrays might be sent as string. We need to parse them if necessary.
      [
        "location",
        "qualification",
        "year_of_passing",
        "interview_rounds",
        "streams",
        "min_required_percentage",
        "skills_required",
        "other_criterias",
      ].forEach((field) => {
        if (jobData[field] && typeof jobData[field] === "string") {
          try {
            jobData[field] = JSON.parse(jobData[field]);
          } catch (e) {
            // keep as string if not parseable
          }
        }
      });

      const insertId = await JobModel.createJob(jobData);
      return res
        .status(201)
        .json({ message: "Job created successfully", id: insertId });
    } catch (error) {
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (err) {}
      }
      return res.status(500).json({ message: error.message });
    }
  },

  getJobs: async (req, res) => {
    try {
      const filters = req.query;
      const jobs = await JobModel.getJobs(filters);
      return res
        .status(200)
        .json({ message: "Jobs fetched successfully", data: jobs });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getJobById: async (req, res) => {
    try {
      const jobId = req.params.id;
      const job = await JobModel.getJobById(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      return res
        .status(200)
        .json({ message: "Job fetched successfully", data: job });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  updateJob: async (req, res) => {
    try {
      const jobId = req.params.id;
      let fileData = null;

      if (req.file) {
        fileData = {
          fileName: req.file.filename,
          originalName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          path: `/uploads/documents/${req.file.filename}`,
        };
      }

      const jobData = {
        ...req.body,
        fileData,
      };

      [
        "location",
        "qualification",
        "year_of_passing",
        "interview_rounds",
        "streams",
        "min_required_percentage",
        "skills_required",
        "other_criterias",
      ].forEach((field) => {
        if (jobData[field] && typeof jobData[field] === "string") {
          try {
            jobData[field] = JSON.parse(jobData[field]);
          } catch (e) {
            // keep as string
          }
        }
      });

      const affectedRows = await JobModel.updateJob(jobId, jobData);
      if (affectedRows === 0) {
        if (req.file)
          try {
            await fs.unlink(req.file.path);
          } catch (err) {}
        return res
          .status(404)
          .json({ message: "Job not found or no changes made" });
      }

      return res.status(200).json({ message: "Job updated successfully" });
    } catch (error) {
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (err) {}
      }
      return res.status(500).json({ message: error.message });
    }
  },

  deleteJob: async (req, res) => {
    try {
      const jobId = req.params.id;
      const affectedRows = await JobModel.deleteJob(jobId);
      if (affectedRows === 0) {
        return res.status(404).json({ message: "Job not found" });
      }
      return res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  addStreams: async (req, res) => {
    try {
      const { stream_id, stream_name } = req.body;
      const result = await JobModel.addStreams(stream_id, stream_name);
      return res
        .status(200)
        .json({ message: "Stream added successfully", data: result });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getStreams: async (req, res) => {
    try {
      const { stream_name } = req.query;
      const result = await JobModel.getStreams(stream_name);
      return res
        .status(200)
        .json({ message: "Streams fetched successfully", data: result });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  deleteStream: async (req, res) => {
    try {
      const { stream_id } = req.query;
      const result = await JobModel.deleteStream(stream_id);
      if (result === 0) {
        return res.status(404).json({ message: "Stream not found" });
      }
      return res.status(200).json({ message: "Stream deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = JobController;
