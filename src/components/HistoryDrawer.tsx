import React from "react";
import { X, History, Trash2, ArrowRight, ShieldCheck, ShieldAlert } from "lucide-react";
import { AnalysisHistoryItem } from "../types";
import { RiskBadge } from "./RiskBadge";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: AnalysisHistoryItem[];
  onSelectHistoryItem: (item: AnalysisHistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Histórico de Análises SOC</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <History className="w-12 h-12 mx-auto opacity-40 text-slate-400" />
              <p className="font-semibold text-slate-400">Nenhum registro anterior</p>
              <p className="text-xs">As análises realizadas ficarão salvas localmente neste navegador.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistoryItem(item);
                  onClose();
                }}
                className="p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/50 rounded-xl cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase bg-slate-950 text-cyan-400 px-2 py-0.5 rounded border border-slate-800">
                    {item.messageType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(item.timestamp).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-mono line-clamp-2 bg-slate-950/50 p-2 rounded border border-slate-800/80">
                  "{item.messageSnippet}"
                </p>

                <div className="flex items-center justify-between pt-1">
                  <RiskBadge level={item.riskLevel} emoji={item.riskEmoji} size="sm" />
                  <span className="text-xs font-medium text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Ver relatório <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">{history.length} análise(s) salvas</span>
            <button
              onClick={onClearHistory}
              className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/80 border border-red-800/60 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar Histórico
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
