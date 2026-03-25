import React from "react";
import { FormControl, FormHelperText } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import "./commonstyles.css";

export default function CommonGroupedSelectField({
  label,
  required,
  options,
  value,
  onChange,
  optionLabel = "name",
  optionValue = "id",
  groupByField = "category",
  size = "small",
  placeholder = "",
  error,
  errorFontSize,
  helperTextContainerStyle,
  disabled = false,
}) {
  const paymentModeOptions = [
    { id: 1, name: "Cash", category: "General" },
    { id: 4, name: "UPI", category: "General" },
    { id: 5, name: "Razorpay", category: "General" },
    { id: 6, name: "Razorpay - UPI", category: "General" },
    { id: 9, name: "TDS", category: "General" },
    { id: 3, name: "SBI", category: "Bank" },
    { id: 7, name: "AXIS", category: "Bank" },
    { id: 8, name: "HDFC", category: "Bank" },
    { id: 2, name: "SBI POS", category: "POS" },
    { id: 10, name: "Razorpay POS", category: "POS" },
  ];

  return (
    <FormControl
      fullWidth
      className="common_selectfield"
      size="small"
      sx={{
        flex: 1,
        width: "100%",
        "& .MuiInputLabel-root": {
          fontSize: "14px",
          padding: "0px 0px",
          marginTop: "1px",
          fontFamily: "Poppins,  sans-serif",
        },
        "& .MuiOutlinedInput-root": {
          height: "42px",
        },
        "& .MuiAutocomplete-input": {
          fontSize: "14px",
          marginTop: "0px",
        },
        "& .Mui-disabled": {
          backgroundColor: "#f5f5f5", // change background
          color: "#888", // change text color
          WebkitTextFillColor: "#888", // needed for iOS/Chrome to change disabled text color
        },
      }}
    >
      <Autocomplete
        options={paymentModeOptions}
        groupBy={(option) => option[groupByField]}
        value={
          paymentModeOptions?.find((o) => o[optionValue] === value) ?? null
        }
        getOptionLabel={(option) => option?.[optionLabel] || ""}
        isOptionEqualToValue={(o, v) => o?.[optionValue] === v?.[optionValue]}
        onChange={(e, newValue) => onChange(newValue?.[optionValue] ?? null)}
        disableClearable={true}
        disabled={disabled}
        noOptionsText={
          <span style={{ fontSize: "13px", color: "#888" }}>No data found</span>
        }
        renderGroup={(params) => (
          <li key={params.key}>
            <div
              style={{
                padding: "6px 10px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#000000E0",
                background: "#fff",
              }}
            >
              {params.group}
            </div>
            <ul style={{ padding: 0 }}>{params.children}</ul>
          </li>
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <p style={{ margin: 0 }}>{option?.[optionLabel]}</p>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            size={size}
            label={label}
            required={required}
            placeholder={placeholder}
            error={error}
            className="common_inputfield"
            sx={{
              "& .MuiInputBase-input": { fontSize: "14px" },
            }}
          />
        )}
        slotProps={{
          listbox: {
            sx: {
              "& .MuiAutocomplete-option": { fontSize: "13px" },
              "& .MuiAutocomplete-option[aria-selected='true']": {
                backgroundColor: "#5b69ca26",
              },
              "& .MuiAutocomplete-option[aria-selected='true']:hover": {
                backgroundColor: "#5b69ca26",
              },
            },
          },
        }}
      />
      {error && (
        <div style={helperTextContainerStyle}>
          <FormHelperText
            className="common_selectfield_errortext"
            style={{
              fontSize: errorFontSize ? errorFontSize : "11px",
            }}
          >
            {label + " " + error}
          </FormHelperText>
        </div>
      )}
    </FormControl>
  );
}
