// utils/helpers.js
export const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    let timeString = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    if (remainingSeconds > 0) {
      timeString += ` and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
    }
    
    return timeString;
  };