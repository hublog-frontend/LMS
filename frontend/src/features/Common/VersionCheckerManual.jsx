import React from "react";
import { useVersionCheck } from "../../hooks/useVersionCheck";
import "./versionChecker.css";

/**
 * VersionCheckerManual component
 * Shows a premium notification when a new version is available.
 * User must click to reload.
 */
const VersionCheckerManual = () => {
  const { isNewVersionAvailable } = useVersionCheck(10000);

  if (!isNewVersionAvailable) return null;

  const handleRefresh = () => {
    window.location.reload(true);
  };

  return (
    <div className="version-update-toast">
      <div className="version-update-content">
        <div className="update-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </div>
        <div className="update-text">
          <p className="update-title">New Update Available</p>
          <p className="update-desc">
            A fresh update is ready with new features and fixes.
          </p>
        </div>
        <button className="update-refresh-btn" onClick={handleRefresh}>
          Refresh Now
        </button>
      </div>
    </div>
  );
};

export default VersionCheckerManual;
