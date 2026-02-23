type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const shouldLog = () => {
  if (import.meta.env.MODE === 'test') {
    return false;
  }

  return import.meta.env.DEV;
};

const log = (level: LogLevel, message: string, ...meta: unknown[]) => {
  if (!shouldLog()) {
    return;
  }

  const timestamp = new Date().toISOString();

  if (level === 'debug') {
    console.debug(timestamp, level.toUpperCase(), message, ...meta);
    return;
  }

  if (level === 'info') {
    console.info(timestamp, level.toUpperCase(), message, ...meta);
    return;
  }

  if (level === 'warn') {
    console.warn(timestamp, level.toUpperCase(), message, ...meta);
    return;
  }

  console.error(timestamp, level.toUpperCase(), message, ...meta);
};

export const logger = {
  debug: (message: string, ...meta: unknown[]) => log('debug', message, ...meta),
  info: (message: string, ...meta: unknown[]) => log('info', message, ...meta),
  warn: (message: string, ...meta: unknown[]) => log('warn', message, ...meta),
  error: (message: string, ...meta: unknown[]) => log('error', message, ...meta),
};
