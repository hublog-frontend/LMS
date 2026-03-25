import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function CommonNxtFollowupDatePicker({
  label,
  required,
  onChange,
  value,
  error,
  errorFontSize,
  disablePreviousDates,
  allowAllDates,
  disabled,
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value ? dayjs(value) : null} // convert JS Date to Dayjs
        onChange={(newValue) => {
          // Convert Dayjs to JS Date
          const jsDate = newValue ? newValue.toDate() : null;
          onChange(jsDate);
        }}
        open={!disabled && open} // ✅ only open if not disabled
        format="DD/MM/YYYY"
        onClose={() => setOpen(false)}
        onOpen={() => {
          if (!disabled) {
            setOpen(true);
          }
        }}
        shouldDisableDate={(date) => {
          if (allowAllDates) return false;

          const today = dayjs().startOf("day");

          // Only allow today + 2, 4, 6
          const allowedDates = [
            today,
            today.add(2, "day"),
            today.add(4, "day"),
            today.add(6, "day"),
          ];

          const isAllowed = allowedDates.some((d) => date.isSame(d, "day"));

          // disable everything except allowed
          return !isAllowed;
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
            disablePortal: false,
            sx: {
              zIndex: 999999999999999,
              "& .MuiYearCalendar-button": {
                fontSize: "13px !important", // desired font size
                fontFamily: "Poppins, sans-serif", // desired font family
              },
            },
          },
          actionBar: {
            actions: ["clear"], // ✅ add "clear" action
          },
          textField: {
            fullWidth: true,
            size: "small",
            required: required,
            error: error,
            disabled: disabled,
            helperText: error ? (
              <span
                style={{
                  position: "absolute",
                  bottom: "-18px", // adjust distance below the input
                  left: "0",
                  fontSize: errorFontSize ? errorFontSize : "11px",
                  color: "#d32f2f",
                }}
              >
                {label + error}
              </span>
            ) : null,
            onClick: () => setOpen(true),
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
              "& .Mui-disabled": {
                backgroundColor: "#f5f5f5", // change background
                color: "#888", // change text color
                WebkitTextFillColor: "#888", // needed for iOS/Chrome to change disabled text color
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
