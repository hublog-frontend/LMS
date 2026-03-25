import React from "react";
import {
  InputLabel,
  FormControl,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import FormHelperText from "@mui/material/FormHelperText";
import "./commonstyles.css";

export default function CommonOutlinedInput({
  label,
  icon,
  value,
  onChange,
  type,
  error,
  required,
  width,
  height,
  labelFontSize,
  labelMarginTop,
  helperTextContainerStyle,
  style,
  maxLength,
  onInput,
  errorFontSize,
  disabled,
}) {
  return (
    <FormControl
      variant="outlined"
      size="small"
      className="common_inputfield"
      error={error ? true : false}
      // required={required}
      required={required}
      sx={{
        width: width ? width : "100%",
        "& .MuiInputLabel-root": {
          fontSize: labelFontSize ? labelFontSize : "14px",
          marginTop: labelMarginTop,
        },
        "& .MuiInputBase-input": {
          height: height || "auto",
          boxSizing: "border-box",
          fontSize: "14px",
        },
        "& .Mui-disabled": {
          backgroundColor: "#f5f5f5", // change background
          color: "#888", // change text color
          WebkitTextFillColor: "#888", // needed for iOS/Chrome to change disabled text color
        },
      }}
    >
      <InputLabel htmlFor="outlined-adornment-password" shrink={Boolean(value)}>
        {label}
      </InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        endAdornment={<InputAdornment position="end">{icon}</InputAdornment>}
        label={label}
        value={value}
        onChange={onChange}
        type={type}
        sx={style}
        inputProps={{ maxLength: maxLength }}
        onInput={onInput}
        disabled={disabled}
        notched={Boolean(value)}
        autoComplete="off"
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
