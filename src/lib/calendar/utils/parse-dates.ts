import { TimeFormat } from "./time-format";

type ExtraOptions = { withDefaultTimeFormat?: boolean; selectedTimeFormat?: TimeFormat };

const timeOptions: Intl.DateTimeFormatOptions = {
  hour12: true,
  hourCycle: 'h12',
  hour: "numeric",
  minute: "numeric",
};

const dateOptions: Intl.DateTimeFormatOptions = {
  // weekday: "long",
  // year: "numeric",
  // month: "long",
  // day: "2-digit",
  dateStyle: 'long'
};

export const parseDateTimeWithTimeZone = (
  date: Date,
  timezone: string,
  options?: ExtraOptions
): string => {
  timeOptions.timeZone = timezone;
  dateOptions.timeZone = timezone;

  if (options?.withDefaultTimeFormat) {
    timeOptions.hourCycle = "h12";
  } else if (options?.selectedTimeFormat) {
    timeOptions.hourCycle = options.selectedTimeFormat === TimeFormat.TWELVE_HOUR ? "h12" : "h24";
    if (timeOptions.hourCycle === "h24") {
      delete timeOptions.hour12;
    }
  }
  const formattedDate = new Date(date).toLocaleDateString('en', dateOptions);
  const formattedTime = new Date(date)
    .toLocaleTimeString('en', timeOptions)
    .replace(" ", "")
    .toLowerCase();
  return `${formattedTime}, ${formattedDate}`;
};
