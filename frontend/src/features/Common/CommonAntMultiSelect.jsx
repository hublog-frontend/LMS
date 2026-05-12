import React from "react";
import { Select, Checkbox } from "antd";
import "./commonstyles.css";
import { IoCaretDownSharp } from "react-icons/io5";
import EllipsisTooltip from "./EllipsisTooltip";

export default function CommonAntdMultiSelect({
  options = [],
  label,
  required,
  onChange,
  value = [],
  error,
  disabled,
  loading,
  placeholder,
  allSelectLabel = "All",
  mode = "multiple",
  isFilterField = false,
}) {
  const isTagMode = mode === "tags";

  const allValues = options.map(
    (item) => item.user_id ?? item.skill_id ?? item.id,
  );

  const getValue = (item) => item.user_id ?? item.skill_id ?? item.id;

  const getLabel = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    if (item.user_name) return `${item.user_id} - ${item.user_name}`;
    return item.role_name ?? item.name ?? String(item);
  };

  const isAllSelected =
    !isTagMode &&
    allValues.length > 0 &&
    allValues.every((v) => value.includes(v));

  const handleChange = (vals) => {
    if (!isTagMode && vals.includes("all")) {
      const allSelected = isAllSelected;
      onChange(allSelected ? [] : allValues);
      return;
    }

    onChange(vals.filter((v) => v !== "all"));
  };

  // ✅ Build options array (AntD v5 way)
  const selectOptions = [
    ...(!isTagMode && options.length > 0
      ? [
          {
            label: (
              <div style={{ display: "flex", alignItems: "center" }}>
                <Checkbox checked={isAllSelected} style={{ marginRight: 8 }} />
                {allSelectLabel}
              </div>
            ),
            value: "all",
            filterLabel: allSelectLabel,
          },
        ]
      : []),

    ...options.map((item) => {
      const val = getValue(item);
      const lbl = getLabel(item);

      return {
        label: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <Checkbox
              checked={value.includes(val)}
              style={{ marginRight: 8 }}
            />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <EllipsisTooltip text={lbl} />
            </div>
          </div>
        ),
        value: val,
        filterLabel: lbl,
      };
    }),
  ];

  return (
    <div style={{ position: "relative" }}>
      {label && (
        <label className="common_inputfields_label">
          {label} {required && <span style={{ color: "#d32f2f" }}>*</span>}
        </label>
      )}

      <Select
        className={`${
          isFilterField
            ? "common_filter_antd_inputfield common_filter_multiselect"
            : !error
              ? "common_antd_inputfield"
              : "common_antd_error_inputfield"
        } commonMultiselectfield`}
        style={{ width: "100%" }}
        suffixIcon={<IoCaretDownSharp color="rgba(0,0,0,0.54)" />}
        mode={mode}
        showSearch
        allowClear
        disabled={disabled}
        loading={loading}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        status={error ? "error" : ""}
        options={selectOptions} // ✅ new API
        optionFilterProp="filterLabel"
        maxTagCount="responsive"
        filterOption={(input, option) =>
          String(option?.filterLabel || "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        open={mode === "tags" ? false : undefined} // optional
      />

      {error && (
        <div className="commoninput_errormessage_activediv">
          <p className="commonantdmultifield_errortext">
            {label ? label + error : error}
          </p>
        </div>
      )}
    </div>
  );
}
