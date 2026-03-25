import React from "react";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Chip } from "@mui/material";
import { Checkbox } from "antd";
import "./commonstyles.css";

export default function CommonCustomerMultiSelectField({
  label,
  value = [],
  inputValue,
  onChange,
  error,
  required,
  options = [],
  fontSize,
  valueMarginTop,
  labelFontSize,
  optionsFontSize,
  width,
  height,
  style,
  labelMarginTop,
  helperTextContainerStyle,
  open,
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
  onDropdownOpen,
  onDropdownScroll,
  onInputChange,
  loading,
}) {
  /** 🔹 Resolve label (same logic as single select) */
  const getLabel = (option) => {
    if (!option) return "";
    if (showLabelStatus === "Name") return option.name;
    if (showLabelStatus === "Email") return option.email;
    if (showLabelStatus === "Mobile") return option.mobile;
    if (showLabelStatus === "Trainer Id") return option.trainer_code;
    if (option?.user_name) return `${option.user_id} - ${option.user_name}`;
    return option?.exp_range || option?.name || "";
  };

  /** 🔹 Convert stored ids → option objects */
  const selectedOptions = options.filter((opt) =>
    value.includes(String(opt.id ?? opt.user_id)),
  );

  return (
    <div style={style}>
      <FormControl
        fullWidth
        size="small"
        className="common_selectfield"
        sx={{
          width: width || "100%",
          "& .MuiInputLabel-root": {
            fontSize: labelFontSize || "14px",
            marginTop: labelMarginTop || "1px",
            fontFamily: "Poppins, sans-serif",
          },
          "& .MuiOutlinedInput-root": {
            minHeight: height || "42px",
            alignItems: "flex-start",
          },
        }}
      >
        <Autocomplete
          multiple
          open={open}
          options={options}
          value={selectedOptions}
          inputValue={inputValue}
          loading={loading}
          groupBy={groupBy}
          disableCloseOnSelect
          disableClearable={disableClearable ?? true}
          disabled={disabled}
          filterOptions={(x) => x}
          getOptionLabel={getLabel}
          getOptionDisabled={(option) => option.is_active === false}
          isOptionEqualToValue={(o, v) =>
            String(o.id ?? o.user_id) === String(v.id ?? v.user_id)
          }
          /** 🔹 Search */
          onInputChange={(event, newValue, reason) => {
            if (reason === "input") {
              onInputChange?.(newValue);
            }
          }}
          /** 🔹 Change → return array of ids */
          onChange={(event, newValue) => {
            onChange?.({
              target: {
                value: newValue.map((v) => String(v.id ?? v.user_id)),
              },
            });
          }}
          /** 🔹 Scroll pagination */
          onOpen={onDropdownOpen}
          slotProps={{
            listbox: {
              onScroll: onDropdownScroll,
              sx: {
                "& .MuiAutocomplete-option": {
                  fontSize: optionsFontSize || "13px",
                },
                "& .MuiAutocomplete-option[aria-selected='true']": {
                  backgroundColor: "#5b69ca26",
                },
                "& .MuiAutocomplete-option[aria-selected='true']:hover": {
                  backgroundColor: "#5b69ca26",
                },
              },
            },
          }}
          /** 🔹 Chips with overflow control */
          renderTags={(value, getTagProps) => (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                maxHeight: "64px",
                overflowY: "auto",
                width: "100%",
              }}
            >
              {value.map((option, index) => {
                const tagProps = getTagProps({ index });
                return (
                  <Chip
                    {...tagProps}
                    key={index}
                    label={getLabel(option)}
                    size="small"
                    sx={{
                      height: "22px",
                      fontSize: "12px",
                      "& .MuiChip-label": {
                        padding: "0 6px",
                      },
                    }}
                  />
                );
              })}
            </div>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              required={required}
              error={error}
              size="small"
              onFocus={onFocus}
              onBlur={onBlur}
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: fontSize || "14px",
                  marginTop: "2px",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderRight: borderRightNone ? "none" : "",
                  borderLeft: borderLeftNone ? "none" : "",
                  borderTopRightRadius: borderRightNone ? 0 : 4,
                  borderBottomRightRadius: borderRightNone ? 0 : 4,
                  borderTopLeftRadius: borderLeftNone ? 0 : 4,
                  borderBottomLeftRadius: borderLeftNone ? 0 : 4,
                },
              }}
            />
          )}
          /** 🔹 Checkbox UI */
          renderOption={
            renderOption
              ? renderOption
              : (props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox
                      checked={selected}
                      size="small"
                      style={{ marginRight: 8 }}
                    />
                    <span style={{ fontSize: optionsFontSize || "13px" }}>
                      {getLabel(option)}
                    </span>
                  </li>
                )
          }
          noOptionsText={
            <span style={{ fontSize: "13px", color: "#888" }}>
              No data found
            </span>
          }
        />

        {error && (
          <div style={helperTextContainerStyle}>
            <FormHelperText
              sx={{
                fontSize: errorFontSize || "11px",
                color: "#d32f2f",
                fontFamily: "Poppins, sans-serif",
                marginLeft: 0,
              }}
            >
              {label} {error}
            </FormHelperText>
          </div>
        )}
      </FormControl>
    </div>
  );
}
