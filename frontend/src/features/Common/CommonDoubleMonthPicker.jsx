import React from "react";
import dayjs from "dayjs";
import moment from "moment";
import { DatePicker, Space } from "antd";
import "./commonstyles.css";

const { RangePicker } = DatePicker;

export default function CommonDoubleMonthPicker({
  onChange,
  value,
  label,
  showFutureDates,
}) {
  const handleRangeChange = (dates, dateStrings) => {
    if (onChange) {
      onChange(dates, dateStrings);
    }
  };

  // Disable future months
  const disabledDate = (current) => {
    if (showFutureDates === true) return false; // allow all months
    return current && current > moment().endOf("month");
  };

  return (
    <div className="commonInputfield_container">
      <div style={{ display: "flex" }}>
        {/* {label && (
          <label
            style={{ marginBottom: "4px", fontSize: "12px", fontWeight: 600 }}
          >
            {label}
          </label>
        )} */}
      </div>

      <Space direction="vertical" size={12}>
        <RangePicker
          picker="month"
          format="MMM - YYYY"
          className="commonInputfield"
          value={
            value && value.length === 2 && value[0] && value[1]
              ? [dayjs(value[0]), dayjs(value[1])]
              : null
          }
          onChange={handleRangeChange}
          disabledDate={disabledDate}
          allowClear={false}
          style={{ height: "34px", width: "100%" }}
        />
      </Space>
    </div>
  );
}
