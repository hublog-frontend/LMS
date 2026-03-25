import React from "react";
import { message } from "antd";

export const CommonMessage = (msg, content) => {
  if (msg === "success") {
    message.success(content, 2);
  } else if (msg === "error") {
    message.error(content, 2);
  } else {
    message.warning(content, 2);
  }
};
