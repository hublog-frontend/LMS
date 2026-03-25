import React from "react";
import { Modal, Button } from "antd";
import { MdDelete } from "react-icons/md";
import "./commonstyles.css";
import CommonSpinner from "./CommonSpinner";

export default function CommonDeleteModal({
  title,
  open,
  content,
  onCancel,
  onClick,
  loading,
}) {
  return (
    <div>
      <Modal
        open={open}
        onCancel={onCancel}
        footer={null}
        closable={false}
        centered
        width={400}
        className="common_premium_modal"
      >
        <div className="common_deletemodalContainer">
          <div className="common_deletemodal_header">
            <div className="common_deletemodal_iconContainer">
              <MdDelete size={22} color="#ef4444" />
            </div>

            <div className="common_deletemodal_content_wrapper">
              <h3 className="common_deletemodal_confirmdeletetext">
                {title || "Delete Item"}
              </h3>
              <p className="common_deletemodal_text">
                {content || "Are you sure? This action cannot be undone."}
              </p>
            </div>
          </div>

          <div className="common_deletemodal_footerContainer">
            <Button
              className="common_deletemodal_cancelbutton"
              onClick={onCancel}
            >
              Cancel
            </Button>
            {loading ? (
              <Button
                className="common_deletemodal_loading_deletebutton"
                type="primary"
                disabled
              >
                <CommonSpinner />
              </Button>
            ) : (
              <Button
                className="common_deletemodal_deletebutton"
                onClick={onClick}
                type="primary"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
