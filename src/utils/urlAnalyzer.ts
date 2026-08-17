import { ExtractedURL } from "../types";

const SUSPICIOUS_TLDS = [
  ".xyz", ".top", ".click", ".site", ".online", ".tech", ".store", 
  ".space", ".work", ".link", ".support", ".club", ".biz", ".tk", ".ml", ".ga", ".cf"
];

const KNOWN_BRANDS = [
  "itau", "bradesco", "santander", "bb", "bancodobrasil", "caixa", "nubank", "inter", 
  "correios", "gov", "serasa", "magalu", "mercadolivre", "amazon", "google", "apple", 
  "netflix", "whatsapp", "instagram", "facebook", "uber", "ifood", "receitafederal"
];

export function extractAndAnalyzeURLs(text: string): ExtractedURL[] {
  if (!text) return [];

  // Regex to detect URLs
  const urlRegex = /(https?:\/\/[^\s<>"{}|\^~\[\]`]+|www\.[^\s<>"{}|\^~\[\]`]+|[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\/[^\s]*)/gi;
  const matches = text.match(urlRegex) || [];

  const results: ExtractedURL[] = [];
  const seen = new Set<string>();

  for (let match of matches) {
    // Standardize URL prefix
    let fullUrl = match;
    if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
      fullUrl = "http://" + fullUrl;
    }

    if (seen.has(fullUrl)) continue;
    seen.add(fullUrl);

    try {
      const parsed = new URL(fullUrl);
      const domain = parsed.hostname.toLowerCase();
      const reasons: string[] = [];

      // 1. Unencrypted HTTP
      if (parsed.protocol === "http:") {
        reasons.push("Navegação não criptografada (HTTP simples sem certificado HTTPS SSL)");
      }

      // 2. Suspicious TLD
      if (SUSPICIOUS_TLDS.some(tld => domain.endsWith(tld))) {
        reasons.push(`Uso de domínio de alto risco (${domain.substring(domain.lastIndexOf('.'))}) frequentemente usado em phishing`);
      }

      // 3. Raw IP address URL
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
        reasons.push("URL utiliza endereço IP direto em vez de um nome de domínio legítimo registrado");
      }

      // 4. Subdomain spoofing / Brand name in domain mismatch
      for (const brand of KNOWN_BRANDS) {
        if (domain.includes(brand)) {
          // Check if it's the official domain
          const isOfficial = domain.endsWith(`.${brand}.com.br`) || 
                             domain.endsWith(`.${brand}.com`) || 
                             domain.endsWith(`.${brand}.gov.br`) ||
                             domain === `${brand}.com.br` ||
                             domain === `${brand}.com` ||
                             domain === `${brand}.gov.br`;

          if (!isOfficial) {
            reasons.push(`Uso indevido do nome da marca/empresa "${brand.toUpperCase()}" em domínio não oficial (${domain})`);
          }
        }
      }

      // 5. Excessive hyphens or subdomains
      const hyphens = (domain.match(/-/g) || []).length;
      if (hyphens >= 2) {
        reasons.push("Nome de domínio com múltiplos hífens tentando imitar uma URL legítima");
      }

      results.push({
        url: match,
        domain,
        isSuspiciousDomain: reasons.length > 0,
        reasons,
      });
    } catch {
      // Invalid URL syntax
    }
  }

  return results;
}
