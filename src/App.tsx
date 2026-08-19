import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { MessageForm } from "./components/MessageForm";
import { AnalysisResult } from "./components/AnalysisResult";
import { SOCIntelPanel } from "./components/SOCIntelPanel";
import { SOCPlaybookModal } from "./components/SOCPlaybookModal";
import { URLInspectorModal } from "./components/URLInspectorModal";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { AnalysisRequest, AnalysisResponse, AnalysisHistoryItem, MessageType, ExtractedURL } from "./types";
import { extractAndAnalyzeURLs } from "./utils/urlAnalyzer";
import { ShieldAlert, AlertTriangle, Terminal, CheckCircle2, Lock, Search, FileCheck2 } from "lucide-react";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentType, setCurrentType] = useState<MessageType>("E-mail");
  const [senderInfo, setSenderInfo] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isPlaybookOpen, setIsPlaybookOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isUrlInspectorOpen, setIsUrlInspectorOpen] = useState(false);
  const [extractedUrls, setExtractedUrls] = useState<ExtractedURL[]>([]);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("soc_phishing_history");
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) { console.error("Falha ao carregar histórico local:", e); }
  }, []);

  const saveToHistory = (item: AnalysisHistoryItem) => {
    const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 30);
    setHistory(updated);
    try { localStorage.setItem("soc_phishing_history", JSON.stringify(updated)); } catch (e) { console.error("Falha ao salvar histórico local:", e); }
  };
  const handleClearHistory = () => { setHistory([]); try { localStorage.removeItem("soc_phishing_history"); } catch {} };
  const handleInspectUrls = (text: string) => { setExtractedUrls(extractAndAnalyzeURLs(text)); setIsUrlInspectorOpen(true); };

  const handleAnalyze = async (req: AnalysisRequest) => {
    setIsLoading(true); setError(null); setCurrentMessage(req.message); setCurrentType(req.type); setSenderInfo(req.senderInfo || "");
    setExtractedUrls(extractAndAnalyzeURLs(req.message));
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req) });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Erro ao processar a análise.");
      const resObj: AnalysisResponse = { ...data, timestamp: data.timestamp || new Date().toISOString() };
      setAnalysisResult(resObj);
      saveToHistory({ ...resObj, id: data.caseId || `analysis-${Date.now()}`, messageSnippet: req.message.length > 80 ? req.message.slice(0, 80) + "..." : req.message || "[Imagem/Anexo]", messageType: req.type, senderInfo: req.senderInfo, hasImage: !!req.imageBase64 });
      setTimeout(() => document.getElementById("analysis-result-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Erro desconhecido na análise."); }
    finally { setIsLoading(false); }
  };

  const handleSelectHistoryItem = (item: AnalysisHistoryItem) => {
    setCurrentMessage(item.messageSnippet); setCurrentType(item.messageType); setSenderInfo(item.senderInfo || ""); setAnalysisResult(item); setExtractedUrls(extractAndAnalyzeURLs(item.messageSnippet));
    setTimeout(() => document.getElementById("analysis-result-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  return <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
    <Header onOpenPlaybook={() => setIsPlaybookOpen(true)} onOpenHistory={() => setIsHistoryOpen(true)} historyCount={history.length} />
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <section className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono"><Terminal className="w-3.5 h-3.5 text-cyan-400" /><span>Triagem SOC · Engenharia Social</span></div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">Investigação de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Phishing & Smishing</span></h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">Analise mensagens e capturas suspeitas com classificação de risco, evidências, IOCs, mapeamento MITRE ATT&CK e recomendação de resposta.</p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400"><span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Risk Score + Evidências</span><span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-cyan-400" /> Triagem defensiva</span><span className="flex items-center gap-1.5"><Search className="w-4 h-4 text-blue-400" /> URL & OCR</span></div>
        </div>
      </section>
      <MessageForm onSubmit={handleAnalyze} isLoading={isLoading} onInspectUrls={handleInspectUrls} />
      {error && <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-red-400 shrink-0" /><div className="text-xs sm:text-sm"><strong className="font-semibold block text-red-300">Falha ao realizar análise:</strong><p>{error}</p></div></div>}
      {analysisResult && <section id="analysis-result-section" className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-base font-bold text-white flex items-center gap-2"><FileCheck2 className="w-5 h-5 text-cyan-400" /> Laudo Técnico SOC</h2>{extractedUrls.length > 0 && <button onClick={() => setIsUrlInspectorOpen(true)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" /> Inspecionar {extractedUrls.length} URL(s)</button>}</div><SOCIntelPanel response={analysisResult} /><AnalysisResult response={analysisResult} originalMessage={currentMessage} originalType={currentType} senderInfo={senderInfo} /></section>}
    </main>
    <footer className="border-t border-slate-800/80 bg-slate-900/50 py-6 mt-12 text-center text-xs text-slate-500"><div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3"><div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-cyan-500" /><span className="font-semibold text-slate-400">Analisador SOC Phishing</span> — Resposta a Incidentes</div><p className="text-[11px]">Fins educativos e preventivos · powered by Gemini AI</p></div></footer>
    <SOCPlaybookModal isOpen={isPlaybookOpen} onClose={() => setIsPlaybookOpen(false)} />
    <URLInspectorModal isOpen={isUrlInspectorOpen} onClose={() => setIsUrlInspectorOpen(false)} urls={extractedUrls} />
    <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={history} onSelectHistoryItem={handleSelectHistoryItem} onClearHistory={handleClearHistory} />
  </div>;
}
