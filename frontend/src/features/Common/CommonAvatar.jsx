import React from "react";
import { Avatar } from "antd";

export default function CommonAvatar({ itemName, avatarSize, avatarfontSize }) {
  const getInitials = (fullName) => {
    const nameArray = fullName.split(" ");
    if (nameArray.length >= 2) {
      const firstLetter = nameArray[0].charAt(0);
      const secondLetter = nameArray[1].charAt(0);
      return `${firstLetter}${secondLetter}`;
    } else {
      return fullName.charAt(0); // Use the first letter if no space is found
    }
  };

  const getColorForName = (name) => {
    // You can implement your own logic here to generate colors based on the name.
    // For simplicity, we'll use a random color for demonstration purposes.
    const colors = [
      "#DBA6D1",
      "#A6DBC1",
      "#A6AADB",
      "#D6DBA6",
      "#8ED1FC",
      "#EEB39C",
      "#CDB2FD",
      "#DBA6AA",
      "#B0DBA6",
      "#DBCCA6",
      "#D7DBA6",
      "#AADBA6",
      "#AFECE7",
      "#E6B4A4",
      "#E0A1B1",
      "#B8D5E2",
    ];
    const nameHash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[nameHash % colors.length];
  };
  const avatarbackgroundColor = getColorForName(itemName ? itemName : "N");

  // Function to calculate a contrasting text color
  const getVeryDarkTextColor = (backgroundColor) => {
    // You can adjust the subtraction value to make the text color darker or lighter.
    const subtractionValue = 120; // Adjust as needed
    const HEX_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    const match = backgroundColor.match(HEX_REGEX);
    if (match) {
      const r = Math.max(0, parseInt(match[1], 16) - subtractionValue); //increase color of background color
      const g = Math.max(0, parseInt(match[2], 16) - subtractionValue);
      const b = Math.max(0, parseInt(match[3], 16) - subtractionValue);
      return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
    }
    return backgroundColor;
  };
  const avatarTextColor = getVeryDarkTextColor(avatarbackgroundColor);
  return (
    <div>
      <Avatar
        size={avatarSize ? avatarSize : 34}
        className="temmember_nameavatar"
        style={{
          backgroundColor: avatarbackgroundColor,
          marginRight: "12px",
          color: avatarTextColor,
          fontWeight: "600",
          fontSize: avatarfontSize ? avatarfontSize : "15px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {getInitials(itemName ? itemName : "N")}
      </Avatar>
    </div>
  );
}
