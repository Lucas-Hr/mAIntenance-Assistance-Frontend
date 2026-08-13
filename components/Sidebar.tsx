"use client";

interface Props {
  onNewConversation?: () => void;
}

export default function Sidebar({ onNewConversation }: Props) {
  return (
    <aside className="w-64 h-screen bg-[#141B22] text-white flex flex-col">
      {/* Logo / titre */}
      <div className="p-5 border-b border-white/10">
        <h1 className="text-xl font-[family-name:var(--font-space-grotesk)] font-bold">
          mAIntenance
        </h1>
        <p className="text-sm text-white/40">
          Assistance intelligente
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <button
          onClick={onNewConversation}
          className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-[#0E7C86]/20 border border-white/10 hover:border-[#0E7C86]/40 transition-colors"
        >
          💬 Nouvelle conversation
        </button>
      </nav>

      {/* Informations */}
      <div className="p-4 border-t border-white/10 text-sm text-white/30 font-[family-name:var(--font-geist-mono)]">
        <p>Assistant de maintenance</p>
        <p>Version 1.0</p>
      </div>
    </aside>
  );
}