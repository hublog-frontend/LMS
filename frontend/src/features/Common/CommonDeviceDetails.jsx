import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

export default function CommonDeviceDetails() {
  const [device, setDevice] = useState({});

  useEffect(() => {
    const parser = new UAParser();
    const uaResult = parser.getResult();

    const getPlatform = async () => {
      let platform = "Unknown";

      // ✅ Modern browsers (Chrome, Edge, Android)
      if (navigator.userAgentData?.getHighEntropyValues) {
        const data = await navigator.userAgentData.getHighEntropyValues([
          "platform",
          "platformVersion",
          "architecture",
          "model",
          "uaFullVersion",
        ]);
        platform = `${data.platform} ${data.platformVersion}`;
      } else {
        // ✅ Fallback (Firefox, Safari)
        platform = uaResult.os.name + " " + uaResult.os.version;
      }

      setDevice({
        browser: `${uaResult.browser.name || ""} ${
          uaResult.browser.version || ""
        }`,
        os: `${uaResult.os.name || ""} ${uaResult.os.version || ""}`,
        deviceType: uaResult.device.type || "desktop",
        deviceModel: uaResult.device.model || "PC",
        engine: uaResult.engine.name || "",
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        orientation: screen.orientation?.type || "",
        pixelRatio: window.devicePixelRatio,
        online: navigator.onLine,
        language: navigator.language,
        platform,
        userAgent: navigator.userAgent,
      });
    };

    getPlatform();

    window.addEventListener("resize", getPlatform);
    window.addEventListener("online", getPlatform);
    window.addEventListener("offline", getPlatform);

    return () => {
      window.removeEventListener("resize", getPlatform);
      window.removeEventListener("online", getPlatform);
      window.removeEventListener("offline", getPlatform);
    };
  }, []);

  return device;
}
