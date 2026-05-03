export const logger = {
  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // Errors might be logged in production depending on the setup (e.g. Sentry)
    // For now, log them always
    console.error(...args);
  },
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(...args);
    }
  },
};
