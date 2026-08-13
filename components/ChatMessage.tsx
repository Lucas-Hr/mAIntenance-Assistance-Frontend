import { ChatMessage as ChatMessageType } from "@/types/chat";

interface Props {
  message: ChatMessageType;
}

const PRIORITE_STYLES: Record<string, string> = {
  critique: "bg-[#C1502E]/10 text-[#C1502E] border-[#C1502E]/30",
  haute: "bg-[#D98E2B]/10 text-[#D98E2B] border-[#D98E2B]/30",
  moyenne: "bg-[#0E7C86]/10 text-[#0E7C86] border-[#0E7C86]/30",
  basse: "bg-[#8A93A0]/10 text-[#8A93A0] border-[#8A93A0]/30",
};

const CHAMPS_LABELS: Record<string, string> = {
  utilisateur_concerne: "Utilisateur concerné",
  equipement: "Équipement",
  application_service: "Application / service",
  symptomes: "Symptômes",
  moment_apparition: "Moment d'apparition",
  impact_activite: "Impact sur l'activité",
  manipulations_effectuees: "Manipulations effectuées",
};

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex mb-5 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={
          isUser
            ? "max-w-[75%] rounded-2xl rounded-br-sm px-4 py-3 bg-[#0E7C86] text-white"
            : "max-w-[75%] rounded-2xl rounded-bl-sm px-5 py-4 bg-white border border-[#DCE1E6] shadow-sm"
        }
      >
        {/* Message utilisateur (texte brut ou réponse à une question) */}
        {isUser && message.content && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        )}

        {/* Carte de compréhension / classification */}
        {!isUser && message.kind === "comprehension" && message.comprehension && (
          <div className="space-y-3">
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-xs font-semibold uppercase tracking-wide text-[#8A93A0]">
              Classification du ticket
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-[#F4F6F7] text-[#1C2530] border-[#DCE1E6] font-[family-name:var(--font-geist-mono)]">
                {message.comprehension.categorie}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-[#F4F6F7] text-[#1C2530] border-[#DCE1E6]">
                Équipe : {message.comprehension.equipe}
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${
                  PRIORITE_STYLES[message.comprehension.priorite] ?? PRIORITE_STYLES.moyenne
                }`}
              >
                Priorité : {message.comprehension.priorite}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#1C2530]">
              {message.comprehension.urgence_justification}
            </p>
          </div>
        )}

        {/* Question posée par l'assistant pour compléter le diagnostic */}
        {!isUser && message.kind === "question" && message.content && (
          <p className="text-sm leading-relaxed text-[#1C2530]">
            {message.content}
          </p>
        )}

        {/* Diagnostic final complet */}
        {!isUser && message.kind === "diagnostic_final" && message.diagnostic && (
          <div className="space-y-3">
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-xs font-semibold uppercase tracking-wide text-[#0E7C86]">
              Diagnostic complet
            </h3>
            <dl className="space-y-2">
              {Object.entries(CHAMPS_LABELS).map(([champ, label]) => {
                const valeur = message.diagnostic![champ as keyof typeof message.diagnostic];
                const texte = Array.isArray(valeur) ? valeur.join(", ") || "—" : valeur || "—";
                return (
                  <div key={champ}>
                    <dt className="text-xs font-medium text-[#8A93A0]">{label}</dt>
                    <dd className="text-sm text-[#1C2530]">{texte}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        )}

        {/* Erreur */}
        {!isUser && message.kind === "error" && message.content && (
          <p className="text-sm leading-relaxed text-[#C1502E]">
            {message.content}
          </p>
        )}
      </div>
    </div>
  );
}