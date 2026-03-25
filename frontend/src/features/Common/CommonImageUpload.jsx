import React from "react";
import { CloudUploadOutlined } from "@ant-design/icons";
import { Upload } from "antd";
import { MdDeleteOutline } from "react-icons/md";
import "./commonstyles.css";
import { CommonMessage } from "./CommonMessage";

const CommonImageUpload = ({
  uploadedFile,
  label,
  mandatory,
  error,
  style,
  imageName,
  multiple,
}) => {
  const { Dragger } = Upload;

  const handleAttachment = ({ file }) => {
    const isValidType =
      file.type === "image/png" ||
      file.type === "image/jpg" ||
      file.type === "image/jpeg";
    const isValidSize = file.size <= 1024 * 1024;

    if (file.status === "uploading") {
      return;
    }
    if (!isValidType) {
      uploadedFile([]);
      CommonMessage("error", "Attachment must be a Png or Jpg or Jpeg file");
    } else if (!isValidSize) {
      uploadedFile([]);
      CommonToaster("error", "Attachment must be less than 1 MB");
    } else {
      CommonToaster("success", "Attachment uploaded successfully");
      uploadedFile([file]);
    }
  };

  return (
    <div style={style}>
      {label ? (
        <div style={{ display: "flex" }}>
          <label className="commonfield_label">{label}</label>
          {mandatory ? (
            <p style={{ color: "#d32f2f", marginLeft: "4px" }}>*</p>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
      <Dragger
        multiple={multiple}
        onChange={handleAttachment}
        // showUploadList={false}
        className="draganddrop_container"
      >
        <p className="ant-upload-drag-icon">
          <CloudUploadOutlined style={{ color: "#009737" }} />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibited from
          uploading company data or other banned files.
        </p>
      </Dragger>

      {imageName ? (
        <div className="imageupload_imagenameContainer">
          <p className="imageupload_imagename">{imageName}</p>
          <MdDeleteOutline
            className="imageupload_deleteicon"
            size={20}
            onClick={() => {
              uploadedFile([]);
            }}
          />
        </div>
      ) : (
        ""
      )}

      {error && (
        <div
          className={
            error
              ? "commoninput_errormessage_activediv"
              : "commoninput_errormessagediv"
          }
        >
          <p style={{ color: "#ff4d4f", marginTop: "2px" }}>{label + error}</p>
        </div>
      )}
    </div>
  );
};
export default CommonImageUpload;
