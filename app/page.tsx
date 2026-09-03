"use client";

import { useState, useEffect, useCallback } from "react";

import type { Agent, ToastState } from "./components/types";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TalentCard from "./components/TalentCard";
import SkeletonCard from "./components/SkeletonCard";
import VideoModal from "./components/VideoModal";
import HireModal from "./components/HireModal";
import Toast from "./components/Toast";

export default function TalentPoolPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  const [videoAgent, setVideoAgent] = useState<Agent | null>(null);
  const [hireAgent, setHireAgent] = useState<Agent | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  /* ── Fetch agents ── */

  useEffect(() => {
    fetchAgents();
  }, []);

  /* ── Auto-dismiss toast ── */

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchAgents = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      if (data.agents) setAgents(data.agents);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter((agent) => {
    if (activeTab === "All") return true;
    return agent.stage.includes(activeTab);
  });

  /* ── Callbacks ── */

  const handleWatchVideo = useCallback((agent: Agent) => setVideoAgent(agent), []);
  const handleCloseVideo = useCallback(() => setVideoAgent(null), []);
  const handleHireClick = useCallback((agent: Agent) => setHireAgent(agent), []);
  const handleCloseHire = useCallback(() => setHireAgent(null), []);

  const handleHireSuccess = useCallback((agentName: string, agentId: string) => {
    setToast({
      type: "success",
      message: `Request sent — we'll be in touch about ${agentName}.`,
    });
    setAgents((prev) => prev.filter((a) => a.opportunityId !== agentId));
  }, []);

  /* ── Render ── */

  return (
    <div className="min-h-screen bg-[#F9FAFC] text-slate-800 font-sans pb-24">
      <Navbar talentCount={agents.length} loading={loading} />
      <Toast toast={toast} />
      <Hero activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-[1440px] mx-auto px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : loadError ? (
          <ErrorState onRetry={fetchAgents} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredAgents.map((agent, i) => (
                <TalentCard
                  key={agent.opportunityId}
                  agent={agent}
                  index={i}
                  onWatchVideo={handleWatchVideo}
                  onHire={handleHireClick}
                />
              ))}
            </div>

            {filteredAgents.length === 0 && (
              <EmptyState onReset={() => setActiveTab("All")} />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {videoAgent && <VideoModal agent={videoAgent} onClose={handleCloseVideo} />}
      {hireAgent && (
        <HireModal
          agent={hireAgent}
          onClose={handleCloseHire}
          onSuccess={handleHireSuccess}
        />
      )}
    </div>
  );
}

/* ── Inline small states ── */

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
      <svg
        className="mx-auto w-12 h-12 text-slate-300 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <p className="text-slate-700 font-semibold mb-1">
        We couldn&apos;t load available talent.
      </p>
      <p className="text-slate-500 text-sm mb-5">
        Check your connection and try again.
      </p>
      <button
        onClick={onRetry}
        className="bg-[#5E26DF] hover:bg-[#4E1DC0] text-white px-6 py-2.5 rounded-full font-medium transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
      <svg
        className="mx-auto w-12 h-12 text-slate-300 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
      <p className="text-slate-700 font-semibold mb-1">
        No talent in this category yet.
      </p>
      <p className="text-slate-500 text-sm mb-5">
        Try a different filter, or check back soon.
      </p>
      <button
        onClick={onReset}
        className="text-[#5E26DF] font-medium hover:underline"
      >
        View all talent
      </button>
    </div>
  );
}