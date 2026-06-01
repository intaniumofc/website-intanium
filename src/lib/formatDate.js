/**
 * Formats a date string into a user-friendly locale format.
 * @param {string|Date} dateVal 
 * @param {object} options custom Intl.DateTimeFormat options
 * @returns {string}
 */
export const formatDate = (dateVal, options = {}) => {
  if (!dateVal) return '';
  const dateObj = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };

  return new Intl.DateTimeFormat('id-ID', defaultOptions).format(dateObj);
};

/**
 * Formats a date string specifically for stream or event calendar times.
 * @param {string|Date} dateVal 
 * @returns {string} (e.g. "Senin, 12 Juni - 19:00 WIB")
 */
export const formatEventTime = (dateVal) => {
  if (!dateVal) return '';
  const dateObj = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
  
  if (isNaN(dateObj.getTime())) return '';

  const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(dateObj);
  const dateFormatted = formatDate(dateObj, { day: 'numeric', month: 'short' });
  const timeFormatted = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(dateObj);

  return `${dayName}, ${dateFormatted} - ${timeFormatted} WIB`;
};

/**
 * Checks if an event is currently active or upcoming.
 * @param {string|Date} dateVal 
 * @returns {'completed'|'live'|'upcoming'}
 */
export const getEventStatus = (dateVal) => {
  if (!dateVal) return 'completed';
  const eventTime = new Date(dateVal).getTime();
  const now = Date.now();
  
  // If event is within 2 hours of starting, consider it Live/Active
  const directDiff = eventTime - now;
  const twoHoursMs = 2 * 60 * 60 * 1000;

  if (directDiff > 0) {
    return 'upcoming';
  } else if (Math.abs(directDiff) <= twoHoursMs) {
    return 'live';
  } else {
    return 'completed';
  }
};
