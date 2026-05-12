import React, { useEffect } from 'react';
import { useVersionCheck } from '../../hooks/useVersionCheck';

/**
 * VersionCheckerAuto component
 * Automatically reloads the page when a new version is detected.
 */
const VersionCheckerAuto = () => {
  const { isNewVersionAvailable } = useVersionCheck(10000);

  useEffect(() => {
    if (isNewVersionAvailable) {
      console.log('New version detected! Automatically reloading...');
      // Small delay to ensure logs can be seen if needed, then reload
      setTimeout(() => {
        window.location.reload(true); // true forces reload from server
      }, 500);
    }
  }, [isNewVersionAvailable]);

  // This component doesn't render anything visible
  return null;
};

export default VersionCheckerAuto;
