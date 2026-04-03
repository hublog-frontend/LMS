import React from "react";
import { Input } from "antd";
import "./commonstyles.css";
import { capitalizeWords } from "./Validation";

export default function CommonInputField({
  label,
  placeholder,
  value,
  onChange,
  error,
  required,
  height,
  prefix,
  suffix,
  labelFontSize,
  errorFontSize,
  ref,
  maxLength,
  type,
  onFocus,
  disabled,
  onInput,
  borderLeftNone,
}) {
  const handleChange = (e) => {
    let value = e.target.value.replace(/^\s+/, "");

    if (
      label === "Email" ||
      label === "Trainer Email" ||
      label === "User Id" ||
      label === "Role Name" ||
      label === "IFSC Code" ||
      label === "Address" ||
      label === "Description" ||
      label === "Outcomes" ||
      label === "Linkedin Link" ||
      label === "Instagram Link" ||
      label === "Github Link" ||
      label === "Portfolio Link" ||
      label === "Project Link" ||
      label === "Youtube Url" ||
      label === "Attendance Sheet Link" ||
      label === "Job ID / Code" ||
      label === "Offered Salary / CTC" ||
      label === "Shift / Timings" ||
      label === "Certificate Name"
    ) {
      onChange?.({ target: { value } });
    } else {
      const newValue = capitalizeWords(value);
      onChange?.({ target: { value: newValue } });
    }
  };

  return (
    <div className="common_inputfield_wrapper">
      {/* ✅ Label */}
      {label && (
        <label className="common_inputfields_label">
          {label} {required && <span style={{ color: "#d32f2f" }}>*</span>}
        </label>
      )}

      {/* ✅ Single line Input */}
      <Input
        className={
          error ? "common_antd_error_inputfield" : "common_antd_inputfield"
        }
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        prefix={prefix}
        suffix={suffix}
        onFocus={onFocus}
        onInput={onInput}
        disabled={disabled}
        maxLength={maxLength}
        type={type}
        status={error ? "error" : ""}
        autoComplete="on"
        style={{
          height: height || 32,
          borderTopLeftRadius: borderLeftNone ? 0 : 6,
          borderBottomLeftRadius: borderLeftNone ? 0 : 6,
        }}
      />

      {/* ✅ Error Text */}
      {error && (
        <div className="common_inputfields_error_text">
          {label === "Paid Now" ? "" : label} {error}
        </div>
      )}
    </div>
  );
}
