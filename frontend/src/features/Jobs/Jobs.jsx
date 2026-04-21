import { Tabs, Button, Modal, Input, message } from "antd";
import React, { useState } from "react";
import { addSkill } from "../ApiService/action";
import TechnicalDrive from "./TechnicalDrive";
import JobDrawer from "./JobDrawer";
import { FiPlus } from "react-icons/fi";
import { addressValidator, isAdmin } from "../Common/Validation";
import CommonInputField from "../Common/CommonInputField";

export default function Jobs() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [skillModalVisible, setSkillModalVisible] = useState(false);
  const [skillName, setSkillName] = useState("");
  const [skillNameError, setSkillNameError] = useState("");
  const [skillLoading, setSkillLoading] = useState(false);

  const handleAddSkill = async () => {
    const skillNameValidate = addressValidator(skillName);

    setSkillNameError(skillNameValidate);

    if (skillNameValidate) return;

    setSkillLoading(true);
    try {
      await addSkill({ skill_name: skillName });
      message.success("Skill added successfully");
      setSkillName("");
      setSkillModalVisible(false);
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Failed to add skill");
      }
    } finally {
      setSkillLoading(false);
    }
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setDrawerVisible(true);
  };

  const handleClose = () => {
    setDrawerVisible(false);
    setSelectedJob(null);
  };

  const tabItems = React.useMemo(
    () => [
      {
        label: "Technical Drives",
        key: "1",
        children: (
          <TechnicalDrive
            key={`tech-${refreshKey}`}
            category="Technical drives"
            onEdit={handleEdit}
          />
        ),
      },
      {
        label: "Non-Technical Drives",
        key: "2",
        children: (
          <TechnicalDrive
            key={`non-tech-${refreshKey}`}
            category="Non-technical drives"
            onEdit={handleEdit}
          />
        ),
      },
      {
        label: "Internal Drives",
        key: "3",
        children: (
          <TechnicalDrive
            key={`internal-${refreshKey}`}
            category="Internal drives"
            onEdit={handleEdit}
          />
        ),
      },
      // {
      //   label: "Applied Drives",
      //   key: "4",
      //   children: <p>Under Development</p>,
      // },
    ],
    [refreshKey],
  );

  return (
    <div className="jobs_page_wrapper">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p className="common_heading" style={{ margin: 0 }}>
          Jobs
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          {isAdmin() && (
            <>
              <button
                className="courses_createcourse_button"
                onClick={() => setSkillModalVisible(true)}
              >
                Add Skill
              </button>
              <button
                className="courses_createcourse_button"
                onClick={() => {
                  setSelectedJob(null);
                  setDrawerVisible(true);
                }}
              >
                Post New Job
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <Tabs
          className="companyquestions_tabs"
          defaultActiveKey={tabItems[0]?.key} // ✅ auto select first visible tab
          items={tabItems}
        />
      </div>

      <JobDrawer
        visible={drawerVisible}
        onClose={handleClose}
        jobData={selectedJob}
        onSuccess={handleSuccess}
      />

      <Modal
        title="Add Skill"
        open={skillModalVisible}
        onOk={handleAddSkill}
        onCancel={() => {
          setSkillModalVisible(false);
          setSkillName("");
        }}
        confirmLoading={skillLoading}
        okText="Add"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: "30px" }}>
          <CommonInputField
            label={"Skill Name"}
            placeholder="Enter skill name"
            value={skillName}
            onChange={(e) => {
              setSkillName(e.target.value);
              setSkillNameError(addressValidator(e.target.value));
            }}
            error={skillNameError}
          />
        </div>
      </Modal>
    </div>
  );
}
