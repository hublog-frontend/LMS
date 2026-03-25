import * as React from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import moment from "moment";

export default function CommonMuiMonthPicker({
  label,
  required,
  onChange,
  value,
  error,
  errorFontSize,
  disabled,
  labelMarginTop,
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        views={["month", "year"]}
        value={value ? dayjs(value) : null}
        onChange={(newValue) => {
          if (newValue) {
            const formatted = moment(newValue.toDate()).format("MMMM - YYYY");
            onChange(formatted);
          } else {
            onChange(null);
          }
        }}
        open={!disabled && open}
        onClose={() => setOpen(false)}
        onOpen={() => {
          if (!disabled) {
            setOpen(true);
          }
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
              "& .MuiMonthCalendar-button": {
                fontSize: "13px !important",
                fontFamily: "Poppins, sans-serif",
                padding: "4px 6px",
              },
              "& .MuiMonthCalendar-button.Mui-selected": {
                backgroundColor: "#2160ad !important",
                color: "#fff !important",
              },
              "& .MuiYearCalendar-button": {
                fontSize: "13px !important",
                fontFamily: "Poppins, sans-serif",
              },
              "& .MuiYearCalendar-button.Mui-selected": {
                backgroundColor: "#2160ad !important",
                color: "#fff !important",
              },
            },
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
                height: "40px !important",
                fontFamily: "Poppins, sans-serif !important",
              },
              "& .MuiInputLabel-root": {
                fontFamily: "Poppins, sans-serif",
                fontSize: "13px",
                marginTop: labelMarginTop ? labelMarginTop : "3px",
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
