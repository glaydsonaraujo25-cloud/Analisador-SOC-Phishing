import React from "react";
import { X, ExternalLink, ShieldAlert, CheckCircle, AlertTriangle, Link as LinkIcon } from "lucide-react";
import { ExtractedURL } from "../types";

interface URLInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  urls: ExtractedURL[];
}

export const URLInspectorModal: React.FC<URLInspectorModalProps> = ({
  isOpen,
  onClose,
  urls,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-200">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-950/80 border border-blue-800 rounded-lg text-blue-400">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Inspetor SOC de URLs & Domínios</h2>
              <p className="text-xs text-slate-400">
                {urls.length} link(s) extraído(s) da mensagem para análise de reputação
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {urls.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-slate-300">Nenhum link detectado no texto</p>
              <p className="text-xs mt-1">Nenhum endereço de site ou URL externa foi identificado na mensagem.</p>
            </div>
          ) : (
            urls.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${
                  item.isSuspiciousDomain
                    ? "bg-red-950/20 border-red-800/60"
                    : "bg-slate-800/50 border-slate-700/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="font-mono text-xs text-cyan-300 break-all bg-slate-950/80 p-2 rounded-lg border border-slate-800 w-full">
                    {item.url}
                  </div>
                  {item.isSuspiciousDomain ? (
                    <span className="shrink-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-950 border border-red-700 text-red-300">
                      Link Suspeito
                    </span>
                  ) : (
                    <span className="shrink-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      Link Analisado
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <p>
                    <strong className="text-slate-400">Domínio Extraído:</strong>{" "}
                    <span className="font-mono text-white font-semibold">{item.domain}</span>
                  </p>

                  {item.reasons.length > 0 && (
                    <div className="mt-2 space-y-1 pt-2 border-t border-slate-800">
                      <p className="font-semibold text-red-400 flex items-center gap-1 text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5" /> Indícios de Risco Detectados:
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-red-300 text-[11px]">
                        {item.reasons.map((r, rIdx) => (
                          <li key={rIdx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-between items-center text-xs text-slate-400">
          <span>⚠️ Nunca acesse links suspeitos diretamente no seu navegador.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
