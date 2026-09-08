"use client";

import { useEffect, useRef } from "react";
import type { Agent } from "./types";

export default function MoreInfoModal({
  agent,
  onClose,
}: {
  agent: Agent;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    modalRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-backdrop-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="more-info-modal-title"
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-3xl shadow-xl max-w-xl w-full p-8 relative animate-modal-in outline-none max-h-[90vh] overflow-y-auto"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5E26DF]"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="mb-6">
          <h2 id="more-info-modal-title" className="text-2xl font-bold text-slate-800 pr-6">
            Experiences &amp; Info
          </h2>
          <p className="text-[#5E26DF] font-medium mt-1">{agent.name}</p>
        </div>

        <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-5 rounded-2xl border border-slate-100">
          {agent.hrInfo ? (
            agent.hrInfo
          ) : (
            <span className="italic text-slate-400">No additional information provided.</span>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#5E26DF] hover:bg-[#4E1DC0] text-white py-2.5 px-6 rounded-xl font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5E26DF]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
