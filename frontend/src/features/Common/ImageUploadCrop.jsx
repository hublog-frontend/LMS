import React, { useState, useEffect } from "react";
import { Upload, Button, Modal } from "antd";
import { UploadOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { CommonMessage } from "./CommonMessage";
import "./commonstyles.css";
import PrismaZoom from "react-prismazoom";

export default function ImageUploadCrop({
  label = "Upload Image",
  aspect = 1,
  maxSizeMB = 1,
  allowedTypes = ["image/png", "image/jpeg", "image/jpg"],
  value, // <-- base64 from parent/API
  onChange,
  onErrorChange,
  required = false,
}) {
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const reportError = (err) => {
    onErrorChange?.(err);
  };

  // 🔹 Sync base64 from parent/API into Upload list
  useEffect(() => {
    if (value) {
      setPreviewImage(`data:image/jpeg;base64,${value}`);
      setFileList([
        {
          uid: "-1",
          name: "screenshot.jpg",
          status: "done",
          url: `data:image/jpeg;base64,${value}`,
        },
      ]);
    } else {
      setPreviewImage("");
      setFileList([]);
    }
  }, [value]);

  const handleFileSelect = (file) => {
    const isValidType = allowedTypes.includes(file.type);
    const isValidSize = file.size <= maxSizeMB * 1024 * 1024;

    if (!isValidType) {
      const err = `must be .png or .jpeg or .jpg format`;
      CommonMessage("error", err);
      reportError(err);
      return Upload.LIST_IGNORE;
    }
    if (!isValidSize) {
      const err = `File size must be ${maxSizeMB}MB or less`;
      CommonMessage("error", err);
      reportError(err);
      return Upload.LIST_IGNORE;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      onChange?.(base64String);
      reportError("");
      CommonMessage("success", "Screenshot uploaded");
    };

    return false;
  };

  return (
    <div style={{ position: "relative" }}>
      <p style={{ fontSize: "13px" }}>
        {label} {required && <span style={{ color: "#d32f2f" }}>*</span>}
      </p>

      {/* <ImgCrop rotationSlider cropShape="rect" aspect={aspect}> */}
      <Upload
        style={{ width: "100%" }}
        fileList={fileList}
        multiple={false}
        accept={allowedTypes.map((t) => `.${t.split("/")[1]}`).join(",")}
        beforeUpload={handleFileSelect}
        onRemove={() => {
          setFileList([]);
          setPreviewImage("");
          reportError(required ? "is required" : "");
          onChange?.("");
        }}
        showUploadList={{ showRemoveIcon: false, showPreviewIcon: false }}
        itemRender={(originNode) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
            }}
          >
            {originNode}
            {previewImage && (
              <Button
                type="link"
                size="small"
                style={{ padding: 0, paddingTop: 10 }}
                onClick={() => setPreviewVisible(true)}
              >
                <EyeOutlined style={{ color: "gray" }} />
              </Button>
            )}
            <Button
              type="link"
              size="small"
              style={{ padding: 0, paddingTop: 10, paddingLeft: 8 }}
              onClick={() => {
                setFileList([]);
                setPreviewImage("");
                reportError(required ? "is required" : "");
                onChange?.("");
              }}
            >
              <DeleteOutlined style={{ color: "gray" }} />
            </Button>
          </div>
        )}
      >
        <Button
          className="imgcrop_uploadbutton"
          icon={<UploadOutlined />}
          style={{ width: "100%", marginTop: 8 }}
        >
          Choose file{" "}
          <span style={{ fontSize: "10px" }}>(PNG, JPEG & JPG)</span>
        </Button>
      </Upload>
      {/* </ImgCrop> */}

      <Modal
        title="Preview Image"
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        centered
        width="30%"
      >
        <div style={{ overflow: "hidden", maxHeight: "100vh" }}>
          <PrismaZoom>
            <img alt="Preview" style={{ width: "100%" }} src={previewImage} />
          </PrismaZoom>
        </div>
      </Modal>
    </div>
  );
}
