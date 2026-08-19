import React from "react";
import { AlertTriangle, BarChart3, CheckCircle2, Copy, Fingerprint, ShieldCheck, Target } from "lucide-react";
import { AnalysisResponse } from "../types";

interface Props { response: AnalysisResponse; }

const riskTone: Record<string, string> = {
  "Baixo": "text-emerald-300 border-emerald-900/60 bg-emerald-950/30",
  "Médio": "text-yellow-300 border-yellow-900/60 bg-yellow-950/30",
  "Alto": "text-orange-300 border-orange-900/60 bg-orange-950/30",
  "Muito Alto": "text-red-300 border-red-900/60 bg-red-950/30",
};

export function SOCIntelPanel({ response }: Props) {
  const copyIOCs = async () => {
    const text = response.iocs?.map((ioc) => `${ioc.type}: ${ioc.value}`).join("\n") || "";
    if (text) await navigator.clipboard.writeText(text);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className={`rounded-2xl border p-5 ${riskTone[response.riskLevel] || riskTone["Médio"]}`}>
        <div className="flex items-center justify-between"><span className="text-xs font-mono uppercase tracking-wider opacity-80">Phishing Risk Score</span><BarChart3 className="w-5 h-5" /></div>
        <div className="mt-3 flex items-end gap-2"><span className="text-4xl font-black">{response.riskScore ?? "—"}</span><span className="mb-1 text-xs opacity-70">/ 100</span></div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30"><div className="h-full rounded-full bg-current transition-all" style={{ width: `${response.riskScore ?? 0}%` }} /></div>
        <p className="mt-3 text-xs opacity-80">{response.riskEmoji} {response.riskLevel} · confiança {response.confidence ?? "—"}%</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-white"><ShieldCheck className="w-5 h-5 text-cyan-400" /> Decisão SOC</div>
        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3"><div className="text-xs font-mono text-cyan-300">{response.recommendedAction || "REVISAR E ESCALAR SE NECESSÁRIO"}</div><p className="mt-2 text-xs leading-relaxed text-slate-400">{response.incidentType || "Classificação não informada"} · {response.attackObjective || "Objetivo não identificado"}</p></div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500"><CheckCircle2 className="w-3.5 h-3.5" /> Case {response.caseId || "—"}</div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-white"><Target className="w-5 h-5 text-violet-400" /> MITRE ATT&CK</div>
        <div className="mt-3 flex flex-wrap gap-2">{(response.mitre || []).length ? response.mitre!.map((item) => <span key={item.id} className="rounded-lg border border-violet-900/60 bg-violet-950/30 px-2.5 py-1 text-[11px] text-violet-200">{item.id} · {item.name}</span>) : <span className="text-xs text-slate-500">Nenhuma técnica mapeada com evidência suficiente.</span>}</div>
        <div className="mt-3 text-[11px] text-slate-500">Mapeamento de apoio à triagem, não prova isolada.</div>
      </div>

      <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-bold text-white"><Fingerprint className="w-5 h-5 text-cyan-400" /> Indicadores de Comprometimento (IOCs)</div>{!!response.iocs?.length && <button onClick={copyIOCs} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-[11px] text-slate-300 hover:bg-slate-800"><Copy className="w-3.5 h-3.5" /> Copiar</button>}</div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">{(response.iocs || []).length ? response.iocs!.map((ioc, index) => <div key={`${ioc.value}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">{ioc.type}</div><div className="mt-1 break-all font-mono text-xs text-cyan-200">{ioc.value}</div></div>) : <div className="text-xs text-slate-500">Nenhum IOC extraído do conteúdo fornecido.</div>}</div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-white"><AlertTriangle className="w-5 h-5 text-orange-400" /> Evidências principais</div>
        <div className="mt-3 space-y-2">{(response.evidence || []).slice(0, 5).map((item, index) => <div key={`${item.title}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-200"><span>{item.title}</span><span className="text-cyan-300">{item.confidence}%</span></div><p className="mt-1 text-[11px] leading-relaxed text-slate-500">{item.detail}</p></div>)}{!response.evidence?.length && <span className="text-xs text-slate-500">Nenhuma evidência estruturada disponível.</span>}</div>
      </div>
    </div>
  );
}
