export type LoadRun = {
  id: string; targetUrl: string; virtualUsers: number; requestCount: number; rampUpSec: number;
  rps: number; p50: number; p95: number; p99: number; errorRate: number;
  statusCodes: Record<string, number>; duration: number; createdAt: string; mode: 'simulation';
};