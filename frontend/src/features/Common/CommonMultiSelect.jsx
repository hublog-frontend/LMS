import React from "react";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import "./commonstyles.css";
import { Chip } from "@mui/material";
import { Checkbox } from "antd";

export default function CommonMultiSelect({
  label,
  value = [],
  onChange,
  error,
  required,
  options = [],
  freeSolo = false,
  fontSize,
  labelFontSize,
  optionsFontSize,
  width,
  style,
  labelMarginTop,
  disableClearable,
  disabled,
  errorFontSize,
  groupBy,
  showLabelStatus,
  borderRightNone,
  borderLeftNone,
  onFocus,
  onBlur,
}) {
  // Map stored ids -> option objects
  const selectedOptions = freeSolo
    ? value
    : options.filter((opt) => value.includes(String(opt.user_id ?? opt.id)));

  // Label resolver
  const getLabel = (option) => {
    if (!option) return "";
    if (typeof option == "string") return option;

    if (showLabelStatus === "Name") return option.name;
    if (showLabelStatus === "Email") return option.email;
    if (showLabelStatus === "Mobile") return option.mobile;
    if (showLabelStatus === "Trainer Id") return option.trainer_code;
    if (option.user_name) return `${option.user_id} - ${option.user_name}`;
    return option.name || "";
  };

  return (
    <div style={style}>
      <FormControl
        fullWidth
        size="small"
        className="common_selectfield"
        sx={{
          width: width || "100%",

          /* Label */
          "& .MuiInputLabel-root": {
            fontSize: labelFontSize || "14px",
            marginTop: labelMarginTop || "1px",
            fontFamily: "Poppins, sans-serif",
          },

          /* Outer border */
          "& .MuiOutlinedInput-root": {
            minHeight: "32px",
            alignItems: "flex-start",
          },
        }}
      >
        <Autocomplete
          multiple
          freeSolo={freeSolo}
          options={options}
          value={selectedOptions}
          disableCloseOnSelect
          disableClearable={disableClearable ?? true}
          disabled={disabled}
          groupBy={groupBy}
          getOptionLabel={getLabel}
          onChange={(event, newValue) => {
            const mapped = newValue.map(
              (v) =>
                typeof v === "string"
                  ? v // solo typed
                  : String(v.user_id ?? v.id), // selected option
            );

            onChange?.({
              target: { value: mapped },
            });
          }}
          noOptionsText={
            <span style={{ fontSize: "13px", color: "#888" }}>
              No data found
            </span>
          }
          /* ✅ THIS FIXES THE CHIP OVERFLOW ISSUE */
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
              size="small"
              error={error}
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
          slotProps={{
            listbox: {
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
          /* Checkbox before label */
          renderOption={(props, option, { selected }) => (
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
          )}
        />

        {error && (
          <FormHelperText
            sx={{
              fontSize: errorFontSize || "11px",
              marginLeft: 0,
            }}
          >
            {label} {error}
          </FormHelperText>
        )}
      </FormControl>
    </div>
  );
}
