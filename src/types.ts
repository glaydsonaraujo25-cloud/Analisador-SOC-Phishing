export type MessageType =
  | "E-mail" | "SMS / Smishing" | "WhatsApp / Mensagem Instantânea" | "Rede Social / DM (Instagram, LinkedIn)"
  | "Chamada Telefônica / Vishing" | "QR Code / Quishing" | "Comunicação Interna (Slack, Teams, Discord)" | "Outro";
export type RiskLevel = "Baixo" | "Médio" | "Alto" | "Muito Alto";
export type IncidentStatus = "Novo" | "Em investigação" | "Contido" | "Encerrado";
export interface EvidenceItem { title: string; detail: string; confidence: number; }
export interface IOC { type: string; value: string; }
export interface MitreTechnique { id: string; name: string; }
export interface AnalysisRequest { message: string; type: MessageType; senderInfo?: string; imageBase64?: string; imageMimeType?: string; }
export interface AnalysisResponse {
  analysis: string; riskLevel: RiskLevel; riskEmoji: string; timestamp: string; riskScore?: number; confidence?: number;
  caseId?: string; incidentType?: string; attackObjective?: string; recommendedAction?: string; evidence?: EvidenceItem[];
  iocs?: IOC[]; mitre?: MitreTechnique[]; status?: IncidentStatus; error?: string;
}
export interface AnalysisHistoryItem extends AnalysisResponse {
  id: string; messageSnippet: string; messageType: MessageType; senderInfo?: string; hasImage?: boolean;
}
export interface SampleExample { id: string; title: string; type: MessageType; senderInfo: string; message: string; badge: string; description: string; }
export interface ExtractedURL { url: string; domain: string; isSuspiciousDomain: boolean; reasons: string[]; }
