"use client";

import { useState, KeyboardEvent } from "react";

interface Props {
  onSend: (content: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, isLoading, placeholder = "Décrivez votre problème…" }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-[#DCE1E6] bg-white p-4">
      <div className="max-w-3xl mx-auto flex items-end gap-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-[#DCE1E6] bg-[#F4F6F7] px-4 py-3 text-sm text-[#1C2530] placeholder:text-[#A1A9B3] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/40 disabled:opacity-60"
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !value.trim()}
          className="shrink-0 rounded-xl bg-[#0E7C86] px-4 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-40"
        >
          {isLoading ? "…" : "Envoyer"}
        </button>
      </div>
    </div>
  );
}