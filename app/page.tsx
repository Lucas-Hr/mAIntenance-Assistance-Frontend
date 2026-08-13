"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { ChatMessage as ChatMessageType, Diagnostic } from "@/types/chat";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Diagnostic en cours de complétion (null = pas de ticket actif / en attente d'un nouveau ticket)
  const [diagnosticEnCours, setDiagnosticEnCours] = useState<Diagnostic | null>(null);

  const pushMessage = (msg: Omit<ChatMessageType, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: crypto.randomUUID() }]);
  };

  const handleSend = async (content: string) => {
    pushMessage({ role: "user", kind: "user_text", content });
    setIsLoading(true);

    try {
      if (!diagnosticEnCours) {
        // ===== Nouveau ticket =====
        const res = await fetch("/api/ticket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texte: content }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error ?? "Erreur lors de la classification.");
        }

        const data = await res.json();

        pushMessage({
          role: "assistant",
          kind: "comprehension",
          comprehension: data.comprehension,
        });

        if (data.complet) {
          pushMessage({ role: "assistant", kind: "diagnostic_final", diagnostic: data.diagnostic });
          setDiagnosticEnCours(null);
        } else {
          pushMessage({ role: "assistant", kind: "question", content: data.question });
          setDiagnosticEnCours(data.diagnostic);
        }
      } else {
        // ===== Réponse à une question de diagnostic en cours =====
        const res = await fetch("/api/diagnostic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ diagnostic: diagnosticEnCours, reponse_utilisateur: content }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error ?? "Erreur lors de la mise à jour du diagnostic.");
        }

        const data = await res.json();

        if (data.complet) {
          pushMessage({ role: "assistant", kind: "diagnostic_final", diagnostic: data.diagnostic });
          setDiagnosticEnCours(null);
        } else {
          pushMessage({ role: "assistant", kind: "question", content: data.question });
          setDiagnosticEnCours(data.diagnostic);
        }
      }
    } catch (err) {
      pushMessage({ role: "assistant", kind: "error", content: (err as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setDiagnosticEnCours(null);
  };

  return (
    <div className="flex h-screen bg-[#F4F6F7]">
      <Sidebar onNewConversation={handleNewConversation} />

      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-6 bg-[#F4F6F7] bg-[radial-gradient(circle,_#E1E5E8_1px,_transparent_1px)] bg-[length:24px_24px]">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 && (
              <p className="text-center text-[#A1A9B3] mt-20 text-sm">
                Décrivez votre problème pour commencer.
              </p>
            )}

            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        </div>

        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          placeholder={diagnosticEnCours ? "Répondez à la question ci-dessus…" : "Décrivez votre problème…"}
        />
      </div>
    </div>
  );
}