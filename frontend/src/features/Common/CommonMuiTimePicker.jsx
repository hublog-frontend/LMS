import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { IoIosClose } from "react-icons/io";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";

export default function CommonMuiTimePicker({
  label,
  required,
  onChange,
  value,
  error,
  errorFontSize,
  allowClear = false,
  disabled = false,
}) {
  // const [value, setValue] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        label={label}
        value={value ? dayjs(value, "HH:mm:ss") : null} // convert JS Date to Dayjs
        onChange={(newValue) => {
          if (newValue && newValue.isValid()) {
            onChange(newValue.format("HH:mm:ss")); // return as "09:00:00"
          } else {
            onChange(null);
          }
        }}
        open={open}
        disabled={disabled}
        views={["hours", "minutes"]}
        onAccept={(newValue) => {
          if (newValue && newValue.isValid()) {
            onChange(newValue.format("HH:mm:ss"));
          }
          setOpen(false);
        }}
        ampm={true}
        onClose={() => setOpen(false)}
        onOpen={() => {
          if (disabled === true) {
            return;
          }
          setOpen(true);
        }}
        slotProps={{
          day: {
            sx: {
              "&.Mui-selected": {
                backgroundColor: "#2160ad !important", // your custom color
                color: "#fff", // text color on selected
                "&:hover": {
                  backgroundColor: "#4a58b0", // hover state
                },
              },
            },
            "&.MuiPickersDay-today": {
              backgroundColor: "#2160ad", // optional
            },
          },
          popper: {
            sx: {
              "& .MuiMultiSectionDigitalClockSection-item": {
                fontSize: "12px", // desired font size
                fontFamily: "Poppins, sans-serif", // desired font family
              },
              "& .Mui-selected": {
                backgroundColor: "#2160ad !important",
                color: "#fff !important",
              },
              "& .Mui-selected:hover": {
                backgroundColor: "#2160ad !important",
                color: "#fff !important",
              },
              "& .MuiButton-root": {
                color: "#2160ad !important",
                fontSize: "13px !important",
              },
            },
          },
          textField: {
            fullWidth: true,
            size: "small",
            required: required,
            error: error,
            helperText: error ? (
              <span
                style={{ fontSize: errorFontSize ? errorFontSize : "11px" }}
              >
                {label + error}
              </span>
            ) : null,
            onClick: () => {
              if (disabled === true) {
                return;
              }
              setOpen(true);
            },
            InputProps: {
              endAdornment: (
                <>
                  {allowClear && value && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange(null); // clear value
                        }}
                      >
                        <IoIosClose size={18} />
                      </IconButton>
                    </InputAdornment>
                  )}
                </>
              ),
            },
            sx: {
              // label font
              "& .MuiPickersInputBase-root": {
                height: "42px !important",
                fontFamily: "Poppins, sans-serif !important",
              },
              "& .MuiInputLabel-root": {
                fontFamily: "Poppins, sans-serif",
                fontSize: "13px",
                marginTop: "3px",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: error ? "#d32f2f" : "#2160ad", // custom focus color
              },
              // value font
              "& .MuiPickersSectionList-section": {
                fontFamily: "Poppins, sans-serif !important",
                fontSize: "13px",
                marginTop: "3px",
              },
              "& .MuiPickersSectionList-sectionContent": {
                fontFamily: "Poppins, sans-serif",
                fontSize: "13px",
              },
              "& .MuiSvgIcon-root": {
                fontSize: "20px",
                marginTop: "-1px",
              },
              /** ✅ Correct border overrides */
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: error ? "#d32f2f" : "#b0b0b0", // default
              },
              "& .MuiPickersOutlinedInput-root:hover .MuiPickersOutlinedInput-notchedOutline":
                {
                  borderColor: error ? "#d32f2f" : "rgba(128, 128, 128, 0.712)",
                },
              "& .MuiPickersOutlinedInput-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline":
                {
                  borderColor: error ? "#d32f2f" : "#2160ad !important",
                  borderWidth: 1,
                },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
