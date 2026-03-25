import React from "react";
import { Input } from "antd";
import { capitalizeWords } from "./Validation";
import "./commonstyles.css";

const { TextArea } = Input;

const CommonTextArea = ({
  label,
  onChange,
  value,
  error,
  maxLength,
  required,
  className,
  style,
  disabled = false,
}) => {
  const handleChange = (e) => {
    const newValue = capitalizeWords(e.target.value);
    if (onChange) {
      // pass transformed value to parent
      onChange({ target: { value: newValue } });
    }
  };

  return (
    <div style={style}>
      <div style={{ display: "flex" }}>
        <label className="commontextarea_label">{label}</label>
        {required ? (
          <p style={{ color: "#d32f2f", marginLeft: "4px" }}>*</p>
        ) : (
          ""
        )}
      </div>
      <TextArea
        rows={4}
        placeholder="Type here..."
        onChange={handleChange}
        value={value}
        error={error}
        status={error ? "error" : ""}
        maxLength={maxLength}
        disabled={disabled}
        className={`${
          error === "" || error === null || error === undefined
            ? "commontextarea"
            : "commontextarea_error"
        } ${className}`}
      />
      {error && (
        <div
          className={
            error
              ? "commontextarea_errormessage_activediv"
              : "commontextarea_errormessagediv"
          }
        >
          <p style={{ color: "#d32f2f", marginTop: "2px" }}>{label + error}</p>
        </div>
      )}
    </div>
  );
};
export default CommonTextArea;
