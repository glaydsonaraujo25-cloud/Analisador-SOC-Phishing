import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const riskLevels = ["Baixo", "Médio", "Alto", "Muito Alto"] as const;
type RiskLevel = typeof riskLevels[number];

function normalizeRisk(value: unknown): { level: RiskLevel; emoji: string } {
  const level = String(value || "Médio");
  if (riskLevels.includes(level as RiskLevel)) {
    const emoji = level === "Baixo" ? "🟢" : level === "Médio" ? "🟡" : level === "Alto" ? "🟠" : "🔴";
    return { level: level as RiskLevel, emoji };
  }
  return { level: "Médio", emoji: "🟡" };
}

function safeJson(text: string) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try { return JSON.parse(cleaned); } catch { return null; }
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json({ limit: "8mb" }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

  app.post("/api/analyze", async (req, res) => {
    try {
      const { message, type, senderInfo, imageBase64, imageMimeType } = req.body || {};
      if (!message && !imageBase64) return res.status(400).json({ error: "Forneça o texto da mensagem ou uma imagem/captura de tela para análise." });
      if (typeof message !== "string" || message.length > 20000) return res.status(400).json({ error: "A mensagem deve ser um texto de até 20.000 caracteres." });
      if (imageBase64 && (!/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(imageBase64) && !/^[A-Za-z0-9+/=]+$/.test(imageBase64))) return res.status(400).json({ error: "Imagem inválida." });

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY não está configurada no servidor." });

      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "soc-phishing-analyzer" } } });
      const systemInstruction = `Você é um Analista SOC sênior especializado em phishing e engenharia social. Faça uma triagem defensiva e educativa. Não trate a classificação como prova absoluta.

RETORNE SOMENTE JSON VÁLIDO, sem Markdown, seguindo exatamente este formato:
{
  "summary":"string",
  "riskLevel":"Baixo|Médio|Alto|Muito Alto",
  "riskScore":0,
  "confidence":0,
  "incidentType":"Phishing|Smishing|Vishing|Quishing|BEC|Credential Harvesting|Malware Delivery|Social Engineering|Outro",
  "attackObjective":"string",
  "recommendedAction":"MONITORAR|REVISAR|ESCALAR INCIDENTE|ESCALAR URGENTEMENTE",
  "evidence":[{"title":"string","detail":"string","confidence":0}],
  "socialEngineering":[{"technique":"string","confidence":0}],
  "iocs":[{"type":"URL|DOMAIN|EMAIL|PHONE|HASH|OTHER","value":"string"}],
  "mitre":[{"id":"T1566.002","name":"Spearphishing Link"}],
  "nextSteps":["string"]
}

REGRAS: riskScore de 0 a 100; confidence de 0 a 100; não invente IOCs, técnicas ou MITRE sem evidência; para phishing por link considere T1566.002, anexo T1566.001, serviço de terceiros T1566.003 somente quando houver evidência. Identifique sinais de urgência, autoridade, medo, credenciais, MFA, dados financeiros, typosquatting, URLs encurtadas e anexos. Recomende ações defensivas e seguras.`;

      const promptText = `Analise como SOC. Tipo: ${type || "Não especificado"}\nRemetente: ${senderInfo || "Não informado"}\nMensagem:\n${message || "[Imagem anexada]"}`;
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        parts.push({ inlineData: { mimeType: imageMimeType || "image/png", data: cleanBase64 } });
      }
      parts.push({ text: promptText });

      const response = await ai.models.generateContent({ model: "gemini-3.6-flash", contents: { parts }, config: { systemInstruction, temperature: 0.1 } });
      const raw = response.text || "{}";
      const parsed = safeJson(raw) || {};
      const risk = normalizeRisk(parsed.riskLevel);
      const riskScore = Math.max(0, Math.min(100, Number(parsed.riskScore) || 0));
      const confidence = Math.max(0, Math.min(100, Number(parsed.confidence) || 0));
      const caseId = `CASE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      const analysis = `# Resumo\n${parsed.summary || "Não foi possível gerar um resumo estruturado."}\n\n# Nível de risco\n${risk.emoji} ${risk.level}\n\n# Indícios encontrados\n${(parsed.evidence || []).map((e: any) => `- **${e.title}** (${e.confidence ?? 0}%): ${e.detail}`).join("\n") || "- Nenhuma evidência estruturada foi identificada."}\n\n# Técnicas de engenharia social\n${(parsed.socialEngineering || []).map((e: any) => `- ${e.technique} — ${e.confidence ?? 0}%`).join("\n") || "- Nenhuma técnica identificada com evidência suficiente."}\n\n# O que fazer\n${(parsed.nextSteps || []).map((s: string) => `- ${s}`).join("\n") || "- Não interaja com links ou anexos suspeitos e utilize canais oficiais para validação."}\n\n# Como verificar a autenticidade\n- Acesse o site oficial digitando o endereço manualmente.\n- Confirme a solicitação por um canal oficial independente.\n- Não forneça senhas, códigos MFA ou dados financeiros por resposta à mensagem.\n\n# Conclusão\nClassificação baseada exclusivamente nas evidências fornecidas. Use o contexto do ambiente e fontes confiáveis antes de tomar uma decisão final.`;

      res.json({ analysis, riskLevel: risk.level, riskEmoji: risk.emoji, timestamp: new Date().toISOString(), riskScore, confidence, caseId, incidentType: parsed.incidentType || "Outro", attackObjective: parsed.attackObjective || "Não identificado", recommendedAction: parsed.recommendedAction || "REVISAR", evidence: parsed.evidence || [], iocs: parsed.iocs || [], mitre: parsed.mitre || [] });
    } catch (error: unknown) {
      console.error("Erro na análise SOC:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erro desconhecido durante a análise." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
}
startServer();
