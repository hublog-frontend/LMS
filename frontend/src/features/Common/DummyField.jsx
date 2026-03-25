import React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import FormHelperText from "@mui/material/FormHelperText";
import "./commonstyles.css";

export default function CommonAutoCompleteField({
  label,
  value,
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
  downArrowIconTop,
  helperTextContainerStyle,
}) {
  return (
    <div style={style}>
      <FormControl
        fullWidth
        className="common_selectfield"
        size="small"
        error={error ? true : false}
        required={required}
        sx={{
          flex: 1,
          "& .MuiInputLabel-root": {
            fontSize: labelFontSize ? labelFontSize : "14px",
            padding: "0px 0px",
            marginTop: labelMarginTop,
          },
          "& .MuiInputBase-root": {
            height: height ? height : "46px", //  Controls full height of select box
          },
          "& .MuiSelect-select": {
            height: height ? height : "100%", //  Controls the selected value area
            display: "flex",
            alignItems: "center",
            fontSize: fontSize ? fontSize : "14px",
            marginTop: valueMarginTop,
          },
          "& .MuiOutlinedInput-notchedOutline": {
            height: "100%", // Ensure the outline stretches
          },
          "& .MuiSelect-icon": {
            top: downArrowIconTop ?? "44%",
            transform: "translateY(-50%)", // perfectly vertical center
          },
        }}
      >
        <InputLabel id="demo-simple-select-label">{label}</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label={label}
          value={value ?? ""} // this avoids uncontrolled-to-controlled warning
          onChange={onChange}
          MenuProps={{
            PaperProps: {
              sx: {
                "& .MuiMenuItem-root": {
                  fontSize: optionsFontSize ? optionsFontSize : "13px",
                },
                "& .MuiMenuItem-root.Mui-selected": {
                  backgroundColor: "#5b69ca26",
                },
                "& .MuiMenuItem-root.Mui-selected:hover": {
                  backgroundColor: "#5b69ca26",
                },
              },
            },
          }}
        >
          {options.length === 0 ? (
            <MenuItem disabled>No data found</MenuItem>
          ) : (
            options.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.exp_range ? item.exp_range : item.name}
              </MenuItem>
            ))
          )}
        </Select>
        {error && (
          <div style={helperTextContainerStyle}>
            <FormHelperText className="common_selectfield_errortext">
              {label + " " + error}
            </FormHelperText>
          </div>
        )}
      </FormControl>
    </div>
  );
}
