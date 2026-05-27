"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAnalyzeEmailPrompt = void 0;
const buildAnalyzeEmailPrompt = (params) => `Tu es un assistant support client. Analyse cet email et retourne UNIQUEMENT un JSON valide, sans texte avant ou après.

{
  "summary": "...",
  "category": "REFUND|DELIVERY_ISSUE|TECHNICAL|BILLING|OTHER",
  "priority": "HIGH|MEDIUM|LOW",
  "confidence": 0.0-1.0,
  "suggestedReply": "..."
}

Règles :
- summary : 1-2 phrases max, ton neutre
- category : la catégorie la plus pertinente parmi les valeurs données
- priority : HIGH si urgence/colère/perte financière, LOW si question simple, MEDIUM sinon
- confidence : ta confiance dans l'analyse (0.0 à 1.0)
- suggestedReply : réponse professionnelle complète, ton courtois, en français

Email :
De : ${params.fromName} <${params.fromEmail}>
Sujet : ${params.subject}
---
${params.body}`;
exports.buildAnalyzeEmailPrompt = buildAnalyzeEmailPrompt;
//# sourceMappingURL=analyze-email.prompt.js.map