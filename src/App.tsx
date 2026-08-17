import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { MessageForm } from "./components/MessageForm";
import { AnalysisResult } from "./components/AnalysisResult";
import { SOCPlaybookModal } from "./components/SOCPlaybookModal";
import { URLInspectorModal } from "./components/URLInspectorModal";
import { HistoryDrawer } from "./components/HistoryDrawer";
import {
  AnalysisRequest,
  AnalysisResponse,
  AnalysisHistoryItem,
  MessageType,
  ExtractedURL,
} from "./types";
import { extractAndAnalyzeURLs } from "./utils/urlAnalyzer";
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  Terminal,
  CheckCircle2,
  Lock,
  Search,
  Activity,
  FileCheck2
} from "lucide-react";

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [currentType, setCurrentType] = useState<MessageType>("E-mail");
  const [senderInfo, setSenderInfo] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);

  // Modals & Drawers state
  const [isPlaybookOpen, setIsPlaybookOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isUrlInspectorOpen, setIsUrlInspectorOpen] = useState<boolean>(false);
  const [extractedUrls, setExtractedUrls] = useState<ExtractedURL[]>([]);

  // History state
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("soc_phishing_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Falha ao carregar histórico local:", e);
    }
  }, []);

  const saveToHistory = (item: AnalysisHistoryItem) => {
    const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 30);
    setHistory(updated);
    try {
      localStorage.setItem("soc_phishing_history", JSON.stringify(updated));
    } catch (e) {
      console.error("Falha ao salvar histórico local:", e);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("soc_phishing_history");
    } catch (e) {
      console.error("Falha ao limpar histórico local:", e);
    }
  };

  const handleInspectUrls = (text: string) => {
    const urls = extractAndAnalyzeURLs(text);
    setExtractedUrls(urls);
    setIsUrlInspectorOpen(true);
  };

  const handleAnalyze = async (req: AnalysisRequest) => {
    setIsLoading(true);
    setError(null);
    setCurrentMessage(req.message);
    setCurrentType(req.type);
    setSenderInfo(req.senderInfo || "");

    // Extract URLs for inspector
    const urls = extractAndAnalyzeURLs(req.message);
    setExtractedUrls(urls);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Ocorreu um erro ao processar a análise no servidor.");
      }

      const resObj: AnalysisResponse = {
        analysis: data.analysis,
        riskLevel: data.riskLevel,
        riskEmoji: data.riskEmoji,
        timestamp: data.timestamp || new Date().toISOString(),
      };

      setAnalysisResult(resObj);

      // Save to history
      const historyItem: AnalysisHistoryItem = {
        ...resObj,
        id: `analysis-${Date.now()}`,
        messageSnippet: req.message.length > 80 ? req.message.slice(0, 80) + "..." : req.message || "[Imagem/Anexo]",
        messageType: req.type,
        senderInfo: req.senderInfo,
        hasImage: !!req.imageBase64,
      };

      saveToHistory(historyItem);

      // Smooth scroll to result
      setTimeout(() => {
        const resultElement = document.getElementById("analysis-result-section");
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido na análise.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: AnalysisHistoryItem) => {
    setCurrentMessage(item.messageSnippet);
    setCurrentType(item.messageType);
    setSenderInfo(item.senderInfo || "");
    setAnalysisResult({
      analysis: item.analysis,
      riskLevel: item.riskLevel,
      riskEmoji: item.riskEmoji,
      timestamp: item.timestamp,
    });

    const urls = extractAndAnalyzeURLs(item.messageSnippet);
    setExtractedUrls(urls);

    setTimeout(() => {
      const resultElement = document.getElementById("analysis-result-section");
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Header
        onOpenPlaybook={() => setIsPlaybookOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner SOC Hero Header */}
        <section className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-2xl overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Análise Especializada SOC de Engenharia Social</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Investigação de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Phishing & Smishing</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Submeta mensagens, e-mails, SMS ou capturas de tela suspeitas para avaliação de risco por inteligência cibernética. Obtenha laudo estruturado com indícios de golpe, técnicas de manipulação emocional e recomendações de mitigação.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 7 Seções de Laudo SOC
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-cyan-400" /> Avaliação Educativa de Risco
              </span>
              <span className="flex items-center gap-1.5">
                <Search className="w-4 h-4 text-blue-400" /> Análise de Links & OCR
              </span>
            </div>
          </div>
        </section>

        {/* Input Form */}
        <MessageForm
          onSubmit={handleAnalyze}
          isLoading={isLoading}
          onInspectUrls={handleInspectUrls}
        />

        {/* Error Alert if any */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 flex items-start gap-3 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <strong className="font-semibold block text-red-300">Falha ao realizar análise:</strong>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Analysis Result Output Section */}
        {analysisResult && (
          <section id="analysis-result-section" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-cyan-400" />
                Laudo Técnico SOC Emito
              </h2>
              {extractedUrls.length > 0 && (
                <button
                  onClick={() => setIsUrlInspectorOpen(true)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" /> Inspecionar {extractedUrls.length} URL(s)
                </button>
              )}
            </div>

            <AnalysisResult
              response={analysisResult}
              originalMessage={currentMessage}
              originalType={currentType}
              senderInfo={senderInfo}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-500" />
            <span className="font-semibold text-slate-400">Analisador SOC Phishing</span> — Resposta a Incidentes de Segurança
          </div>
          <p className="text-[11px] text-slate-500">
            Fins estritamente educativos e preventivos. powered by Gemini AI
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <SOCPlaybookModal
        isOpen={isPlaybookOpen}
        onClose={() => setIsPlaybookOpen(false)}
      />

      <URLInspectorModal
        isOpen={isUrlInspectorOpen}
        onClose={() => setIsUrlInspectorOpen(false)}
        urls={extractedUrls}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
