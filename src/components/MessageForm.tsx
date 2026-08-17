import React, { useState, useRef } from "react";
import { MessageType, AnalysisRequest, SampleExample } from "../types";
import { SAMPLE_EXAMPLES } from "../data/examples";
import {
  Send,
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  HelpCircle,
  Link,
  RotateCcw,
  AlertCircle,
  FileText
} from "lucide-react";

interface MessageFormProps {
  onSubmit: (req: AnalysisRequest) => void;
  isLoading: boolean;
  onInspectUrls: (text: string) => void;
}

const MESSAGE_TYPES: MessageType[] = [
  "E-mail",
  "SMS / Smishing",
  "WhatsApp / Mensagem Instantânea",
  "Rede Social / DM (Instagram, LinkedIn)",
  "Chamada Telefônica / Vishing",
  "QR Code / Quishing",
  "Comunicação Interna (Slack, Teams, Discord)",
  "Outro",
];

export const MessageForm: React.FC<MessageFormProps> = ({
  onSubmit,
  isLoading,
  onInspectUrls,
}) => {
  const [message, setMessage] = useState<string>("");
  const [type, setType] = useState<MessageType>("E-mail");
  const [senderInfo, setSenderInfo] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [imageMimeType, setImageMimeType] = useState<string>("image/png");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).");
      return;
    }

    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageBase64(result);
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageBase64(undefined);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectExample = (ex: SampleExample) => {
    setMessage(ex.message);
    setType(ex.type);
    setSenderInfo(ex.senderInfo);
    clearImage();
  };

  const handleClearAll = () => {
    setMessage("");
    setSenderInfo("");
    clearImage();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !imageBase64) {
      alert("Por favor, digite o texto da mensagem ou envie uma captura de tela/imagem.");
      return;
    }

    onSubmit({
      message: message.trim(),
      type,
      senderInfo: senderInfo.trim(),
      imageBase64,
      imageMimeType,
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Inserir Mensagem Suspeita para Análise
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cole o texto da mensagem, detalhes do remetente ou envie uma captura de tela do e-mail/SMS.
          </p>
        </div>

        {/* Clear button */}
        {(message || senderInfo || previewUrl) && (
          <button
            type="button"
            onClick={handleClearAll}
            className="self-start sm:self-auto px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Limpar Campos
          </button>
        )}
      </div>

      {/* Quick Preset Examples Picker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Exemplos Prontos para Teste Rápido (Clique para carregar):
          </label>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
          {SAMPLE_EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => handleSelectExample(ex)}
              className="shrink-0 text-left px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 hover:border-cyan-500/50 rounded-xl transition-all group max-w-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-[11px] font-semibold text-cyan-300 group-hover:text-cyan-200 truncate">
                  {ex.title}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-900 border border-slate-700 text-slate-300 rounded">
                  {ex.type.split(" ")[0]}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1">{ex.description}</p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Message Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Tipo de Mensagem <span className="text-red-400">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MessageType)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              {MESSAGE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Sender Info */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Remetente / Endereço / Telefone (Opcional)
            </label>
            <input
              type="text"
              value={senderInfo}
              onChange={(e) => setSenderInfo(e.target.value)}
              placeholder="Ex: atendimento@banco-falso.com ou +55 11 99999-0000"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Message Content Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-300">
              Conteúdo da Mensagem <span className="text-red-400">*</span>
            </label>
            {message.trim() && (
              <button
                type="button"
                onClick={() => onInspectUrls(message)}
                className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
              >
                <Link className="w-3 h-3" />
                Inspecionar Links Extraídos
              </button>
            )}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Cole aqui o texto completo recebido (ex: 'BANCO ITAÚ: Seu PIX foi cancelado, acesse o link para desbloquear...')"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans leading-relaxed"
          />
        </div>

        {/* Image Attachment Dropzone */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">
            Anexar Captura de Tela / Imagem da Mensagem (Opcional)
          </label>

          {previewUrl ? (
            <div className="relative inline-block border border-slate-700 rounded-xl overflow-hidden bg-slate-950 p-2">
              <img
                src={previewUrl}
                alt="Captura de tela anexada"
                className="max-h-40 rounded-lg object-contain"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-3 right-3 p-1.5 bg-slate-900/90 hover:bg-red-600 text-white rounded-full border border-slate-700 transition-colors shadow-lg"
                title="Remover imagem"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950/50 hover:bg-slate-950 p-4 rounded-xl text-center cursor-pointer transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-1 text-slate-400 group-hover:text-slate-200">
                <Upload className="w-5 h-5 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-medium">Clique para selecionar ou arraste uma imagem/print</p>
                <p className="text-[10px] text-slate-500">Suporta PNG, JPG, WEBP (Análise visual de print de e-mail ou WhatsApp)</p>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Análise estritamente educativa orientada a risco.</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 transition-all shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 shrink-0 ${
              isLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Analisando Ameaça SOC (Gemini AI)...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Analisar Mensagem</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
