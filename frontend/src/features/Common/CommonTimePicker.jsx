import React from "react";
import { Space, TimePicker } from "antd";
import "./commonstyles.css";

const CommonTimePicker = ({
  onChange,
  value,
  label,
  error,
  mandatory,
  style,
  disabled,
  allowClear,
  labelFontSize,
  height,
  placeholder,
}) => {
  const fontSizeClass = labelFontSize
    ? `timepicker-fontsize-${labelFontSize.replace("px", "")}`
    : "";

  return (
    <div style={style} className={fontSizeClass}>
      {labelFontSize && (
        <style>{`
          .${fontSizeClass} .ant-picker .ant-picker-input > input::placeholder {
            font-size: ${labelFontSize} !important;
          }
          .${fontSizeClass} .ant-picker .ant-picker-input > input {
            font-size: ${labelFontSize} !important;
          }
          .${fontSizeClass} .ant-picker .ant-picker-suffix {
            font-size: ${labelFontSize} !important;
            display: flex;
            align-items: center;
          }
        `}</style>
      )}

      <Space direction="vertical" style={{ width: "100%" }}>
        <TimePicker
          className={
            error === "" || error === null || error === undefined
              ? "common_singledatepicker"
              : "common_singledatepicker_error"
          }
          use12Hours
          format="h:mm A"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            height: height ? height : "40px",
          }}
          status={error ? "error" : ""}
          disabled={disabled}
          allowClear={allowClear}
        />
      </Space>

      {error && (
        <div
          className={
            error
              ? "commontimepicker_errormessage_activediv"
              : "commontimepicker_errormessagediv"
          }
        >
          <p className="common_singledatepicker_errortext">
            {placeholder.replace("*", "").trim() + error}
          </p>
        </div>
      )}
    </div>
  );
};

export default CommonTimePicker;
