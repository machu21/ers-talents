"use client";

import { useEffect } from "react";
import type { Agent } from "./types";

export default function VideoModal({
  agent,
  onClose,
}: {
  agent: Agent;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-backdrop-in"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Video for ${agent.name}`}
        className="relative w-full max-w-4xl animate-modal-in"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors rounded-full p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg
            className="w-6 h-6"
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

        {/* Video */}
        <div className="relative w-full pt-[56.25%] rounded-2xl overflow-hidden bg-black shadow-2xl">
          {agent.loomUrl ? (
            <iframe
              src={agent.loomUrl}
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
              title={`Introduction video for ${agent.name}`}
              className="absolute top-0 left-0 w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
              No video available
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-5 text-center">
          <h2 className="text-xl font-bold text-white">{agent.name}</h2>
          <p className="text-white/60 text-sm mt-1">{agent.role}</p>
        </div>
      </div>
    </div>
  );
}
