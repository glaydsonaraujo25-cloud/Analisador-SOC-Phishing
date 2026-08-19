import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const riskLevels = ['Baixo', 'Médio', 'Alto', 'Muito Alto'] as const;
type RiskLevel = typeof riskLevels[number];

function normalizeRisk(value: unknown): { level: RiskLevel; emoji: string } {
  const level = String(value || 'Médio');
  if (riskLevels.includes(level as RiskLevel)) {
    const emoji = level === 'Baixo' ? '🟢' : level === 'Médio' ? '🟡' : level === 'Alto' ? '🟠' : '🔴';
    return { level: level as RiskLevel, emoji };
  }
  return { level: 'Médio', emoji: '🟡' };
}

function parseJson(text: string): any {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try { return JSON.parse(cleaned); } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
    }
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido. Use POST.' });

  try {
    const { message = '', type = 'E-mail', senderInfo = '', imageBase64, imageMimeType } = req.body || {};
    if (!message && !imageBase64) return res.status(400).json({ error: 'Forneça o texto da mensagem ou uma imagem para análise.' });
    if (typeof message !== 'string' || message.length > 20000) return res.status(400).json({ error: 'A mensagem deve ter até 20.000 caracteres.' });

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada na Vercel. Adicione a variável em Settings → Environment Variables e faça um novo deploy.' });

    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `Você é um Analista SOC sênior especializado em phishing e engenharia social. Faça triagem defensiva e educativa.
RETORNE SOMENTE JSON VÁLIDO, sem Markdown:
{"summary":"string","riskLevel":"Baixo|Médio|Alto|Muito Alto","riskScore":0,"confidence":0,"incidentType":"Phishing|Smishing|Vishing|Quishing|BEC|Credential Harvesting|Malware Delivery|Social Engineering|Outro","attackObjective":"string","recommendedAction":"MONITORAR|REVISAR|ESCALAR INCIDENTE|ESCALAR URGENTEMENTE","evidence":[{"title":"string","detail":"string","confidence":0}],"socialEngineering":[{"technique":"string","confidence":0}],"iocs":[{"type":"URL|DOMAIN|EMAIL|PHONE|HASH|OTHER","value":"string"}],"mitre":[{"id":"T1566.002","name":"Spearphishing Link"}],"nextSteps":["string"]}
Não invente IOCs, técnicas ou MITRE sem evidência. Use T1566.002 para link, T1566.001 para anexo e T1566.003 para serviço de terceiros somente quando houver evidência. Identifique urgência, autoridade, medo, credenciais, MFA, dados financeiros, typosquatting, URLs encurtadas e anexos.`;

    const parts: any[] = [];
    if (imageBase64) {
      const data = String(imageBase64).replace(/^data:image\/[^;]+;base64,/i, '');
      parts.push({ inlineData: { mimeType: imageMimeType || 'image/png', data } });
    }
    parts.push({ text: `Tipo: ${type}\nRemetente: ${senderInfo || 'Não informado'}\nMensagem:\n${message || '[Imagem anexada]'}` });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: { systemInstruction, temperature: 0.1, responseMimeType: 'application/json' }
    });

    const parsed = parseJson(response.text || '');
    if (!parsed) return res.status(502).json({ error: 'A IA retornou uma resposta que não pôde ser interpretada como JSON. Tente novamente.' });

    const risk = normalizeRisk(parsed.riskLevel);
    const riskScore = Math.max(0, Math.min(100, Number(parsed.riskScore) || 0));
    const confidence = Math.max(0, Math.min(100, Number(parsed.confidence) || 0));
    const caseId = `CASE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const evidence = Array.isArray(parsed.evidence) ? parsed.evidence : [];
    const socialEngineering = Array.isArray(parsed.socialEngineering) ? parsed.socialEngineering : [];
    const iocs = Array.isArray(parsed.iocs) ? parsed.iocs : [];
    const mitre = Array.isArray(parsed.mitre) ? parsed.mitre : [];
    const nextSteps = Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [];

    const analysis = `# Resumo\n${parsed.summary || 'Sem resumo disponível.'}\n\n# Nível de risco\n${risk.emoji} ${risk.level}\n\n# Indícios encontrados\n${evidence.map((e: any) => `- **${e.title}** (${e.confidence ?? 0}%): ${e.detail}`).join('\n') || '- Nenhuma evidência estruturada identificada.'}\n\n# Técnicas de engenharia social\n${socialEngineering.map((e: any) => `- ${e.technique} — ${e.confidence ?? 0}%`).join('\n') || '- Nenhuma técnica identificada com evidência suficiente.'}\n\n# Próximas ações\n${nextSteps.map((s: string) => `- ${s}`).join('\n') || '- Valide a solicitação por um canal oficial independente e não interaja com links ou anexos suspeitos.'}\n\n# Conclusão\nClassificação baseada nas evidências fornecidas; valide com o contexto do ambiente antes de tomar uma decisão final.`;

    return res.status(200).json({ analysis, riskLevel: risk.level, riskEmoji: risk.emoji, timestamp: new Date().toISOString(), riskScore, confidence, caseId, incidentType: parsed.incidentType || 'Outro', attackObjective: parsed.attackObjective || 'Não identificado', recommendedAction: parsed.recommendedAction || 'REVISAR', evidence, iocs, mitre });
  } catch (error: any) {
    console.error('SOC analysis error:', error);
    const message = error?.message || 'Erro desconhecido durante a análise.';
    return res.status(500).json({ error: message });
  }
}
