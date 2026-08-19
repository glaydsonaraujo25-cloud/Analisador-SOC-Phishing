import React from "react";
import { Activity, AlertOctagon, BarChart3, ShieldCheck, Target, Trophy } from "lucide-react";
import { AnalysisHistoryItem } from "../types";

interface Props { history: AnalysisHistoryItem[]; onTraining?: () => void; }
export function SOCDashboard({ history, onTraining }: Props) {
  const total = history.length;
  const high = history.filter(h => h.riskLevel === "Alto" || h.riskLevel === "Muito Alto").length;
  const phishing = history.filter(h => /phishing/i.test(h.incidentType || "")).length;
  const avg = total ? Math.round(history.reduce((s, h) => s + (h.riskScore || 0), 0) / total) : 0;
  const cards = [[Activity, "Casos analisados", total, "text-cyan-300"], [AlertOctagon, "Alto risco", high, "text-red-300"], [Target, "Phishing", phishing, "text-orange-300"], [BarChart3, "Score médio", avg, "text-violet-300"]] as const;
  return <section className="space-y-4">
    <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-white">SOC Dashboard</h2><p className="text-xs text-slate-500">Visão local dos casos analisados neste navegador.</p></div>{onTraining && <button onClick={onTraining} className="inline-flex items-center gap-2 rounded-xl border border-cyan-800 bg-cyan-950/40 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/50"><Trophy className="w-4 h-4" /> Modo treinamento</button>}</div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(([Icon, label, value, tone]) => <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><Icon className={`h-5 w-5 ${tone}`} /><div className="mt-3 text-2xl font-black text-white">{value}</div><div className="text-[11px] text-slate-500">{label}</div></div>)}</div>
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Distribuição de risco</div><div className="space-y-2">{(["Baixo", "Médio", "Alto", "Muito Alto"] as const).map(level => { const n = history.filter(h => h.riskLevel === level).length; const pct = total ? Math.round(n / total * 100) : 0; return <div key={level} className="grid grid-cols-[80px_1fr_35px] items-center gap-2 text-[11px] text-slate-400"><span>{level}</span><div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-500/70" style={{width:`${pct}%`}} /></div><span className="text-right">{pct}%</span></div>})}</div></div>
  </section>;
}
