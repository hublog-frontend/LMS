import React from "react";
import "react-international-phone/style.css";
import "./commonstyles.css";
import {
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from "react-international-phone";

export default function PhoneWithCountry({
  onChange,
  value, // raw number from parent
  label,
  error,
  labelFontSize,
  height,
  borderLeftNone,
  countryCode,
  onCountryChange,
  selectedCountry,
  disabled = false,
  disableCountrySelect = false,
  errorFontSize,
  ...restProps
}) {
  const [internalValue, setInternalValue] = React.useState("");

  const { inputRef, country, setCountry } = usePhoneInput({
    defaultCountry: selectedCountry || "in",
    countries: defaultCountries,
  });

  const prevDialCodeRef = React.useRef(country.dialCode);
  const typingRef = React.useRef(false);

  // Call countryCode initially
  React.useEffect(() => {
    if (countryCode) {
      countryCode(country.dialCode);
    }
  }, [country.dialCode, countryCode]);

  // Sync internal value when parent value changes
  React.useEffect(() => {
    if (!typingRef.current && value !== undefined) {
      const newValue = `+${country.dialCode} ${value || ""}`;
      if (newValue !== internalValue) {
        setInternalValue(newValue);
      }
      prevDialCodeRef.current = country.dialCode;
    }
  }, [value, country.dialCode]);

  // Sync selectedCountry prop with internal state
  React.useEffect(() => {
    if (selectedCountry && selectedCountry !== country.iso2) {
      setCountry(selectedCountry);
    }
  }, [selectedCountry, country.iso2, setCountry]);

  const handleInputChange = (e) => {
    typingRef.current = true;

    const dialCode = `+${country.dialCode} `;
    let userInput = e.target.value;

    // If user deletes everything, ensure we keep only dial code
    if (userInput.length <= dialCode.length) {
      setInternalValue(dialCode);
      onChange?.("");
      setTimeout(() => (typingRef.current = false), 0);
      return;
    }

    // Extract after code part
    let afterCode = userInput.slice(dialCode.length).replace(/\D/g, "");

    // ❌ Prevent number starting with 0
    if (afterCode.length === 1 && afterCode.startsWith("0")) {
      // Don't update value if first number is 0
      setInternalValue(dialCode);
      e.target.value = dialCode;
      onChange?.("");
      setTimeout(() => (typingRef.current = false), 0);
      return;
    }

    // ✅ If it already starts with the dial code, just clean after part
    if (userInput.startsWith(dialCode)) {
      setInternalValue(dialCode + afterCode);
      e.target.value = dialCode + afterCode;
      onChange?.(afterCode);
    } else {
      // If user tries to delete dial code, re-add it only once
      const onlyDigits = userInput.replace(/\D/g, "");
      setInternalValue(dialCode + onlyDigits);
      e.target.value = dialCode + onlyDigits;
      onChange?.(onlyDigits);
    }

    setTimeout(() => {
      typingRef.current = false;
    }, 0);
  };

  // Handle country change
  const handleCountryChange = (e) => {
    const newCountryIso2 = e.target.value;
    setCountry(newCountryIso2);
    onCountryChange?.(newCountryIso2);

    const countryObj = defaultCountries.find(
      (c) => parseCountry(c).iso2 === newCountryIso2
    );
    if (!countryObj) return;

    const newDialCode = parseCountry(countryObj).dialCode;
    const rawNumber = internalValue.replace(`+${prevDialCodeRef.current} `, "");
    const newInternalValue = `+${newDialCode} ${rawNumber || ""}`;
    setInternalValue(newInternalValue);

    prevDialCodeRef.current = newDialCode;
    onChange?.(rawNumber || "");
    countryCode?.(newDialCode);
  };

  return (
    <FormControl
      sx={{
        "& .Mui-disabled": {
          backgroundColor: "#f5f5f5", // change background
          color: "#888", // change text color
          WebkitTextFillColor: "#888", // needed for iOS/Chrome to change disabled text color
        },
      }}
    >
      <TextField
        variant="outlined"
        label={label}
        required
        value={internalValue}
        onChange={handleInputChange}
        type="tel"
        inputRef={inputRef}
        className="common_inputfield"
        error={!!error}
        disabled={disabled}
        helperText={
          error && (
            <span style={{ fontSize: errorFontSize || "11px" }}>
              {label !== "Paid Now" && label}
              {error}
            </span>
          )
        }
        sx={{
          width: "100%",
          "& .MuiInputLabel-root": { fontSize: labelFontSize || "14px" },
          "& .MuiInputBase-root.MuiOutlinedInput-root": {
            borderLeft: "0px",
            borderTopLeftRadius: borderLeftNone ? "0px" : "4px",
            borderBottomLeftRadius: borderLeftNone ? "0px" : "4px",
          },
          "& fieldset": { borderLeft: borderLeftNone ? "0px" : "" },
          "& .MuiInputBase-input": {
            height: height || "42px",
            boxSizing: "border-box",
            fontSize: "14px",
          },
        }}
        slotProps={{
          htmlInput: { maxLength: 17 },
          input: {
            startAdornment: (
              <InputAdornment
                position="start"
                style={{ marginRight: "-10px", marginLeft: "-8px" }}
              >
                <Select
                  disabled={disableCountrySelect}
                  MenuProps={{
                    style: {
                      height: "300px",
                      width: "360px",
                      top: "10px",
                      left: "-34px",
                    },
                    transformOrigin: { vertical: "top", horizontal: "left" },
                  }}
                  sx={{
                    width: "max-content",
                    fieldset: { display: "none" },
                    ".MuiSelect-select": {
                      padding: "8px 0px 8px 8px",
                    },
                  }}
                  value={country.iso2}
                  onChange={handleCountryChange}
                  renderValue={(v) => (
                    <FlagImage iso2={v} style={{ display: "flex" }} />
                  )}
                >
                  {defaultCountries.map((c) => {
                    const countryItem = parseCountry(c);
                    return (
                      <MenuItem key={countryItem.iso2} value={countryItem.iso2}>
                        <FlagImage
                          iso2={countryItem.iso2}
                          style={{ marginRight: "8px" }}
                        />
                        <Typography
                          marginRight="8px"
                          sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "13px",
                          }}
                        >
                          {countryItem.name}
                        </Typography>
                        <Typography
                          color="gray"
                          sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "13px",
                          }}
                        >
                          +({countryItem.dialCode})
                        </Typography>
                      </MenuItem>
                    );
                  })}
                </Select>
              </InputAdornment>
            ),
          },
        }}
        {...restProps}
      />
    </FormControl>
  );
}
