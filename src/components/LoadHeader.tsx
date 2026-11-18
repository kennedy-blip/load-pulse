import { Activity, Zap, Trash2, ShieldCheck } from 'lucide-react';
type Props = { running: boolean; onFire: () => void; onClear: () => void };
export default function LoadHeader({ running, onFire, onClear }: Props) {
  return <header className="topbar"><div className="brand"><div className="brand-mark"><Activity size={21}/></div><div><div className="brand-name">load<span>pulse</span></div><div className="brand-sub">PERFORMANCE STUDIO <i>•</i> v1.0.0</div></div></div>
    <div className="engine"><span className="pulse-dot"/><span>LOAD DAEMON</span><b>READY</b><span className="engine-sep">/</span><span>MAX VU</span><b>500</b><span className="sim-tag"><ShieldCheck size={12}/> SIMULATION MODE</span></div>
    <div className="header-actions"><button className="btn ghost" onClick={onClear}><Trash2 size={15}/> Clear runs</button><button className="btn primary" onClick={onFire} disabled={running}><Zap size={15}/>{running ? 'Running…' : 'Fire benchmark'}</button></div>
  </header>;
}