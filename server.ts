import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // SOC Phishing & Social Engineering Analysis endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { message, type, senderInfo, imageBase64, imageMimeType } = req.body;

      if (!message && !imageBase64) {
        return res.status(400).json({
          error: "Forneça o texto da mensagem ou uma imagem/captura de tela para análise.",
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "A chave API do Gemini não está configurada no servidor (GEMINI_API_KEY).",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = `Você é um Analista SOC (Security Operations Center) sênior, especializado em engenharia social, detecção de phishing, smishing, vishing e análise de ameaças cibernéticas.

Sua tarefa é analisar rigorosamente a mensagem fornecida pelo usuário sob uma perspectiva educativa e analítica de segurança da informação.

DIRETRIZES DE RESPOSTA E REGRA DE SEGURANÇA:
1. Mantenha um tom profissional, educativo, objetivo e técnico, porém acessível.
2. Considere o objetivo estritamente educativo. NÃO afirme categoricamente que uma mensagem é maliciosa ou legítima com certeza absoluta sem provas incontestáveis. Em vez disso, classifique o RISCO com base nos indícios presentes.
3. Sua resposta DEVE conter EXATAMENTE as seguintes 7 seções com os títulos exatos em formato de cabeçalho Markdown nível 1 (#):

# Resumo
Faça um resumo claro, objetivo e sucinto do conteúdo e propósito alegado da mensagem.

# Nível de risco
Classifique obrigatoriamente o risco escolhendo uma das 4 opções exatas com seu respectivo emoji no início do título da classificação:
🟢 Baixo
🟡 Médio
🟠 Alto
🔴 Muito Alto
Em seguida, explique detalhadamente o motivo técnico desta classificação de risco.

# Indícios encontrados
Liste em tópicos os sinais e vetores detectados, avaliando detalhadamente aspectos como:
- Urgência excessiva ou senso de pânico
- Ameaças (bloqueio de conta, multa, ação judicial)
- Pedido de senha, PIN ou credenciais
- Pedido de código de autenticação (MFA/OTP/2FA)
- Pedido de dados pessoais, bancários ou documentos
- Links suspeitos, encurtados ou redirecionamentos acentuados
- Erros de português, gramática, pontuação ou formatação estranha
- Domínio ou remetente diferente do oficial ou homóglifo/typosquatting
- Promessas exageradas, prêmios ou reembolsos inesperados
- Anexos inesperados ou executáveis (.pdf, .zip, .html, .exe)
Se NENHUM indício for encontrado, informe explicitamente que nenhum sinal suspeito óbvio foi identificado.

# Técnicas de engenharia social
Explique quais técnicas específicas de engenharia social parecem estar sendo utilizadas (ex: Pretexting, Baiting, Urgency/Scarcity, Authority impersonation, Fear/Intimidation, Phishing/Smishing/Quishing, Spear Phishing).

# O que fazer
Explique passo a passo quais ações preventivas o usuário deve tomar IMEDIATAMENTE antes de responder, interagir ou clicar em qualquer link (ex: não clicar em links, não fornecer códigos, reportar ao canal de segurança, isolar a mensagem).

# Como verificar a autenticidade
Explique métodos concretos e seguros para o usuário confirmar se a mensagem realmente veio da instituição ou pessoa alegada (ex: acessar o site digitando a URL oficial diretamente no navegador, entrar em contato pelo SAC oficial no verso do cartão, consultar o app oficial).

# Conclusão
Finalize apresentando o parecer técnico resumido dizendo se a mensagem apresenta forte indício de phishing, se é extremamente suspeita ou se parece legítima, deixando estritamente claro que a avaliação é baseada apenas nas informações e evidências fornecidas.`;

      const promptText = `Por favor, analise a seguinte mensagem como Analista SOC especializado:

Tipo de mensagem: ${type || "Não especificado"}
${senderInfo ? `Informações do remetente (Email/Telefone/Cabeçalho): ${senderInfo}\n` : ""}
Conteúdo da mensagem:
"""
${message || "[Imagem anexada para análise visual/OCR]"}
"""`;

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      if (imageBase64) {
        // Strip data prefix if present
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType: imageMimeType || "image/png",
            data: cleanBase64,
          },
        });
      }

      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: { parts },
        config: {
          systemInstruction,
          temperature: 0.2, // Low temperature for consistent security analysis
        },
      });

      const analysisText = response.text || "Não foi possível gerar a análise.";

      // Extract risk level for structured helper payload
      let extractedRisk: "Baixo" | "Médio" | "Alto" | "Muito Alto" = "Médio";
      let extractedEmoji = "🟡";

      if (analysisText.includes("🔴") || analysisText.includes("Muito Alto")) {
        extractedRisk = "Muito Alto";
        extractedEmoji = "🔴";
      } else if (analysisText.includes("🟠") || analysisText.includes("Alto")) {
        extractedRisk = "Alto";
        extractedEmoji = "🟠";
      } else if (analysisText.includes("🟡") || analysisText.includes("Médio")) {
        extractedRisk = "Médio";
        extractedEmoji = "🟡";
      } else if (analysisText.includes("🟢") || analysisText.includes("Baixo")) {
        extractedRisk = "Baixo";
        extractedEmoji = "🟢";
      }

      return res.json({
        analysis: analysisText,
        riskLevel: extractedRisk,
        riskEmoji: extractedEmoji,
        timestamp: new Date().toISOString(),
      });
    } catch (error: unknown) {
      console.error("Erro na análise SOC:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido durante a análise.";
      return res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
