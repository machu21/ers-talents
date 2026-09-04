"use client";

import { useState, useRef, useEffect, forwardRef, useCallback } from "react";
import type { Agent } from "./types";

export default function HireModal({
  agent,
  onClose,
  onSuccess,
}: {
  agent: Agent;
  onClose: () => void;
  onSuccess: (agentName: string, agentId: string) => void;
}) {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    companyName: "",
    notes: "",
  });
  const [hpWebsite, setHpWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const handleDismiss = useCallback(() => {
    if (submitted) {
      onSuccess(agent.name, agent.opportunityId);
    }
    onClose();
  }, [submitted, agent.name, agent.opportunityId, onSuccess, onClose]);

  // Focus first field + escape-to-close
  useEffect(() => {
    if (!submitted) firstFieldRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [submitted, handleDismiss]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: agent.opportunityId,
          hp_website: hpWebsite,
          ...formData,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setSubmitted(true);
      } else if (res.status === 429) {
        setErrorMessage(
          data.error || "Too many requests submitted. Please wait a few minutes before trying again."
        );
      } else {
        setErrorMessage(
          data.error || "Failed to submit request. Please verify your details and try again."
        );
      }
    } catch (error) {
      console.error("Error submitting hire form:", error);
      setErrorMessage("Network connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-backdrop-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hire-modal-title"
        className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 relative animate-modal-in"
      >
        {/* Close */}
        <button
          type="button"
          onClick={handleDismiss}
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

        {submitted ? (
          /* ── Success view ── */
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6 animate-fade-in-up">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Request Sent!
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-2">
              Your request to hire{" "}
              <span className="font-semibold text-[#5E26DF]">
                {agent.name}
              </span>{" "}
              has been submitted successfully.
            </p>
            <p className="text-slate-400 text-sm mb-8">
              We&apos;ll be in touch shortly with next steps.
            </p>

            <button
              onClick={handleDismiss}
              className="w-full bg-[#5E26DF] hover:bg-[#4E1DC0] text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* ── Form view ── */
          <>
            <h2
              id="hire-modal-title"
              className="text-2xl font-bold mb-2 pr-6"
            >
              Request to hire
            </h2>
            <p className="text-slate-500 mb-6 text-sm">
              You&apos;re requesting to onboard{" "}
              <span className="font-bold text-[#5E26DF]">{agent.name}</span>.
              Add your details and we&apos;ll follow up shortly.
            </p>

            {errorMessage && (
              <div
                role="alert"
                className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2.5 animate-fade-in-up"
              >
                <svg
                  className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Anti-Bot Honeypot Field (invisible to humans, traps automated form-spammers) */}
              <div
                className="opacity-0 pointer-events-none absolute -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden"
                aria-hidden="true"
                tabIndex={-1}
              >
                <label htmlFor="hp_website">Leave this blank</label>
                <input
                  type="text"
                  id="hp_website"
                  name="hp_website"
                  value={hpWebsite}
                  onChange={(e) => setHpWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <Field
                ref={firstFieldRef}
                label="Your name"
                id="clientName"
                name="clientName"
                type="text"
                required
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Jane Doe"
              />
              <Field
                label="Work email"
                id="clientEmail"
                name="clientEmail"
                type="email"
                required
                value={formData.clientEmail}
                onChange={handleChange}
                placeholder="jane@company.com"
              />
              <Field
                label="Company name"
                id="companyName"
                name="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Acme Corp"
              />
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Scope / notes
                </label>
                <textarea
                  rows={3}
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#5E26DF] focus:ring-1 focus:ring-[#5E26DF] transition-colors text-sm"
                  placeholder="Tell us a bit about the tasks..."
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#5E26DF] hover:bg-[#4E1DC0] text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && (
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  )}
                  {isSubmitting ? "Sending..." : "Confirm hire"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Reusable input field ── */

const Field = forwardRef<
  HTMLInputElement,
  {
    label: string;
    id: string;
    name: string;
    type: string;
    required?: boolean;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
  }
>(function Field(
  { label, id, name, type, required, value, onChange, placeholder },
  ref
) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 mb-1"
      >
        {label}
      </label>
      <input
        ref={ref}
        required={required}
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#5E26DF] focus:ring-1 focus:ring-[#5E26DF] transition-colors text-sm"
        placeholder={placeholder}
      />
    </div>
  );
});
