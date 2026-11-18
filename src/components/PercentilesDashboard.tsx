import { Activity, Gauge, Clock3, AlertTriangle } from 'lucide-react';
import type { LoadRun } from '../types';
type Props = { run: LoadRun };
function Metric({ label, value, unit, tone, icon: Icon, foot }: {label:string;value:string|number;unit?:string;tone:string;icon:typeof Activity;foot:string}) {
  return <div className="metric-card"><div className="metric-top"><span>{label}</span><Icon size={16} className={tone}/></div><div className="metric-value">{value}<small>{unit}</small></div><div className="metric-foot">{foot}</div><div className={`metric-line ${tone}`}/></div>;
}
export default function PercentilesDashboard({run}:Props) {
  return <section className="analytics"><div className="section-heading"><div><div className="eyebrow">02 / LIVE TELEMETRY</div><h2>Performance overview</h2></div><span className="updated"><i/> LATEST RUN</span></div>
    <div className="metrics-grid"><Metric label="THROUGHPUT" value={run.rps.toLocaleString()} unit=" RPS" tone="cyan" icon={Gauge} foot="Requests per second"/><Metric label="P50 LATENCY" value={run.p50} unit=" ms" tone="violet" icon={Clock3} foot="Median response time"/><Metric label="P95 LATENCY" value={run.p95} unit=" ms" tone="amber" icon={Clock3} foot="95% of requests faster"/><Metric label="P99 LATENCY" value={run.p99} unit=" ms" tone="rose" icon={AlertTriangle} foot="Tail latency threshold"/></div>
    <div className="panel distribution"><div className="dist-title"><div><div className="eyebrow">RESPONSE HEALTH</div><h3>Success vs. errors</h3></div><div className="error-number">{run.errorRate.toFixed(2)}<small>% errors</small></div></div><div className="stacked-bar"><span style={{width:`${100-run.errorRate}%`}}/><i style={{width:`${run.errorRate}%`}}/></div><div className="bar-legend"><span><i className="green-dot"/> Success <b>{(100-run.errorRate).toFixed(2)}%</b></span><span><i className="rose-dot"/> Errors <b>{run.errorRate.toFixed(2)}%</b></span><span className="total-requests">{run.requestCount.toLocaleString()} total requests</span></div></div>
  </section>;
}