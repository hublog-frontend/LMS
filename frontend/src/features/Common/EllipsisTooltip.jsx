import React, { useRef, useState, useEffect } from "react";
import { Tooltip } from "antd";
import "./commonstyles.css";

const EllipsisTooltip = ({ text, smallText = false }) => {
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    // wait for Drawer open animation + layout settle
    const timer = setTimeout(() => {
      setIsTruncated(el.scrollWidth > el.offsetWidth);
    }, 300);

    return () => clearTimeout(timer);
  }, [text]);

  return (
    <>
      {isTruncated ? (
        <Tooltip
          title={text}
          placement="bottom"
          getPopupContainer={() => document.body}
          color="#fff"
          styles={{
            body: {
              backgroundColor: "#fff",
              color: "#333",
              fontWeight: 500,
              fontSize: "13px",
            },
          }}
        >
          <span
            ref={textRef}
            className={
              smallText == true
                ? "ellipsistooltip_smalltext"
                : "ellipsistooltip_text"
            }
            style={{ cursor: "pointer" }}
          >
            {text || "-"}
          </span>
        </Tooltip>
      ) : (
        <span
          ref={textRef}
          className={
            smallText == true
              ? "ellipsistooltip_smalltext"
              : "ellipsistooltip_text"
          }
        >
          {text || "-"}
        </span>
      )}
    </>
  );
};

export default EllipsisTooltip;
