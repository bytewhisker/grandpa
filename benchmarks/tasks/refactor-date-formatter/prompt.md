# Native Intl Date Formatter (Drop Moment/Dayjs)

Write an exported function `formatIsoDate(dateInput, locale = 'en-US')` that:
1. Accepts Date, timestamp number, or ISO string.
2. Uses native `Intl.DateTimeFormat` to format date as 'YYYY-MM-DD'.
3. Returns null for invalid date inputs.
