import React from "react";
import { Autocomplete, TextField } from "@mui/material";

export default function CommonOptionsMultiSelect({
  options,
  label,
  defaultValue,
  height,
  fontSize,
  valueMarginTop,
  optionsFontSize,
  required,
}) {
  return (
    <div>
      <Autocomplete
        multiple
        limitTags={2}
        size="small"
        id="multiple-limit-tags"
        options={options}
        getOptionLabel={(option) => option.title}
        defaultValue={defaultValue}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            className="common_inputfield"
            sx={{
              "& .MuiInputBase-input": {
                fontSize: "12px", // 👈 input text font size
              },
              "& .MuiInputLabel-root": {
                fontSize: "14px", // 👈 label font size
              },
              "& .MuiAutocomplete-endAdornment": {
                top: "43%",
              },
            }}
            required={required}
          />
        )}
        className="common_inputfield"
        sx={{
          width: "100%",
          "& .MuiInputBase-root": {
            height: height || "auto",
            minHeight: height || "46px",
            alignItems: "start",
            flexWrap: "wrap",
          },
          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            fontSize: fontSize ? fontSize : "14px",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            height: "100%", // Ensure the outline stretches
          },
          "& .MuiInputLabel-root": {
            fontSize: "14px", // Change this value as needed
            // marginTop: "-6px",
          },
          "& .MuiChip-root": {
            height: "26px",
            fontSize: "11px",
            padding: "2px 4px",
            display: "flex",
            alignItems: "center",
          },
        }}
        slotProps={{
          paper: {
            sx: {
              fontSize: optionsFontSize || "13px", // 👈 Option font size
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
    </div>
  );
}
