"use client";

import {
  ChatMessage as ChatMessageType,
  Classification,
  DiagnosticData,
  DiagnosticResult,
  Source,
  TicketResponse,
} from "@/types/chat";


// ============================================================
// PROPS
// ============================================================

interface Props {
  message: ChatMessageType;
}


// ============================================================
// UTILITAIRES
// ============================================================

function formatScore(score?: number): string {
  if (typeof score !== "number") {
    return "N/A";
  }

  return score.toFixed(4);
}


function formatConfidence(confidence?: number): string {
  if (typeof confidence !== "number") {
    return "N/A";
  }

  return `${(confidence * 100).toFixed(0)} %`;
}


function isFilled(value?: string | null): boolean {
  return Boolean(value && value.trim());
}


// ============================================================
// CLASSIFICATION
// ============================================================

function ClassificationBlock({
  classification,
}: {
  classification?: Classification;
}) {
  if (!classification) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <h3 className="mb-5 text-lg font-semibold text-[#1C2530]">
        Classification
      </h3>

      <div className="space-y-4">

        <div>
          <p className="text-sm font-semibold text-[#6B7280]">
            Catégorie
          </p>

          <p className="mt-1 font-medium text-[#374151]">
            {classification.categorie || "Non renseignée"}
          </p>
        </div>


        <div>
          <p className="text-sm font-semibold text-[#6B7280]">
            Équipe
          </p>

          <p className="mt-1 font-medium text-[#374151]">
            {classification.equipe || "Non renseignée"}
          </p>
        </div>


        <div>
          <p className="text-sm font-semibold text-[#6B7280]">
            Priorité
          </p>

          <p className="mt-1 font-medium text-[#374151]">
            {classification.priorite || "Non renseignée"}
          </p>
        </div>


        {isFilled(classification.urgence_justification) && (
          <div>

            <p className="text-sm font-semibold text-[#6B7280]">
              Justification
            </p>

            <p className="mt-1 leading-6 text-[#374151]">
              {classification.urgence_justification}
            </p>

          </div>
        )}

      </div>
    </div>
  );
}


// ============================================================
// DIAGNOSTIC
// ============================================================

function DiagnosticBlock({
  diagnostic,
}: {
  diagnostic?: DiagnosticResult;
}) {
  if (!diagnostic) {
    return null;
  }

  const data: DiagnosticData =
    diagnostic.diagnostic ?? {};

  const fields = [
    {
      label: "Utilisateur concerné",
      value: data.utilisateur_concerne,
    },
    {
      label: "Équipement",
      value: data.equipement,
    },
    {
      label: "Application / service",
      value: data.application_service,
    },
    {
      label: "Symptômes",
      value: data.symptomes,
    },
    {
      label: "Moment d'apparition",
      value: data.moment_apparition,
    },
    {
      label: "Impact sur l'activité",
      value: data.impact_activite,
    },
    {
      label: "Manipulations effectuées",
      value:
        Array.isArray(data.manipulations_effectuees)
          ? data.manipulations_effectuees.join(", ")
          : data.manipulations_effectuees,
    },
  ];

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="mb-5 flex items-center justify-between">

        <h3 className="text-lg font-semibold text-[#1C2530]">
          {diagnostic.statut === "complete"
            ? "Diagnostic"
            : "Diagnostic en cours"}
        </h3>

        {typeof diagnostic.confiance === "number" && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            Confiance : {formatConfidence(diagnostic.confiance)}
          </span>
        )}

      </div>


      <div className="space-y-4">

        {fields.map((field) => {

          const value =
            field.value &&
            String(field.value).trim()
              ? String(field.value)
              : "Non renseigné";

          return (
            <div key={field.label}>

              <p className="text-sm font-semibold text-[#6B7280]">
                {field.label}
              </p>

              <p
                className={
                  value === "Non renseigné"
                    ? "mt-1 text-sm italic text-gray-400"
                    : "mt-1 leading-6 text-[#374151]"
                }
              >
                {value}
              </p>

            </div>
          );
        })}

      </div>
    </div>
  );
}


// ============================================================
// SOURCE RAG
// ============================================================

function SourceCard({
  source,
  index,
}: {
  source: Source;
  index: number;
}) {
  const passage =
    source.passage ??
    source.content ??
    source.texte;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-sm font-semibold text-[#1C2530]">
            {index}.{" "}
            {source.title ||
              source.document_id ||
              "Source documentaire"}
          </p>

          {source.document_id && (
            <p className="mt-1 text-xs text-gray-500">
              Document : {source.document_id}
            </p>
          )}

        </div>


        {typeof source.score === "number" && (
          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#374151] shadow-sm">
            Score : {formatScore(source.score)}
          </span>
        )}

      </div>


      {source.section && (
        <div className="mt-3">

          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Section
          </p>

          <p className="mt-1 text-sm leading-5 text-[#374151]">
            {source.section}
          </p>

        </div>
      )}


      {source.organization && (
        <div className="mt-3">

          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Organisation
          </p>

          <p className="mt-1 text-sm text-[#374151]">
            {source.organization}
          </p>

        </div>
      )}


      {source.chunk_id && (
        <div className="mt-3">

          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Passage
          </p>

          <p className="mt-1 break-all text-xs text-gray-500">
            {source.chunk_id}
          </p>

        </div>
      )}


      {passage && (
        <div className="mt-3 rounded-lg bg-white p-3">

          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Contenu retrouvé
          </p>

          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#374151]">
            {passage}
          </p>

        </div>
      )}


      {source.source_url && (
        <div className="mt-3">

          <a
            href={source.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Consulter la source
          </a>

        </div>
      )}

    </div>
  );
}


// ============================================================
// RESULTAT FINAL
// ============================================================

function ResultBlock({
  result,
}: {
  result?: TicketResponse;
}) {
  if (!result) {
    return null;
  }

  const sources = result.sources ?? [];

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <h3 className="text-lg font-semibold text-[#1C2530]">
        Résultat du diagnostic
      </h3>


      {/* ---------------------------------------------------- */}
      {/* REPONSE */}
      {/* ---------------------------------------------------- */}

      {result.reponse && (
        <div className="mt-5">

          <p className="text-sm font-semibold text-[#6B7280]">
            Résolution proposée
          </p>

          <p className="mt-2 whitespace-pre-wrap leading-7 text-[#374151]">
            {result.reponse}
          </p>

        </div>
      )}


      {/* ---------------------------------------------------- */}
      {/* CONFIANCE RAG */}
      {/* ---------------------------------------------------- */}

      {typeof result.rag_confiance === "number" && (
        <div className="mt-5 rounded-xl bg-gray-50 p-4">

          <p className="text-sm font-semibold text-[#6B7280]">
            Confiance RAG
          </p>

          <p className="mt-1 text-xl font-semibold text-[#1C2530]">
            {formatConfidence(result.rag_confiance)}
          </p>

        </div>
      )}


      {/* ---------------------------------------------------- */}
      {/* SOURCES */}
      {/* ---------------------------------------------------- */}

      <div className="mt-6">

        <div className="mb-3 flex items-center justify-between">

          <h4 className="text-base font-semibold text-[#1C2530]">
            Sources consultées
          </h4>

          <span className="text-xs text-gray-500">
            {sources.length} résultat
            {sources.length > 1 ? "s" : ""}
          </span>

        </div>


        {sources.length === 0 ? (

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">

            <p className="text-sm text-yellow-800">
              Aucune source documentaire satisfaisante a été retrouvée.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {sources.map((source, index) => (
              <SourceCard
                key={
                  source.chunk_id ??
                  source.document_id ??
                  `${index}`
                }
                source={source}
                index={index + 1}
              />
            ))}

          </div>
        )}

      </div>


      {/* ---------------------------------------------------- */}
      {/* DECISION */}
      {/* ---------------------------------------------------- */}

      <div className="mt-6 border-t border-gray-200 pt-5">

        <h4 className="text-base font-semibold text-[#1C2530]">
          Décision
        </h4>


        <div className="mt-3 space-y-3">

          {result.action && (
            <div>

              <p className="text-sm font-semibold text-[#6B7280]">
                Action
              </p>

              <p className="mt-1 font-medium text-[#374151]">
                {result.action}
              </p>

            </div>
          )}


          {typeof result.validation_humaine_requise ===
            "boolean" && (
            <div>

              <p className="text-sm font-semibold text-[#6B7280]">
                Validation humaine
              </p>

              <p className="mt-1 text-[#374151]">
                {result.validation_humaine_requise
                  ? "Requise"
                  : "Non requise"}
              </p>

            </div>
          )}


          {result.justification && (
            <div>

              <p className="text-sm font-semibold text-[#6B7280]">
                Justification
              </p>

              <p className="mt-1 leading-6 text-[#374151]">
                {result.justification}
              </p>

            </div>
          )}

        </div>

      </div>


      {/* ---------------------------------------------------- */}
      {/* OBSERVABILITE */}
      {/* ---------------------------------------------------- */}

      {typeof result.latence_ms === "number" && (
        <div className="mt-5 border-t border-gray-100 pt-4">

          <p className="text-xs text-gray-400">
            Latence totale :{" "}
            {result.latence_ms.toFixed(0)} ms
          </p>

        </div>
      )}

    </div>
  );
}


// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function ChatMessage({
  message,
}: Props) {

  // ----------------------------------------------------------
  // MESSAGE UTILISATEUR
  // ----------------------------------------------------------

  if (message.kind === "user_text") {

    return (
      <div className="mb-4 flex justify-end">

        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-[#1C2530] px-4 py-3 text-sm leading-6 text-white shadow-sm">
          {message.content}
        </div>

      </div>
    );
  }


  // ----------------------------------------------------------
  // MESSAGE ERREUR
  // ----------------------------------------------------------

  if (message.kind === "error") {

    return (
      <div className="mb-4">

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">

          <p className="text-sm font-semibold text-red-700">
            Erreur
          </p>

          <p className="mt-1 whitespace-pre-wrap text-sm text-red-600">
            {message.content}
          </p>

        </div>

      </div>
    );
  }


  // ----------------------------------------------------------
  // MESSAGE ASSISTANT
  // ----------------------------------------------------------

  return (
    <div className="mb-6">

      {message.content && (
        <div className="mb-3 rounded-2xl bg-white p-4 text-sm leading-6 text-[#374151] shadow-sm">
          {message.content}
        </div>
      )}


      {message.kind === "classification" && (
        <ClassificationBlock
          classification={message.classification}
        />
      )}


      {message.kind === "diagnostic" && (
        <DiagnosticBlock
          diagnostic={message.diagnostic}
        />
      )}


      {message.kind === "question" && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <p className="text-sm font-semibold text-blue-700">
            Question de diagnostic
          </p>

          {typeof message.questionNumero === "number" && (
            <p className="mt-2 text-xs font-medium text-blue-500">
              Question {message.questionNumero}
              {typeof message.maxQuestions === "number"
                ? ` / ${message.maxQuestions}`
                : ""}
            </p>
          )}

          <p className="mt-3 leading-6 text-[#1C2530]">
            {message.content}
          </p>

        </div>
      )}


      {message.kind === "result" && (
        <ResultBlock
          result={message.result}
        />
      )}

    </div>
  );
}