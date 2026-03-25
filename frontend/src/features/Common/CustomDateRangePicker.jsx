import React, { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import { addDays, startOfMonth, endOfMonth } from "date-fns";
import { Select } from "antd";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./commonstyles.css";

const { Option } = Select;

const CustomDateRangePicker = ({
  ranges,
  onChange,
  openState,
  onChangeSelect,
  selectValue,
}) => {
  const [tempRange, setTempRange] = useState(ranges);
  const [tempSelect, setTempSelect] = useState(selectValue);

  useEffect(() => {
    setTempRange(ranges);
    setTempSelect(selectValue);
  }, [ranges, selectValue]);

  const handleCalendarChange = (item) => {
    setTempRange([
      {
        ...item.selection,
        color: "#1890ff",
      },
    ]);
    setTempSelect("Custom Range");
  };

  const handleSelectChange = (value) => {
    setTempSelect(value);

    let start, end;

    if (value === "Last 7 Days") {
      start = addDays(new Date(), -6);
      end = new Date();
    } else if (value === "This Month") {
      start = startOfMonth(new Date());
      end = endOfMonth(new Date());
    } else {
      return;
    }

    const newRange = [
      {
        startDate: start,
        endDate: end,
        key: "selection",
        color: "#1890ff",
      },
    ];

    setTempRange(newRange);
  };

  const handleApply = () => {
    onChange({ selection: tempRange[0] });
    onChangeSelect(tempSelect);
    openState(false);
  };

  const handleReset = () => {
    const defaultRange = [
      {
        startDate: addDays(new Date(), -6),
        endDate: new Date(),
        key: "selection",
        color: "#1890ff",
      },
    ];
    setTempRange(defaultRange);
    setTempSelect("Last 7 Days");
    onChange({ selection: defaultRange[0] });
    onChangeSelect("Last 7 Days");
    openState(false);
  };

  return (
    <div
      className="commondaterangepicker_maincontainer"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Select
        onChange={handleSelectChange}
        className="daterangepicker_select"
        style={{ height: 28, fontSize: "12px" }}
        value={tempSelect}
      >
        <Option value="Custom Range">Custom Range</Option>
        <Option value="Last 7 Days">Last 7 Days</Option>
        <Option value="This Month">This Month</Option>
      </Select>

      <DateRange
        className="custom-daterange"
        editableDateInputs={false}
        onChange={handleCalendarChange}
        moveRangeOnFirstSelection={false}
        ranges={tempRange}
      />

      <div className="common_rangepicker_footer">
        <button
          className="common_rangepicker_resetbutton"
          onClick={handleReset}
        >
          Reset
        </button>
        <button
          className="common_rangepicker_applybutton"
          onClick={handleApply}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default CustomDateRangePicker;
