import { Tabs, Button } from "antd";
import React, { useState } from "react";
import TechnicalDrive from "./TechnicalDrive";
import JobDrawer from "./JobDrawer";
import { FiPlus } from "react-icons/fi";
import { isAdmin } from "../Common/Validation";

export default function Jobs() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
        <div>
          {isAdmin() && (
            <button
              className="courses_createcourse_button"
              onClick={() => {
                setSelectedJob(null);
                setDrawerVisible(true);
              }}
            >
              Post New Job
            </button>
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
    </div>
  );
}
