// Logger utility for tracking API calls and data freshness

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: unknown;
  duration?: number;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private listeners: ((entry: LogEntry) => void)[] = [];

  private log(level: LogLevel, category: string, message: string, data?: unknown, duration?: number) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      data,
      duration,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with styling
    const color = {
      debug: '#888',
      info: '#4dabf7',
      warn: '#ffa726',
      error: '#ff5252',
    }[level];

    const prefix = `[${entry.timestamp.toISOString()}] [${category}]`;
    const durationStr = duration ? ` (${duration}ms)` : '';

    console.log(
      `%c${prefix}%c ${message}${durationStr}`,
      `color: ${color}; font-weight: bold`,
      'color: inherit',
      data !== undefined ? data : ''
    );

    // Notify listeners
    this.listeners.forEach(listener => listener(entry));
  }

  debug(category: string, message: string, data?: unknown) {
    this.log('debug', category, message, data);
  }

  info(category: string, message: string, data?: unknown, duration?: number) {
    this.log('info', category, message, data, duration);
  }

  warn(category: string, message: string, data?: unknown) {
    this.log('warn', category, message, data);
  }

  error(category: string, message: string, data?: unknown) {
    this.log('error', category, message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  subscribe(listener: (entry: LogEntry) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  clear() {
    this.logs = [];
  }
}

export const logger = new Logger();

// API call tracking
export interface ApiCallStats {
  endpoint: string;
  symbol: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'success' | 'error';
  dataAge?: number; // How old the data is (from timestamp field if available)
  error?: string;
}

class ApiTracker {
  private calls: Map<string, ApiCallStats> = new Map();
  private listeners: ((calls: ApiCallStats[]) => void)[] = [];

  startCall(endpoint: string, symbol: string): string {
    const id = `${endpoint}-${symbol}-${Date.now()}`;
    this.calls.set(id, {
      endpoint,
      symbol,
      startTime: Date.now(),
      status: 'pending',
    });
    this.notify();
    return id;
  }

  endCall(id: string, success: boolean, dataTimestamp?: number, error?: string) {
    const call = this.calls.get(id);
    if (call) {
      call.endTime = Date.now();
      call.duration = call.endTime - call.startTime;
      call.status = success ? 'success' : 'error';
      call.error = error;

      if (dataTimestamp) {
        // Calculate data age in seconds
        const dataTime = dataTimestamp * 1000; // Convert to ms if unix timestamp
        call.dataAge = Math.floor((Date.now() - dataTime) / 1000);
      }

      this.notify();
    }
  }

  getCalls(): ApiCallStats[] {
    return Array.from(this.calls.values()).slice(-20); // Last 20 calls
  }

  subscribe(listener: (calls: ApiCallStats[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const calls = this.getCalls();
    this.listeners.forEach(listener => listener(calls));
  }

  clear() {
    this.calls.clear();
    this.notify();
  }
}

export const apiTracker = new ApiTracker();
