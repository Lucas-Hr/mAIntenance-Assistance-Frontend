export interface Comprehension {
  categorie: string;
  equipe: string;
  priorite: "basse" | "moyenne" | "haute" | "critique";
  urgence_justification: string;
}

export interface Diagnostic {
  utilisateur_concerne: string;
  equipement: string;
  application_service: string;
  symptomes: string;
  moment_apparition: string;
  impact_activite: string;
  manipulations_effectuees: string[];
}

export type ChatMessageKind =
  | "user_text"
  | "comprehension"
  | "question"
  | "diagnostic_final"
  | "error";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  kind: ChatMessageKind;
  content?: string; // texte utilisateur brut, ou question posée par l'assistant
  comprehension?: Comprehension;
  diagnostic?: Diagnostic;
}