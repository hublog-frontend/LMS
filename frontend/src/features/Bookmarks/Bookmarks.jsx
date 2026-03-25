import React from "react";
import { Tabs } from "antd";

export default function Bookmarks() {
  const tabItems = [
    { label: "Question", key: "1", children: <p>Hii</p> },
    {
      label: "Video",
      key: "2",
      children: <p>Hii</p>,
    },
  ];

  return (
    <div>
      <p className="common_heading" style={{ margin: 0 }}>
        Bookmarks
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
