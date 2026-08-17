"use client";


interface Props {
  onNewConversation?: () => void;
}


export default function Sidebar({
  onNewConversation,
}: Props) {

  return (

    <aside className="flex h-screen w-64 flex-col bg-[#141B22] text-white">

      <div className="border-b border-white/10 p-5">

        <h1 className="text-xl font-bold">
          mAIntenance
        </h1>

        <p className="text-sm text-white/40">
          Assistance intelligente
        </p>

      </div>


      <nav className="flex-1 p-4">

        <button
          onClick={onNewConversation}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left transition-colors hover:border-[#0E7C86]/40 hover:bg-[#0E7C86]/20"
        >
          💬 Nouvelle conversation
        </button>

      </nav>


      <div className="border-t border-white/10 p-4 font-mono text-sm text-white/30">

        <p>
          Assistant de maintenance
        </p>

        <p>
          Version 1.0
        </p>

      </div>

    </aside>
  );
}