export function relativeTime(date: Date | string): string {
  const then = new Date(date).getTime();
  const seconds = Math.floor((Date.now() - then) / 1000);

  if (seconds < 60) return "just now";

  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "minute"],
    [3600, "hour"],
    [86400, "day"],
    [604800, "week"],
    [2592000, "month"],
    [31536000, "year"],
  ];

  let divisor = 1;
  let unit: Intl.RelativeTimeFormatUnit = "second";
  for (const [threshold, candidate] of units) {
    if (seconds < threshold) break;
    divisor = threshold;
    unit = candidate;
  }

  const value = Math.floor(seconds / divisor);
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    -value,
    unit,
  );
}
