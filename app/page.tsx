"use client";

import { useState } from "react";

import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/Chat/ChatMessage";
import ChatInput from "@/components/Chat/ChatInput";

import {
  ChatMessage as ChatMessageType,
  TicketResponse,
} from "@/types/chat";


export default function Home() {

  const [messages, setMessages] =
    useState<ChatMessageType[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [ticketId, setTicketId] =
    useState<string | null>(null);

  const [finished, setFinished] =
    useState(false);


  const pushMessage = (
    message: Omit<ChatMessageType, "id">
  ) => {

    setMessages((previous) => [
      ...previous,
      {
        ...message,
        id: crypto.randomUUID(),
      },
    ]);
  };


  const handleResponse = (
    data: TicketResponse
  ) => {

    // --------------------------------------------------------
    // CLASSIFICATION
    // --------------------------------------------------------

    if (data.classification) {

      pushMessage({
        role: "assistant",
        kind: "classification",
        classification: data.classification,
      });
    }


    // --------------------------------------------------------
    // DIAGNOSTIC
    // --------------------------------------------------------

    if (data.diagnostic) {

      pushMessage({
        role: "assistant",
        kind: "diagnostic",
        diagnostic: data.diagnostic,
      });
    }


    // --------------------------------------------------------
    // QUESTION
    // --------------------------------------------------------

    if (data.question) {

      pushMessage({
        role: "assistant",
        kind: "question",
        content: data.question,
        questionNumero:
          data.question_numero,
        maxQuestions:
          data.max_questions,
      });

      return;
    }


    // --------------------------------------------------------
    // RESULTAT FINAL
    // --------------------------------------------------------

    if (
      data.etape === "termine" ||
      data.action ||
      data.reponse ||
      data.sources
    ) {

      pushMessage({
        role: "assistant",
        kind: "result",
        result: data,
      });

      setFinished(true);
    }
  };


  const handleSend = async (content: string) => {
    pushMessage({
      role: "user",
      kind: "user_text",
      content,
    });

    setIsLoading(true);

    try {
      let response: Response;

      // ====================================================
      // NOUVEAU TICKET
      // ====================================================

      if (!ticketId) {
        response = await fetch("/api/ticket", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            texte: content,
          }),
        });
      }

      // ====================================================
      // RÉPONSE À UNE QUESTION
      // ====================================================

      else {
        response = await fetch(
          `/api/ticket/${ticketId}/message`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: content,
            }),
          }
        );
      }

      // ====================================================
      // LIRE D'ABORD LA RÉPONSE COMME TEXTE
      // ====================================================

      const rawResponse = await response.text();

      console.log(
        "[Frontend] HTTP status :",
        response.status
      );

      console.log(
        "[Frontend] Réponse brute :",
        rawResponse
      );

      // ====================================================
      // VÉRIFIER SI C'EST BIEN DU JSON
      // ====================================================

      let data: TicketResponse;

      try {
        data = JSON.parse(rawResponse);
      } catch {
        throw new Error(
          `Le serveur a retourné une réponse non JSON ` +
          `(HTTP ${response.status}). ` +
          `Réponse : ${rawResponse.slice(0, 300)}`
        );
      }

      // ====================================================
      // ERREUR HTTP
      // ====================================================

      if (!response.ok) {
        throw new Error(
          data.error ??
          "Erreur du serveur."
        );
      }

      // ====================================================
      // ID DU TICKET
      // ====================================================

      if (!ticketId && data.id_ticket) {
        setTicketId(data.id_ticket);
      }

      // ====================================================
      // TRAITEMENT DE LA RÉPONSE
      // ====================================================

      handleResponse(data);

    } catch (error) {

      console.error(
        "[Frontend] Erreur :",
        error
      );

      pushMessage({
        role: "assistant",
        kind: "error",
        content:
          error instanceof Error
            ? error.message
            : "Une erreur inconnue est survenue.",
      });

    } finally {

      setIsLoading(false);
    }
  };


  const handleNewConversation =
    () => {

      setMessages([]);

      setTicketId(null);

      setFinished(false);
    };


  return (

    <div className="flex h-screen bg-[#F4F6F7]">

      <Sidebar
        onNewConversation={
          handleNewConversation
        }
      />


      <main className="flex flex-1 flex-col">

        <div className="flex-1 overflow-y-auto p-6">

          <div className="mx-auto max-w-3xl">

            {messages.length === 0 && (

              <div className="mt-24 text-center">

                <h2 className="text-2xl font-semibold text-[#1C2530]">
                  Bonjour 👋
                </h2>

                <p className="mt-2 text-sm text-[#8A93A0]">
                  Décrivez votre problème
                  informatique pour commencer.
                </p>

              </div>
            )}


            {messages.map(
              (message) => (

                <ChatMessage
                  key={message.id}
                  message={message}
                />

              )
            )}

          </div>

        </div>


        {!finished && (

          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            placeholder={
              ticketId
                ? "Répondez à la question..."
                : "Décrivez votre problème..."
            }
          />

        )}

      </main>

    </div>
  );
}