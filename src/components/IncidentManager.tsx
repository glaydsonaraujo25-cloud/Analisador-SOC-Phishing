import React, { useState } from "react";
import { Download, FileJson, FileText, Shield, X } from "lucide-react";
import { AnalysisHistoryItem, IncidentStatus } from "../types";

interface Props { item: AnalysisHistoryItem | null; onClose: () => void; onStatusChange: (status: IncidentStatus) => void; }
const statuses: IncidentStatus[] = ["Novo", "Em investigação", "Contido", "Encerrado"];

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

export function IncidentManager({ item, onClose, onStatusChange }: Props) {
  const [status, setStatus] = useState<IncidentStatus>(item?.status || "Novo");
  if (!item) return null;
  const update = (value: IncidentStatus) => { setStatus(value); onStatusChange(value); };
  const exportJSON = () => download(`${item.caseId || item.id}.json`, JSON.stringify(item, null, 2), "application/json");
  const exportCSV = () => {
    const rows = [["Case ID","Status","Risco","Score","Tipo","Objetivo","IOC Type","IOC Value"], ...(item.iocs?.length ? item.iocs.map(i => [item.caseId || item.id,status,item.riskLevel,String(item.riskScore ?? ""),item.incidentType || "",item.attackObjective || "",i.type,i.value]) : [[item.caseId || item.id,status,item.riskLevel,String(item.riskScore ?? ""),item.incidentType || "",item.attackObjective || "","",""]])];
    download(`${item.caseId || item.id}.csv`, rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n"), "text/csv;charset=utf-8");
  };
  const exportTXT = () => download(`${item.caseId || item.id}-relatorio.txt`, `RELATÓRIO SOC\n${"=".repeat(40)}\nCase: ${item.caseId || item.id}\nStatus: ${status}\nRisco: ${item.riskLevel} (${item.riskScore ?? "—"}/100)\nConfiança: ${item.confidence ?? "—"}%\nTipo: ${item.incidentType || "—"}\nObjetivo: ${item.attackObjective || "—"}\n\nEVIDÊNCIAS\n${item.evidence?.map(e => `- ${e.title}: ${e.detail} (${e.confidence}%)`).join("\n") || "Nenhuma"}\n\nIOCs\n${item.iocs?.map(i => `- ${i.type}: ${i.value}`).join("\n") || "Nenhum"}\n\nMITRE ATT&CK\n${item.mitre?.map(m => `- ${m.id}: ${m.name}`).join("\n") || "Nenhuma"}\n`, "text/plain;charset=utf-8");
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Shield className="h-5 w-5 text-cyan-400"/><div><h2 className="font-bold text-white">Incident Management</h2><p className="text-[11px] font-mono text-slate-500">{item.caseId || item.id}</p></div></div><button onClick={onClose} className="text-slate-500 hover:text-white"><X/></button></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-4">{statuses.map(s => <button key={s} onClick={() => update(s)} className={`rounded-xl border p-3 text-xs font-semibold ${status === s ? "border-cyan-500 bg-cyan-950/40 text-cyan-200" : "border-slate-800 bg-slate-900 text-slate-400"}`}>{s}</button>)}</div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-900 p-4"><div className="text-[10px] text-slate-500">SEVERIDADE</div><div className="mt-1 font-bold text-white">{item.riskLevel}</div></div><div className="rounded-xl bg-slate-900 p-4"><div className="text-[10px] text-slate-500">SCORE</div><div className="mt-1 font-bold text-white">{item.riskScore ?? "—"}/100</div></div><div className="rounded-xl bg-slate-900 p-4"><div className="text-[10px] text-slate-500">TIPO</div><div className="mt-1 font-bold text-white">{item.incidentType || "—"}</div></div></div>
    <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4"><h3 className="text-sm font-bold text-white">Timeline / evidências</h3><p className="mt-2 text-xs text-slate-400">Caso criado em {new Date(item.timestamp).toLocaleString("pt-BR")}. Status atual: {status}.</p><div className="mt-3 space-y-2">{item.evidence?.map((e,i)=><div key={i} className="rounded-lg bg-slate-950 p-3 text-xs"><b className="text-slate-200">{e.title}</b><span className="ml-2 text-cyan-300">{e.confidence}%</span><p className="mt-1 text-slate-500">{e.detail}</p></div>)}</div></div>
    <div className="mt-5 flex flex-wrap gap-2"><button onClick={exportJSON} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-900"><FileJson className="h-4 w-4"/> JSON</button><button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-900"><Download className="h-4 w-4"/> CSV / IOCs</button><button onClick={exportTXT} className="inline-flex items-center gap-2 rounded-xl border border-cyan-800 bg-cyan-950/30 px-3 py-2 text-xs text-cyan-300 hover:bg-cyan-900/40"><FileText className="h-4 w-4"/> Relatório TXT</button></div>
  </div></div>;
}
