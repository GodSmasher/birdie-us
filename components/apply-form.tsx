'use client';

import { useState, type FormEvent } from 'react';

export default function ApplyForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-2xl font-extrabold text-white mb-2">Application received!</h3>
        <p className="text-white/50">We&apos;ll get back to you within 48 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto text-left space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-white/60 mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15]/50"
            placeholder="John"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-white/60 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15]/50"
            placeholder="Doe"
          />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white/60 mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15]/50"
          placeholder="john@solarpro.com"
        />
      </div>
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-white/60 mb-1">
          Company
        </label>
        <input
          type="text"
          id="company"
          name="company"
          className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15]/50"
          placeholder="SolarPro Inc."
        />
      </div>
      <div>
        <label htmlFor="experience" className="block text-sm font-medium text-white/60 mb-1">
          Solar experience
        </label>
        <textarea
          id="experience"
          name="experience"
          rows={3}
          className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15]/50 resize-none"
          placeholder="Tell us about your background in solar sales..."
        />
      </div>
      <button
        type="submit"
        className="w-full py-3.5 rounded-full bg-[#FACC15] text-[#1a1a1a] font-bold text-lg hover:bg-[#fbbf24] transition"
      >
        Submit Application →
      </button>
      <p className="text-center text-white/30 text-xs">
        Or email directly: sarah@birdiesolar.com
      </p>
    </form>
  );
}
