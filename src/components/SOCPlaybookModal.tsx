import React from "react";
import { X, Shield, AlertTriangle, Eye, HelpCircle, Lock, MailCheck, ExternalLink } from "lucide-react";

interface SOCPlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SOCPlaybookModal: React.FC<SOCPlaybookModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-950/80 border border-cyan-800 rounded-lg text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Playbook de Engenharia Social & Phishing</h2>
              <p className="text-xs text-slate-400">
                Guia prático de conscientização e vetores de ataque para analistas SOC
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Section 1: Os 6 Gatilhos Psicológicos */}
          <section className="space-y-3">
            <h3 className="text-base font-semibold text-cyan-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              1. Os 6 Gatilhos Psicológicos Explorados no Phishing
            </h3>
            <p className="text-slate-400">
              Engenharia social explora vulnerabilidades humanas através da manipulação emocional. Os principais gatilhos incluem:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="font-semibold text-amber-400 block mb-1">⏱️ Urgência Excessiva</span>
                Exige resposta em minutos/horas para evitar bloqueios ou perder prazos antes que a vítima raciocine.
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="font-semibold text-red-400 block mb-1">🚨 Ameaça e Intimidação</span>
                Simula cancelamento de conta, multas, ações judiciais ou perda de acesso a serviços essenciais.
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="font-semibold text-emerald-400 block mb-1">🎁 Recompensa e Ganância (Isca)</span>
                Promessas de PIX gratuito, sorteios, heranças, investimentos milagrosos ou reembolsos inesperados.
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="font-semibold text-purple-400 block mb-1">👔 Falsa Autoridade</span>
                Impersonação de gerentes de banco, diretoria de TI, Polícia Federal, Receita ou Correios.
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="font-semibold text-cyan-400 block mb-1">🔍 Curiosidade</span>
                Mensagens com anexos do tipo "Fatura.pdf", "Comprovante.zip" ou "Confira as fotos da festa".
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="font-semibold text-pink-400 block mb-1">❤️ Empatia / Parente em Apuros</span>
                Falso parente no WhatsApp alegando troca de número e pedido urgente de transferência.
              </div>
            </div>
          </section>

          {/* Section 2: Tipos de Ataque */}
          <section className="space-y-3">
            <h3 className="text-base font-semibold text-cyan-400 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              2. Classificação dos Vetores de Ataque
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-start">
                <div>
                  <strong className="text-slate-200">Phishing (E-mail):</strong> Envio em massa ou spear phishing direcionado simula organizações conhecidas.
                </div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-start">
                <div>
                  <strong className="text-slate-200">Smishing (SMS):</strong> Mensagens curtas com links encurtados ou domínios falsos alertando sobre contas ou entregas.
                </div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-start">
                <div>
                  <strong className="text-slate-200">Vishing (Voz/Telefone):</strong> Ligações de falsos centrais de segurança solicitando senhas ou confirmações de transações.
                </div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-start">
                <div>
                  <strong className="text-slate-200">Quishing (QR Code):</strong> QR Codes manipulados em cartazes ou e-mails direcionando para páginas de phishing móvel.
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Regra de Ouro SOC */}
          <section className="p-4 bg-cyan-950/40 border border-cyan-800/60 rounded-xl space-y-2">
            <h4 className="font-semibold text-cyan-300 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Regra Ouro do Analista SOC para Verificação
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
              <li>Nunca clique em links fornecidos na mensagem suspeita.</li>
              <li>Acesse a plataforma digitando a URL oficial diretamente na barra do navegador.</li>
              <li>Consulte os canais de atendimento oficiais registrados no verso do cartão ou no site institucional.</li>
              <li>Nenhuma instituição financeira ou TI solicita senha, PIN ou token de verificação por e-mail ou WhatsApp.</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
