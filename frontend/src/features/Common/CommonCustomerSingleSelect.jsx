import React from "react";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import "./commonstyles.css";

export default function CommonCustomerSingleSelectField({
  label,
  value = null, // 🔹 single value
  inputValue,
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
  labelMarginTop,
  helperTextContainerStyle,
  open,
  disableClearable,
  disabled,
  errorFontSize,
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
  /** 🔹 Resolve label */
  const getLabel = (option) => {
    if (!option) return "";
    if (showLabelStatus === "Name") return option.name;
    if (showLabelStatus === "Email") return option.email;
    if (showLabelStatus === "Mobile") return option.mobile;
    if (showLabelStatus === "Trainer Id") return option.trainer_code;
    if (option?.user_name) return `${option.user_id} - ${option.user_name}`;
    return option?.exp_range || option?.name || "";
  };

  /** 🔹 Convert stored id → option object */
  const selectedOption =
    options.find((opt) => String(opt.id ?? opt.user_id) == String(value)) ||
    null;

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
          },
        }}
      >
        <Autocomplete
          open={open}
          options={options}
          value={selectedOption}
          inputValue={inputValue}
          loading={loading}
          groupBy={groupBy}
          disableClearable={disableClearable}
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
          /** 🔹 Change → return single id */
          onChange={(event, newValue) => {
            onChange?.({
              target: {
                value: newValue
                  ? String(newValue.id ?? newValue.user_id)
                  : null,
                object: newValue || null, // ✅ pass selected object
              },
            });
          }}
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
              },
            },
          }}
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
                position: "absolute",
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
