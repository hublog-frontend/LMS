import React from "react";
import NodataImage from "../../assets/nodata.png";
import "./commonstyles.css";

export default function CommonNodataFound({ message }) {
  return (
    <div className="nodata_main_container">
      <div className="nodata_container">
        <img src={NodataImage} className="nodata_image" />
        <p className="nodata_message">{message ? message : "No data found"}</p>
      </div>
    </div>
  );
}
