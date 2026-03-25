import React from "react";
import { DatePicker, Space } from "antd";
import dayjs from "dayjs";
import "./commonstyles.css";
export default function CommonDatePicker({
  onChange,
  value,
  defaultValue,
  month,
  placeholder,
  label,
  labelFontSize,
  error,
  required,
  style,
}) {
  const handleChange = (date) => {
    const dates = new Date(date.$d);

    // Format the date using toString method
    const formattedDate = dates.toString();
    onChange(formattedDate);
  };

  // Disable future dates
  const disableFutureDates = (current) => {
    return current && current > dayjs().endOf("day"); // Disable dates greater than today
  };

  return (
    <div style={style}>
      <div style={{ display: "flex" }}>
        {label && (
          <label className="common_inputfields_label">
            {label} {required && <span style={{ color: "#d32f2f" }}>*</span>}
          </label>
        )}{" "}
      </div>
      <DatePicker
        className={
          error === "" || error === null || error === undefined
            ? "common_antd_inputfield"
            : "common_antd_error_inputfield"
        }
        picker={month === "true" ? "month" : "date"}
        onChange={handleChange}
        value={value ? dayjs(value) : null}
        defaultValue={defaultValue}
        format="DD-MM-YYYY"
        placeholder={placeholder}
        status={error ? "error" : ""}
        style={{ width: "100%", fontWeight: 300, fontSize: "14px" }}
        allowClear={false}
        disabledDate={disableFutureDates}
      />
      {error && (
        <div className="common_inputfields_error_text">
          <p>{label + error}</p>
        </div>
      )}
    </div>
  );
}
