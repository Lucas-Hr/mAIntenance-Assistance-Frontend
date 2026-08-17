// ============================================================
// TYPES CHAT
// ============================================================

export type MessageRole = "user" | "assistant";

export type ChatMessageKind =
  | "user_text"
  | "classification"
  | "diagnostic"
  | "question"
  | "result"
  | "error";


// ============================================================
// CLASSIFICATION
// ============================================================

export interface Classification {
  id_ticket?: string;
  texte_original?: string;
  categorie?: string;
  equipe?: string;
  priorite?: string;
  urgence_justification?: string;
}


// ============================================================
// DIAGNOSTIC
// ============================================================

export interface DiagnosticData {
  utilisateur_concerne?: string | null;
  equipement?: string | null;
  application_service?: string | null;
  symptomes?: string | null;
  moment_apparition?: string | null;
  impact_activite?: string | null;
  manipulations_effectuees?: string[] | null;
}

export interface DiagnosticResult {
  status?: string;
  diagnostic?: DiagnosticData;
  informations_manquantes?: string[];
  questions?: string[];
  confiance?: number;
  statut?: "complete" | "partial" | string;
}


// ============================================================
// SOURCES RAG
// ============================================================

export interface Source {
  chunk_id?: string;
  document_id?: string;
  title?: string;
  section?: string;
  score?: number;
  source_url?: string | null;
  organization?: string | null;

  // Si ton backend fournit le passage récupéré
  passage?: string | null;
  content?: string | null;
  texte?: string | null;
}


// ============================================================
// REPONSE BACKEND
// ============================================================

export interface TicketResponse {
  status?: string;

  id_ticket?: string;

  etape?: string;

  ticket?: string;

  classification?: Classification;

  diagnostic?: DiagnosticResult;

  question?: string;

  question_numero?: number;

  max_questions?: number;

  sources?: Source[];

  rag_confiance?: number;

  action?: string;

  validation_humaine_requise?: boolean;

  justification?: string;

  reponse?: string;

  latence_ms?: number;

  error?: string;

  detail?: string;
}


// ============================================================
// MESSAGE AFFICHÉ DANS LE CHAT
// ============================================================

export interface ChatMessage {
  id: string;

  role: MessageRole;

  kind: ChatMessageKind;

  content?: string;

  classification?: Classification;

  diagnostic?: DiagnosticResult;

  questionNumero?: number;

  maxQuestions?: number;

  result?: TicketResponse;
}