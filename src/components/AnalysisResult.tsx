import React, { useState } from "react";
import Markdown from "react-markdown";
import { AnalysisResponse, RiskLevel } from "../types";
import { RiskBadge } from "./RiskBadge";
import {
  Copy,
  Check,
  Download,
  Share2,
  ShieldCheck,
  ShieldAlert,
  ListCheck,
  FileText,
  AlertTriangle,
  Info
} from "lucide-react";

interface AnalysisResultProps {
  response: AnalysisResponse;
  originalMessage: string;
  originalType: string;
  senderInfo?: string;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  response,
  originalMessage,
  originalType,
  senderInfo,
}) => {
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(response.analysis);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleCopySummary = () => {
    const summaryHeader = `--- PARECER DE SEGURANÇA SOC ---
Tipo: ${originalType}
${senderInfo ? `Remetente: ${senderInfo}\n` : ""}Nível de Risco: ${response.riskEmoji} ${response.riskLevel}
Data da Análise: ${new Date(response.timestamp).toLocaleString("pt-BR")}

${response.analysis}`;

    navigator.clipboard.writeText(summaryHeader);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleDownloadReport = () => {
    const content = `=====================================================
  RELATÓRIO DE ANÁLISE SOC - ENGENHARIA SOCIAL & PHISHING
=====================================================
Data/Hora: ${new Date(response.timestamp).toLocaleString("pt-BR")}
Tipo de Mensagem: ${originalType}
Remetente Informado: ${senderInfo || "Não especificado"}
Classificação de Risco: ${response.riskEmoji} ${response.riskLevel}

-----------------------------------------------------
MENSAGEM ANALISADA:
-----------------------------------------------------
${originalMessage}

-----------------------------------------------------
PARECER TÉCNICO SOC E RECOMENDAÇÕES:
-----------------------------------------------------
${response.analysis}

=====================================================
Avaliação desenvolvida com fins estritamente educativos.
=====================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Relatorio_SOC_Phishing_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6 animate-fade-in">
      {/* Top Banner with Risk Level */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Resultado do Incidente SOC
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                {new Date(response.timestamp).toLocaleTimeString("pt-BR")}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              Análise de Risco de Phishing
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
          <RiskBadge level={response.riskLevel} emoji={response.riskEmoji} size="lg" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-3 border-b border-slate-800/80">
        <button
          onClick={handleCopyMarkdown}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          {copiedMarkdown ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-cyan-400" /> Copiar Markdown
            </>
          )}
        </button>

        <button
          onClick={handleCopySummary}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          {copiedSummary ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-cyan-400" /> Copiar Texto Completo
            </>
          )}
        </button>

        <button
          onClick={handleDownloadReport}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" /> Baixar Relatório (.txt)
        </button>
      </div>

      {/* Render Markdown Analysis */}
      <div className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-base prose-h1:sm:text-lg prose-h1:text-cyan-400 prose-h1:border-b prose-h1:border-slate-800 prose-h1:pb-2 prose-h1:mt-6 prose-h1:mb-3 prose-p:text-slate-300 prose-p:text-xs prose-p:sm:text-sm prose-p:leading-relaxed prose-li:text-xs prose-li:sm:text-sm prose-li:text-slate-300 prose-strong:text-white prose-code:text-cyan-300 prose-code:bg-slate-950 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
        <Markdown>{response.analysis}</Markdown>
      </div>

      {/* Security Disclaimer footer */}
      <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-300">Aviso do Analista SOC:</p>
          <p className="mt-0.5">
            Esta avaliação foi elaborada com foco em conscientização de segurança da informação. A classificação reflete os indícios fornecidos no texto e anexos. Na dúvida, sempre consulte o canal de atendimento oficial da instituição sem clicar nos links da mensagem.
          </p>
        </div>
      </div>
    </div>
  );
};
