import type { VercelRequest, VercelResponse } from '@vercel/node';

type Run = {
  id: string; targetUrl: string; virtualUsers: number; requestCount: number; rampUpSec: number;
  rps: number; p50: number; p95: number; p99: number; errorRate: number;
  statusCodes: Record<string, number>; duration: number; createdAt: string; mode: 'simulation';
};

const history: Run[] = [
  { id: 'run-seed-01', targetUrl: 'https://api.acme.dev/v1/orders', virtualUsers: 120, requestCount: 5000, rampUpSec: 20, rps: 842.6, p50: 42, p95: 118, p99: 204, errorRate: 0.42, statusCodes: { '200': 4979, '429': 15, '504': 6 }, duration: 5.93, createdAt: new Date(Date.now() - 3600000).toISOString(), mode: 'simulation' },
  { id: 'run-seed-02', targetUrl: 'https://edge.acme.dev/health', virtualUsers: 64, requestCount: 2400, rampUpSec: 12, rps: 612.4, p50: 28, p95: 76, p99: 131, errorRate: 0.08, statusCodes: { '200': 2398, '429': 2 }, duration: 3.92, createdAt: new Date(Date.now() - 7200000).toISOString(), mode: 'simulation' },
  { id: 'run-seed-03', targetUrl: 'https://api.acme.dev/v2/search', virtualUsers: 250, requestCount: 10000, rampUpSec: 30, rps: 1034.2, p50: 68, p95: 242, p99: 410, errorRate: 2.16, statusCodes: { '200': 9784, '429': 164, '504': 52 }, duration: 9.67, createdAt: new Date(Date.now() - 86400000).toISOString(), mode: 'simulation' }
];

function json(res: VercelResponse, status: number, body: unknown) {
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return json(res, 200, { runs: history.slice(0, 50), mode: 'simulation' });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body ?? {});
  const targetUrl = String(body.targetUrl ?? '').trim();
  const virtualUsers = Number(body.virtualUsers);
  const requestCount = Number(body.requestCount);
  const rampUpSec = Number(body.rampUpSec);

  if (!targetUrl || targetUrl.length > 2048) return json(res, 400, { error: 'Enter a target label or URL (max 2048 characters).' });
  if (!Number.isInteger(virtualUsers) || virtualUsers < 1 || virtualUsers > 500) return json(res, 400, { error: 'Virtual users must be between 1 and 500.' });
  if (!Number.isInteger(requestCount) || requestCount < 100 || requestCount > 100000) return json(res, 400, { error: 'Request count must be between 100 and 100,000.' });
  if (!Number.isFinite(rampUpSec) || rampUpSec < 1 || rampUpSec > 600) return json(res, 400, { error: 'Ramp-up must be between 1 and 600 seconds.' });

  // Intentionally synthetic: no outbound network requests are made to targetUrl.
  const seed = virtualUsers * 17 + requestCount * 3 + rampUpSec * 11;
  const jitter = (n: number) => Math.abs(Math.sin(seed + n * 91.7));
  const rps = Number((Math.min(1800, 95 + virtualUsers * 5.8) * (0.88 + jitter(1) * 0.24)).toFixed(1));
  const p50 = Math.round(18 + virtualUsers * 0.22 + jitter(2) * 24);
  const p95 = Math.round(p50 * (2.1 + jitter(3) * 1.1));
  const p99 = Math.round(p95 * (1.35 + jitter(4) * 0.65));
  const errorRate = Number((Math.max(0, (virtualUsers - 160) * 0.018 + jitter(5) * 0.65)).toFixed(2));
  const errors = Math.round(requestCount * errorRate / 100);
  const throttled = Math.round(errors * 0.72);
  const timedOut = errors - throttled;
  const run: Run = {
    id: `lp-${Date.now().toString(36)}`, targetUrl, virtualUsers, requestCount, rampUpSec, rps, p50, p95, p99,
    errorRate, statusCodes: { '200': requestCount - errors, '429': throttled, '504': timedOut },
    duration: Number((requestCount / rps).toFixed(2)), createdAt: new Date().toISOString(), mode: 'simulation'
  };
  history.unshift(run);
  history.splice(50);
  return json(res, 200, { run, mode: 'simulation', notice: 'Synthetic benchmark completed. No network traffic was sent to the target.' });
}