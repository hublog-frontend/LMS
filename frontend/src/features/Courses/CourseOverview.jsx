import React from "react";

export default function CourseOverview({ courseDetails }) {
  return (
    <div style={{ marginTop: "16px" }}>
      <p className="courseoverview_headings">Course Description</p>
      <p className="courseoverview_contents">{courseDetails?.description}</p>

      <p className="courseoverview_headings">Course Outcomes</p>
      <div className="courseoutcomes_container">
        <p className="courseoutcomes_content">{courseDetails?.outcomes}</p>
      </div>
    </div>
  );
}
