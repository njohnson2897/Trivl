const CT_DATE_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Chicago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// A date as YYYY-MM-DD in Central Time, the app's daily reset timezone
export const toDateCT = (date = new Date()) => CT_DATE_FORMAT.format(date);