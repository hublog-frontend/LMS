import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Popover,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LuCalendarDays } from "react-icons/lu";
import dayjs from "dayjs";
import "./commonstyles.css";
import CommonMuiDatePicker from "./CommonMuiDatePicker";
import { CommonMessage } from "./CommonMessage";

export default function CommonMuiCustomDatePicker({
  onDateChange,
  value,
  isDashboard,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [option, setOption] = useState("last7days");
  const [startDate, setStartDate] = useState(dayjs().subtract(6, "day"));
  const [endDate, setEndDate] = useState(dayjs());

  // Sync with parent prop only when it changes
  useEffect(() => {
    if (value && value.length === 2) {
      const [start, end] = value;
      if (start) setStartDate(dayjs(start));
      if (end) setEndDate(dayjs(end));

      const today = dayjs();
      const startDay = start ? dayjs(start) : null;
      const endDay = end ? dayjs(end) : null;

      if (startDay && endDay) {
        if (startDay.isSame(today, "day") && endDay.isSame(today, "day")) {
          setOption("today");
        } else if (
          startDay.isSame(today.subtract(1, "day"), "day") &&
          endDay.isSame(today.subtract(1, "day"), "day")
        ) {
          setOption("yesterday");
        } else if (
          startDay.isSame(today.subtract(6, "day"), "day") &&
          endDay.isSame(today, "day")
        ) {
          setOption("last7days");
        } else if (
          startDay.isSame(today.subtract(14, "day"), "day") &&
          endDay.isSame(today, "day")
        ) {
          setOption("last15days");
        } else if (
          startDay.isSame(today.subtract(29, "day"), "day") &&
          endDay.isSame(today, "day")
        ) {
          setOption("last30days");
        } else if (
          startDay.isSame(today.subtract(59, "day"), "day") &&
          endDay.isSame(today, "day")
        ) {
          setOption("last60days");
        } else if (
          startDay.isSame(today.subtract(89, "day"), "day") &&
          endDay.isSame(today, "day")
        ) {
          setOption("last90days");
        } else {
          setOption("custom");
        }
      }
    }
  }, [value]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOptionChange = (event) => {
    const value = event.target.value;
    setOption(value);

    const today = dayjs();
    let newStart = startDate;
    let newEnd = endDate;

    switch (value) {
      case "today":
        newStart = today;
        newEnd = today;
        break;
      case "yesterday":
        newStart = today.subtract(1, "day");
        newEnd = today.subtract(1, "day");
        break;
      case "last7days":
        newStart = today.subtract(6, "day");
        newEnd = today;
        break;
      case "last15days":
        newStart = today.subtract(14, "day");
        newEnd = today;
        break;
      case "last30days":
        newStart = today.subtract(29, "day");
        newEnd = today;
        break;
      case "last60days":
        newStart = today.subtract(59, "day");
        newEnd = today;
        break;
      case "last90days":
        newStart = today.subtract(89, "day");
        newEnd = today;
        break;
      case "custom":
        // keep current start/end
        break;
      default:
        return;
    }

    if (value !== "custom") {
      setStartDate(newStart);
      setEndDate(newEnd);
      onDateChange?.([
        newStart ? newStart.format("YYYY-MM-DD") : null,
        newEnd ? newEnd.format("YYYY-MM-DD") : null,
      ]);
      handleClose();
    }
  };

  const open = Boolean(anchorEl);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ height: "100%" }}>
        {/* Button to open popover */}
        {isDashboard === true ? (
          <div
            className="dashboard_scorecard_dateiconContainer"
            onClick={handleOpen}
          >
            <LuCalendarDays size={18} />
            <p>Date Range</p>
          </div>
        ) : (
          <Button
            className="common_muicustomdatepicker_daterange_button"
            onClick={handleOpen}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span style={{ marginLeft: "4px" }}>
                {startDate ? startDate.format("YYYY-MM-DD") : ""}
              </span>
              <span>→</span>
              <span style={{ marginRight: "4px" }}>
                {endDate ? endDate.format("YYYY-MM-DD") : ""}
              </span>
            </Box>
          </Button>
        )}

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          slotProps={{
            paper: {
              sx: { marginTop: "2px" },
            },
          }}
          sx={{
            zIndex: 1300,
          }}
        >
          <Box sx={{ p: 2, width: 320 }}>
            {/* Quick Options */}
            <FormControl
              fullWidth
              size="small"
              className="common_selectfield"
              sx={{
                flex: 1,
                mb: 2,
                "& .MuiInputLabel-root": {
                  fontSize: "11px",
                  fontFamily: "Poppins,  sans-serif",
                },
                "& .MuiSelect-select": {
                  fontSize: "12px",
                  padding: "6px 10px",
                },
                "& .MuiOutlinedInput-root": {
                  height: "35px",
                },
                "& .Mui-disabled": {
                  backgroundColor: "#f5f5f5",
                  color: "#888",
                  WebkitTextFillColor: "#888",
                },
              }}
            >
              <Select value={option} onChange={handleOptionChange}>
                <MenuItem value="today" sx={{ fontSize: "12px" }}>
                  Today
                </MenuItem>
                <MenuItem value="yesterday" sx={{ fontSize: "12px" }}>
                  Yesterday
                </MenuItem>
                <MenuItem value="last7days" sx={{ fontSize: "12px" }}>
                  Last 7 Days
                </MenuItem>
                <MenuItem value="last15days" sx={{ fontSize: "12px" }}>
                  Last 15 Days
                </MenuItem>
                <MenuItem value="last30days" sx={{ fontSize: "12px" }}>
                  Last 30 Days
                </MenuItem>
                <MenuItem value="last60days" sx={{ fontSize: "12px" }}>
                  Last 60 Days
                </MenuItem>
                <MenuItem value="last90days" sx={{ fontSize: "12px" }}>
                  Last 90 Days
                </MenuItem>
                <MenuItem value="custom" sx={{ fontSize: "12px" }}>
                  Custom Range
                </MenuItem>
              </Select>
            </FormControl>

            {/* Custom Date Pickers */}
            {option === "custom" && (
              <Box sx={{ display: "flex", gap: 2 }}>
                <CommonMuiDatePicker
                  label="Start date"
                  value={startDate}
                  onChange={(value) => {
                    const newStart = value ? dayjs(value) : null;
                    setStartDate(newStart);

                    // If startDate is after endDate → reset endDate
                    let adjustedEnd = endDate;
                    if (
                      newStart &&
                      endDate &&
                      newStart.isAfter(endDate, "day")
                    ) {
                      adjustedEnd = newStart;
                      setEndDate(adjustedEnd);
                      CommonMessage(
                        "error",
                        "End date cannot be earlier than start date",
                      );
                    }

                    onDateChange?.([
                      newStart ? newStart.format("YYYY-MM-DD") : null,
                      adjustedEnd ? adjustedEnd.format("YYYY-MM-DD") : null,
                    ]);
                  }}
                  allowAllDates={true}
                />
                <CommonMuiDatePicker
                  label="End date"
                  value={endDate}
                  minDate={startDate} // 🔥 prevents selecting earlier than start
                  onChange={(value) => {
                    const newEnd = value ? dayjs(value) : null;

                    // Only allow if end >= start
                    if (
                      newEnd &&
                      startDate &&
                      newEnd.isBefore(startDate, "day")
                    ) {
                      CommonMessage(
                        "error",
                        "End date cannot be earlier than start date.",
                      );
                      return; // ignore invalid selection
                    }

                    setEndDate(newEnd);
                    onDateChange?.([
                      startDate ? startDate.format("YYYY-MM-DD") : null,
                      newEnd ? newEnd.format("YYYY-MM-DD") : null,
                    ]);
                    setTimeout(() => {
                      handleClose();
                    }, 300);
                  }}
                  allowAllDates={true}
                />
              </Box>
            )}
          </Box>
        </Popover>
      </Box>
    </LocalizationProvider>
  );
}
