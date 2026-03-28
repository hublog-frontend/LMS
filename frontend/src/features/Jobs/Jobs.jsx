import { Tabs } from "antd";
import React from "react";
import TechnicalDrive from "./TechnicalDrive";

export default function Jobs() {
  const tabItems = [
    { label: "Technical Drives", key: "1", children: <TechnicalDrive /> },
    {
      label: "Non-Technical Drives",
      key: "2",
      children: <p>Hii</p>,
    },
    {
      label: "Internal Drives",
      key: "3",
      children: <p>Hii</p>,
    },
    {
      label: "Applied Drives",
      key: "4",
      children: <p>Hii</p>,
    },
  ];

  return (
    <div>
      <p className="common_heading" style={{ margin: 0 }}>
        Jobs
      </p>
      <div style={{ marginTop: "20px" }}>
        <Tabs
          className="companyquestions_tabs"
          defaultActiveKey={tabItems[0]?.key} // ✅ auto select first visible tab
          items={tabItems}
        />
      </div>
    </div>
  );
}
