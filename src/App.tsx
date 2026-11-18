import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Cpu, Timer, ShieldCheck, RefreshCw } from 'lucide-react';
import LoadHeader from './components/LoadHeader';
import LoadTestConfig from './components/LoadTestConfig';
import PercentilesDashboard from './components/PercentilesDashboard';
import ResponseCodeMatrix from './components/ResponseCodeMatrix';
import type { LoadRun } from './types';

const fallback: LoadRun[] = [
  {id:'demo-a',targetUrl:'https://api.acme.dev/v1/orders',virtualUsers:120,requestCount:5000,rampUpSec:20,rps:842.6,p50:42,p95:118,p99:204,errorRate:0.42,statusCodes:{'200':4979,'429':15,'504':6},duration:5.93,createdAt:new Date().toISOString(),mode:'simulation'},
  {id:'demo-b',targetUrl:'https://edge.acme.dev/health',virtualUsers:64,requestCount:2400,rampUpSec:12,rps:612.4,p50:28,p95:76,p99:131,errorRate:0.08,statusCodes:{'200':2398,'429':2},duration:3.92,createdAt:new Date(Date.now()-3600000).toISOString(),mode:'simulation'}
];
export default function App() {
  const [runs,setRuns]=useState<LoadRun[]>(fallback);
  const [selected,setSelected]=useState<LoadRun>(fallback[0]);
  const [targetUrl,setTargetUrl]=useState('https://api.yourservice.dev/v1');
  const [users,setUsers]=useState(120);
  const [count,setCount]=useState(5000);
  const [ramp,setRamp]=useState(20);
  const [running,setRunning]=useState(false);
  const [message,setMessage]=useState('');
  const latest=useMemo(()=>selected,[selected]);
  useEffect(()=>{fetch('/api/load').then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(d.runs?.length){setRuns(d.runs);setSelected(d.runs[0]);}}).catch(()=>setMessage('Local preview mode · sample data loaded'));},[]);
  const run=useCallback(async()=>{
    setRunning(true);setMessage('');
    try {
      const response=await fetch('/api/load',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({targetUrl,virtualUsers:users,requestCount:count,rampUpSec:ramp})});
      if(!response.ok) throw new Error((await response.json()).error||'Unable to run simulation');
      const data=await response.json();setRuns(old=>[data.run,...old.filter(x=>x.id!==data.run.id)].slice(0,50));setSelected(data.run);setMessage(data.notice||'Simulation complete');
    } catch(e) {
      const seed=users*17+count*3+ramp*11;const jitter=(n:number)=>Math.abs(Math.sin(seed+n*91.7));
      const rps=Number((Math.min(1800,95+users*5.8)*(0.88+jitter(1)*0.24)).toFixed(1));const p50=Math.round(18+users*.22+jitter(2)*24);const p95=Math.round(p50*(2.1+jitter(3)*1.1));const p99=Math.round(p95*(1.35+jitter(4)*.65));const errorRate=Number((Math.max(0,(users-160)*.018+jitter(5)*.65)).toFixed(2));const errors=Math.round(count*errorRate/100);const run:LoadRun={id:`local-${Date.now()}`,targetUrl,virtualUsers:users,requestCount:count,rampUpSec:ramp,rps,p50,p95,p99,errorRate,statusCodes:{'200':count-errors,'429':Math.round(errors*.72),'504':errors-Math.round(errors*.72)},duration:Number((count/rps).toFixed(2)),createdAt:new Date().toISOString(),mode:'simulation'};setRuns(old=>[run,...old].slice(0,50));setSelected(run);setMessage('Local simulation complete · API unavailable');
    } finally {setRunning(false);}
  },[targetUrl,users,count,ramp]);
  const clear=()=>{setRuns([]);setMessage('Run history cleared');};
  const select=(r:LoadRun)=>{setSelected(r);setTargetUrl(r.targetUrl);setUsers(r.virtualUsers);setCount(r.requestCount);setRamp(r.rampUpSec);};
  return <div className="app-shell"><LoadHeader running={running} onFire={run} onClear={clear}/><main className="main-content"><div className="welcome-row"><div><div className="eyebrow">CONTROL CENTER <span className="live-chip"><i/> SYSTEM ONLINE</span></div><h1>Load testing <span>at a glance.</span></h1><p>Model concurrency. Inspect latency. Understand performance.</p></div><div className="date-chip"><Timer size={15}/>{new Date().toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'})}</div></div>
    <div className="summary-strip"><div><Activity/><span>ENGINE STATUS</span><b>Operational</b></div><div><Cpu/><span>VIRTUAL USERS</span><b>{users.toLocaleString()} <small>/ 500</small></b></div><div><RefreshCw/><span>REQUEST VOLUME</span><b>{count.toLocaleString()}</b></div><div><ShieldCheck/><span>EXECUTION MODE</span><b>Safe simulation</b></div></div>
    {message&&<div className="toast">{message}</div>}
    <div className="workspace"><LoadTestConfig targetUrl={targetUrl} setTargetUrl={setTargetUrl} users={users} setUsers={setUsers} count={count} setCount={setCount} ramp={ramp} setRamp={setRamp} onRun={run} running={running}/><div className="right-column"><PercentilesDashboard run={latest}/><ResponseCodeMatrix runs={runs.length?runs:[latest]} onSelect={select}/></div></div>
    <footer><span>© 2026 LOADPULSE <i>·</i> BUILT FOR PERFORMANCE ENGINEERS</span><span><ShieldCheck size={13}/> SIMULATION ONLY <i>·</i> NO OUTBOUND REQUESTS</span></footer>
  </main></div>;
}