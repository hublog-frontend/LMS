import React, { useState } from "react";
import { Upload, message } from "antd";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { CommonMessage } from "./CommonMessage";

const { Dragger } = Upload;

const CommonPdfUpload = ({
  label,
  required,
  pdfArray,
  setPdfArray,
  onFileChange,
  error,
}) => {
  const handleFileDrop = (file) => {
    const isPdf = file.type === "application/pdf";
    const isLt5MB = file.size / 1024 / 1024 <= 5;

    if (!isPdf) {
      CommonMessage("error", "Only PDF files allowed!");
      return Upload.LIST_IGNORE;
    }

    if (!isLt5MB) {
      CommonMessage("error", "File must be 5MB or smaller!");
      return Upload.LIST_IGNORE;
    }

    setPdfArray((prev) => [...prev, file]); // ✅ append files

    // send file to parent
    if (onFileChange) {
      onFileChange(file);
    }

    return false; // prevent auto upload
  };

  return (
    <div>
      {label && (
        <label className="common_inputfields_label">
          {label} {required && <span style={{ color: "#d32f2f" }}>*</span>}
        </label>
      )}
      <Dragger
        accept=".pdf"
        maxCount={5}
        multiple={true}
        fileList={pdfArray}
        beforeUpload={handleFileDrop}
        onRemove={(file) => {
          setPdfArray((prev) => {
            const updated = prev.filter((f) => f.uid !== file.uid);

            if (onFileChange) {
              onFileChange(updated);
            }

            return updated;
          });
        }}
        showUploadList={{ showRemoveIcon: true }}
        className="questions-dragger"
      >
        <p className="ant-upload-drag-icon questions-dragger-icon-wrapper">
          <AiOutlineCloudUpload size={42} color="#2160ad" />
        </p>

        <p className="ant-upload-text questions-dragger-text">
          Click or drag PDF to upload
        </p>

        <p className="ant-upload-hint questions-dragger-hint">
          Supported format: .pdf only
        </p>
      </Dragger>

      {error && (
        <p
          style={{
            fontSize: "12px",
            color: "#d32f2f",
            marginTop: 4,
          }}
        >
          {`Company Questions ${error}`}
        </p>
      )}
    </div>
  );
};

export default CommonPdfUpload;
