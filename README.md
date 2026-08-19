# 🛡️ Analisador SOC Phishing

Plataforma educativa de triagem de **phishing e engenharia social** com IA, análise de risco e recursos inspirados no fluxo de trabalho de um SOC.

## 🚀 Principais recursos

- **Phishing Risk Score (0–100)** e nível de risco
- **Case ID** para cada investigação
- Evidências estruturadas com nível de confiança
- Classificação do tipo de incidente e objetivo do ataque
- Identificação de técnicas de engenharia social
- Extração de **IOCs** (URLs, domínios, e-mails, telefones e hashes quando presentes)
- Mapeamento de técnicas **MITRE ATT&CK** com evidência suficiente
- Inspeção local de URLs e suporte a análise de imagens/OCR
- Histórico local das análises
- Exportação de parecer técnico
- Playbook SOC para orientação de resposta

## 🧠 Fluxo de triagem

```text
Mensagem / imagem
       ↓
Extração de evidências
       ↓
IA para classificação defensiva
       ↓
Risk Score + confiança
       ↓
IOC + MITRE ATT&CK
       ↓
Decisão SOC + próximos passos
```

## 🔐 Segurança

O backend valida o conteúdo recebido, limita o corpo JSON a 8 MB e evita expor a chave da API do Gemini ao frontend. A análise é educativa e não deve ser tratada como prova definitiva de comprometimento.

## 🛠️ Stack

- React + TypeScript
- Vite
- Express
- Tailwind CSS
- Lucide React
- Google Gemini API

## ⚙️ Execução local

Configure `GEMINI_API_KEY` no ambiente e execute:

```bash
npm install
npm run dev
```

Para validar TypeScript:

```bash
npm run lint
```

## ⚠️ Uso responsável

Use o projeto somente para análise defensiva, conscientização e treinamento. Não interaja com links, anexos ou infraestrutura suspeita durante uma investigação sem autorização e controles apropriados.
