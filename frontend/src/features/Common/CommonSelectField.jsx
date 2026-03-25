import React from "react";
import { Select } from "antd";
import "./commonstyles.css";

export default function CommonSelectField({
  label,
  value,
  onChange,
  error,
  required,
  options = [],
  fontSize,
  labelFontSize,
  optionsFontSize,
  width,
  height,
  style,
  helperTextContainerStyle,
  disableClearable,
  disabled,
  errorFontSize,
  renderOption,
  groupBy,
  showLabelStatus,
  borderRightNone,
  borderLeftNone,
  onFocus,
  onBlur,
  allowClear = true,
  isFilterField = false,
}) {
  // ✅ label resolver (same logic you had)
  const getLabel = (option) => {
    if (!option) return "";

    if (showLabelStatus === "Name") return option?.name;
    if (showLabelStatus === "Email") return option?.email;
    if (showLabelStatus === "Mobile") return option?.mobile;
    if (showLabelStatus === "Trainer Id") return option?.trainer_code;
    if (option?.module_name) {
      return `${option.module_name} - ${option.title}`;
    }

    if (option?.user_name) {
      return `${option.user_id} - ${option.user_name}`;
    }

    return option?.exp_range || option?.name || "";
  };

  // ✅ convert to AntD options format
  const mappedOptions = options.map((opt) => ({
    value: opt.id,
    label: renderOption ? renderOption(opt) : getLabel(opt),
    disabled: opt.is_active === false,
    group: groupBy ? groupBy(opt) : null,
    raw: opt,
  }));

  // ✅ group support
  const groupedOptions = groupBy
    ? Object.values(
        mappedOptions.reduce((acc, item) => {
          const key = item.group || "Others";
          acc[key] ??= { label: key, options: [] };
          acc[key].options.push(item);
          return acc;
        }, {}),
      )
    : mappedOptions;

  return (
    <div style={{ width: width || "100%", ...style }}>
      {/* ✅ Label */}
      {label && (
        <label className="common_inputfields_label">
          {label} {required && <span style={{ color: "#d32f2f" }}>*</span>}
        </label>
      )}

      {/* ✅ Select */}
      <Select
        className={
          isFilterField
            ? "common_filter_antd_inputfield"
            : error
              ? "common_antd_error_inputfield"
              : "common_antd_inputfield"
        }
        showSearch
        allowClear={allowClear}
        value={value || undefined}
        disabled={disabled}
        options={groupedOptions}
        onChange={(val) =>
          onChange?.({
            target: { value: val ?? "" },
          })
        }
        onFocus={onFocus}
        onBlur={onBlur}
        optionFilterProp="label"
        style={{
          width: "100%",
          fontWeight: 300,
          fontSize: "14px",
          height: height || 42,
        }}
        styles={{
          selector: {
            fontSize: fontSize || "14px",
            borderTopRightRadius: borderRightNone ? 0 : 6,
            borderBottomRightRadius: borderRightNone ? 0 : 6,
            borderTopLeftRadius: borderLeftNone ? 0 : 6,
            borderBottomLeftRadius: borderLeftNone ? 0 : 6,
          },
          option: {
            fontSize: optionsFontSize || "13px",
          },
        }}
        popupMatchSelectWidth
      />

      {/* ✅ Error */}
      {error && (
        <div>
          <div className="common_inputfields_error_text">
            {label} {error}
          </div>
        </div>
      )}
    </div>
  );
}
