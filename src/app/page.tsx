"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [trackingCode, setTrackingCode] = useState("");
  const [error, setError] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = trackingCode.trim();
    if (!code) {
      setError("Veuillez entrer votre code de suivi.");
      return;
    }
    router.push(`/suivi/${code}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Mac Place" className="h-8 w-8 rounded-lg object-contain" />
            <span className="font-semibold text-[#1d1d1f] text-lg tracking-tight">
              Mac Place
            </span>
          </div>
          <a
            href="/login"
            className="text-sm text-[#0071e3] hover:text-[#0077ed] font-medium transition-colors"
          >
            Espace admin
          </a>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-[#1d1d1f] tracking-tight leading-tight">
            Reparation Mac.<br />
            <span className="text-[#86868b]">Simplifiee.</span>
          </h1>
          <p className="mt-6 text-lg text-[#424245] max-w-xl mx-auto leading-relaxed">
            Service de reparation Mac professionnel. Envoi postal ou depot en atelier.
            Suivez votre reparation en temps reel.
          </p>
        </div>
      </section>

      {/* Tracking section */}
      <section className="pb-24 px-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-[#f5f5f7] rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-[#1d1d1f] text-center mb-2">
              Suivre ma reparation
            </h2>
            <p className="text-sm text-[#86868b] text-center mb-6">
              Entrez le code de suivi recu par email pour consulter l&apos;avancement de votre reparation.
            </p>

            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => { setTrackingCode(e.target.value); setError(""); }}
                  placeholder="Votre code de suivi..."
                  className="
                    block w-full rounded-xl border border-gray-300 px-4 py-3.5
                    text-base text-[#1d1d1f] placeholder:text-[#86868b]
                    bg-white
                    focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3]
                    transition-all duration-200
                  "
                />
                {error && (
                  <p className="text-sm text-red-600 mt-2">{error}</p>
                )}
              </div>
              <button
                type="submit"
                className="
                  w-full rounded-xl bg-[#0071e3] text-white font-medium
                  px-6 py-3.5 text-base
                  hover:bg-[#0077ed] active:bg-[#006edb]
                  transition-all duration-200
                  shadow-sm
                "
              >
                Suivre ma reparation
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-[#f5f5f7]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1d1d1f] text-center mb-12 tracking-tight">
            Notre service
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Postal */}
            <div className="text-center">
              <div className="h-14 w-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-7 w-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                Envoi postal
              </h3>
              <p className="text-sm text-[#86868b] leading-relaxed">
                Envoyez votre Mac par colis. Nous le reparons et vous le renvoyons. Suivi a chaque etape.
              </p>
            </div>

            {/* Local */}
            <div className="text-center">
              <div className="h-14 w-14 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-7 w-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                Depot en atelier
              </h3>
              <p className="text-sm text-[#86868b] leading-relaxed">
                Deposez votre Mac directement a notre atelier. Reparation rapide et suivi en ligne.
              </p>
            </div>

            {/* Suivi */}
            <div className="text-center">
              <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-7 w-7 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                Suivi en temps reel
              </h3>
              <p className="text-sm text-[#86868b] leading-relaxed">
                Suivez chaque etape de la reparation de votre Mac en ligne avec votre code de suivi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#1d1d1f] mb-4 tracking-tight">
            Contactez-nous
          </h2>
          <p className="text-[#86868b] mb-8">
            Des questions sur votre reparation ? Notre equipe est la pour vous aider.
          </p>
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 text-sm">
            <a
              href="mailto:noah.elkaim@gmail.com"
              className="flex items-center gap-2 text-[#0071e3] hover:text-[#0077ed] transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              noah.elkaim@gmail.com
            </a>
            <a
              href="tel:+33782712123"
              className="flex items-center gap-2 text-[#0071e3] hover:text-[#0077ed] transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              07 82 71 21 23
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="text-xs text-[#86868b]">
            Mac Place. Tous droits reserves.
          </p>
          <a
            href="/login"
            className="text-xs text-[#86868b] hover:text-[#424245] transition-colors"
          >
            Administration
          </a>
        </div>
      </footer>
    </div>
  );
}
