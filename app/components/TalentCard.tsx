"use client";

import { useState } from "react";
import type { Agent } from "./types";

/* ── Helpers ── */

function getFallbackThumbnail(url?: string): string | null {
  if (!url) return null;

  // Google Drive video thumbnail
  if (url.includes("drive.google.com")) {
    const match = url.match(/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
    }
  }

  // YouTube video thumbnail
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const match = url.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  }

  return null;
}

/* ── Thumbnail overlay with play button ── */

function CardThumbnail({
  agent,
  onClick,
}: {
  agent: Agent;
  onClick: () => void;
}) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const thumbnailUrl = agent.thumbnailUrl || getFallbackThumbnail(agent.loomUrl);

  const initials = agent.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const placeholder = (
    <div className="absolute inset-0 bg-gradient-to-br from-[#5E26DF] via-[#7C3AED] to-[#4E1DC0] flex items-center justify-center overflow-hidden">
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Decorative glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#F5B800]/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />

      {/* Initials circle */}
      <div className="relative flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-white tracking-wide">
            {initials}
          </span>
        </div>
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/40">
          Video
        </span>
      </div>
    </div>
  );

  if (!agent.loomUrl && !thumbnailUrl) return placeholder;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Watch introduction video for ${agent.name}`}
      className="group absolute inset-0 w-full h-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5E26DF]"
    >
      {thumbnailUrl && !thumbFailed ? (
        <img
          src={thumbnailUrl}
          alt={`${agent.name} video thumbnail`}
          loading="lazy"
          onError={() => setThumbFailed(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        placeholder
      )}

      {/* Hover overlay */}
      <span className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300" />

      {/* Play button with pulse */}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="relative">
          <span className="absolute inset-0 rounded-full bg-white/30 animate-pulse-ring" />
          <span className="relative w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:scale-110 group-hover:shadow-2xl">
            <svg
              className="w-6 h-6 text-[#5E26DF] translate-x-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </span>
    </button>
  );
}

/* ── Main card ── */

export default function TalentCard({
  agent,
  index,
  onWatchVideo,
  onMoreInfo,
  onHire,
}: {
  agent: Agent;
  index: number;
  onWatchVideo: (agent: Agent) => void;
  onMoreInfo: (agent: Agent) => void;
  onHire: (agent: Agent) => void;
}) {
  const stagger = `stagger-${Math.min(index + 1, 9)}`;

  return (
    <div
      className={`group/card bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100/80 flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 animate-fade-in-up opacity-0 ${stagger}`}
    >
      {/* Video thumbnail */}
      <div className="relative w-full pt-[56.25%] bg-slate-100 overflow-hidden">
        <CardThumbnail agent={agent} onClick={() => onWatchVideo(agent)} />
        
        {/* Rate Badge at Top Right */}
        {agent.clientRate && (
          <div className="absolute top-2.5 right-2.5 md:top-3 md:right-3 z-10 max-w-[calc(100%-1.25rem)]">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-emerald-700 text-xs font-bold shadow-sm border border-emerald-100/50">
              <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ${agent.clientRate}/hr
            </span>
          </div>
        )}
      </div>

      {/* Info + actions */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 mb-1">{agent.name}</h3>

        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5E26DF]/8 text-[#5E26DF] text-xs font-semibold w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5E26DF]" />
            {agent.role}
          </span>
        </div>

        {/* Links */}
        <div className="mt-4 flex flex-col gap-2.5">
          {/* Watch link */}
          {agent.loomUrl && (
            <button
              onClick={() => onWatchVideo(agent)}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#5E26DF] transition-colors group/link"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch introduction
              <svg
                className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* More info link */}
          <button
            onClick={() => onMoreInfo(agent)}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#5E26DF] transition-colors group/link"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Experiences & Info
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Hire Now button */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <button
            onClick={() => onHire(agent)}
            className="w-full bg-[#5E26DF] hover:bg-[#4E1DC0] text-white px-4 py-3 rounded-xl font-semibold transition-colors flex justify-center items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5E26DF]"
          >
            Hire Now <span>&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
