import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { MessageForm } from "./components/MessageForm";
import { AnalysisResult } from "./components/AnalysisResult";
import { SOCIntelPanel } from "./components/SOCIntelPanel";
import { SOCDashboard } from "./components/SOCDashboard";
import { SOCTrainingModal } from "./components/SOCTrainingModal";
import { IncidentManager } from "./components/IncidentManager";
import { ThreatIntelPanel } from "./components/ThreatIntelPanel";
import { SOCPlaybookModal } from "./components/SOCPlaybookModal";
import { URLInspectorModal } from "./components/URLInspectorModal";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { AnalysisRequest, AnalysisResponse, AnalysisHistoryItem, MessageType, ExtractedURL, IncidentStatus } from "./types";
import { extractAndAnalyzeURLs } from "./utils/urlAnalyzer";
import { ShieldAlert, AlertTriangle, Terminal, CheckCircle2, Lock, Search, FileCheck2, FolderOpen } from "lucide-react";

const HISTORY_KEY = "soc_phishing_history";

function parseStoredHistory(value: string | null): AnalysisHistoryItem[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is AnalysisHistoryItem =>
          !!item && typeof item === "object" && typeof (item as AnalysisHistoryItem).id === "string"
        )
      : [];
  } catch {
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
    return [];
  }
}

function getErrorMessage(error: unknown, fallback = "Erro desconhecido na análise."): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object") {
    const value = error as Record<string, unknown>;
    for (const candidate of [value.message, value.error, value.details, value.statusText]) {
      if (typeof candidate === "string" && candidate.trim()) return candidate;
      if (candidate && typeof candidate === "object" && typeof (candidate as Record<string, unknown>).message === "string") {
        return String((candidate as Record<string, unknown>).message);
      }
    }
    try {
      const serialized = JSON.stringify(error);
      if (serialized && serialized !== "{}") return serialized;
    } catch {}
  }
  return fallback;
}

async function parseApiResponse(response: Response): Promise<any> {
  const raw = await response.text();
  if (!raw.trim()) {
    throw new Error(`O servidor retornou uma resposta vazia (HTTP ${response.status}).`);
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Resposta inválida da API (HTTP ${response.status}).`);
  }
}

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentType, setCurrentType] = useState<MessageType>("E-mail");
  const [senderInfo, setSenderInfo] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isPlaybookOpen, setIsPlaybookOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [isIncidentOpen, setIsIncidentOpen] = useState(false);
  const [incidentItem, setIncidentItem] = useState<AnalysisHistoryItem | null>(null);
  const [isUrlInspectorOpen, setIsUrlInspectorOpen] = useState(false);
  const [extractedUrls, setExtractedUrls] = useState<ExtractedURL[]>([]);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);

  useEffect(() => {
    setHistory(parseStoredHistory(localStorage.getItem(HISTORY_KEY)));
  }, []);

  const saveToHistory = (item: AnalysisHistoryItem) => {
    const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 30);
    setHistory(updated);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}
  };

  const updateIncidentStatus = (status: IncidentStatus) => {
    if (!incidentItem) return;
    const updated = { ...incidentItem, status };
    setIncidentItem(updated);
    setAnalysisResult((current) => current?.caseId === updated.caseId ? updated : current);
    setHistory((previous) => {
      const next = previous.map((item) => item.id === updated.id ? updated : item);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
  };

  const handleInspectUrls = (text: string) => {
    setExtractedUrls(extractAndAnalyzeURLs(text));
    setIsUrlInspectorOpen(true);
  };

  const openIncident = (item: AnalysisHistoryItem) => {
    setIncidentItem(item);
    setIsIncidentOpen(true);
  };

  const handleAnalyze = async (req: AnalysisRequest) => {
    setIsLoading(true);
    setError(null);
    setCurrentMessage(req.message);
    setCurrentType(req.type);
    setSenderInfo(req.senderInfo || "");
    setExtractedUrls(extractAndAnalyzeURLs(req.message));

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(req),
      });
      const data = await parseApiResponse(response);
      if (!response.ok) throw new Error(getErrorMessage(data, `O servidor retornou HTTP ${response.status}.`));
      if (data?.error) throw new Error(getErrorMessage(data.error, "A API retornou um erro durante a análise."));
      if (!data || typeof data !== "object") throw new Error("A API retornou um formato inválido.");

      const result: AnalysisResponse = {
        ...data,
        status: data.status || "Novo",
        timestamp: data.timestamp || new Date().toISOString(),
      };
      setAnalysisResult(result);
      saveToHistory({
        ...result,
        id: data.caseId || `analysis-${Date.now()}`,
        messageSnippet: req.message.length > 80 ? req.message.slice(0, 80) + "..." : req.message || "[Imagem/Anexo]",
        messageType: req.type,
        senderInfo: req.senderInfo,
        hasImage: !!req.imageBase64,
      });
      setTimeout(() => document.getElementById("analysis-result-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      console.error("Falha ao realizar análise:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: AnalysisHistoryItem) => {
    setCurrentMessage(item.messageSnippet);
    setCurrentType(item.messageType);
    setSenderInfo(item.senderInfo || "");
    setAnalysisResult(item);
    setExtractedUrls(extractAndAnalyzeURLs(item.messageSnippet));
    setTimeout(() => document.getElementById("analysis-result-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Header onOpenPlaybook={() => setIsPlaybookOpen(true)} onOpenHistory={() => setIsHistoryOpen(true)} historyCount={history.length} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-2xl overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono"><Terminal className="w-3.5 h-3.5 text-cyan-400"/><span>Triagem SOC · Engenharia Social</span></div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Investigação de <span className="text-cyan-400">Phishing & Smishing</span></h1>
            <p className="text-xs sm:text-sm text-slate-300">Analise mensagens e capturas suspeitas com classificação de risco, evidências, IOCs, MITRE ATT&CK e recomendação de resposta.</p>
            <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400"><span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400"/>Risk Score + Evidências</span><span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-cyan-400"/>Triagem defensiva</span><span className="flex items-center gap-1.5"><Search className="w-4 h-4 text-blue-400"/>URL & OCR</span></div>
          </div>
        </section>

        <SOCDashboard history={history} onTraining={() => setIsTrainingOpen(true)} />

        {history.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white"><FolderOpen className="h-4 w-4 text-cyan-400"/>Gerenciamento de incidentes</div>
            <div className="mt-3 grid gap-2">
              {history.slice(0, 5).map((item) => (
                <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><div className="font-mono text-xs text-cyan-300">{item.caseId || item.id}</div><div className="mt-1 text-xs text-slate-400">{item.incidentType || "Incidente"} · {item.riskLevel} · status: {item.status || "Novo"}</div></div>
                  <button onClick={() => openIncident(item)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800">Abrir caso</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <MessageForm onSubmit={handleAnalyze} isLoading={isLoading} onInspectUrls={handleInspectUrls} />

        {error && <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-red-400 shrink-0"/><div className="text-xs"><strong className="font-semibold block text-red-300">Falha ao realizar análise:</strong><p className="break-words">{error}</p></div></div>}

        {analysisResult && (
          <section id="analysis-result-section" className="space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-base font-bold text-white flex items-center gap-2"><FileCheck2 className="w-5 h-5 text-cyan-400"/>Laudo Técnico SOC</h2>{extractedUrls.length > 0 && <button onClick={() => setIsUrlInspectorOpen(true)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5"><Search className="w-3.5 h-3.5"/>Inspecionar {extractedUrls.length} URL(s)</button>}</div>
            <SOCIntelPanel response={analysisResult}/>
            <ThreatIntelPanel iocs={analysisResult.iocs}/>
            <AnalysisResult response={analysisResult} originalMessage={currentMessage} originalType={currentType} senderInfo={senderInfo}/>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-6 mt-12 text-center text-xs text-slate-500"><div className="max-w-7xl mx-auto px-4 flex items-center justify-between"><div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-cyan-500"/><span className="font-semibold text-slate-400">Analisador SOC Phishing</span> — Resposta a Incidentes</div><span>Fins educativos e preventivos · Gemini AI</span></div></footer>
      {isIncidentOpen && <IncidentManager item={incidentItem} onClose={() => setIsIncidentOpen(false)} onStatusChange={updateIncidentStatus}/>}<SOCTrainingModal isOpen={isTrainingOpen} onClose={() => setIsTrainingOpen(false)}/><SOCPlaybookModal isOpen={isPlaybookOpen} onClose={() => setIsPlaybookOpen(false)}/><URLInspectorModal isOpen={isUrlInspectorOpen} onClose={() => setIsUrlInspectorOpen(false)} urls={extractedUrls}/><HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={history} onSelectHistoryItem={handleSelectHistoryItem} onClearHistory={handleClearHistory}/>
    </div>
  );
}
