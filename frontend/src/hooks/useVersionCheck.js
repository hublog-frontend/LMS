import { useState, useEffect } from "react";

/**
 * Custom hook to detect frontend version changes
 * @param {number} interval - Polling interval in milliseconds (default 10s)
 * @returns {object} { version, latestVersion, isNewVersionAvailable }
 */
export const useVersionCheck = (interval = 10000) => {
  const [currentVersion, setCurrentVersion] = useState(null);
  const [latestVersion, setLatestVersion] = useState(null);
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState(false);

  const fetchVersion = async () => {
    try {
      // Fetch version.json with cache busting
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch version.json");
      }

      const data = await response.json();
      const newVersion = data.version;

      if (!currentVersion) {
        // Initial set on mount
        setCurrentVersion(newVersion);
        setLatestVersion(newVersion);
      } else if (newVersion !== currentVersion) {
        // Version changed
        setLatestVersion(newVersion);
        setIsNewVersionAvailable(true);
      }
    } catch (error) {
      console.error("Error checking version:", error);
    }
  };

  useEffect(() => {
    // Check on startup
    fetchVersion();

    // Set up polling interval
    const timer = setInterval(() => {
      fetchVersion();
    }, interval);

    // Cleanup on unmount
    return () => clearInterval(timer);
  }, [currentVersion, interval]);

  return { currentVersion, latestVersion, isNewVersionAvailable };
};
