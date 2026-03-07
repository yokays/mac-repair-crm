import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suivi de reparation - Mac Place",
  description: "Suivez l'avancement de votre reparation Mac en temps reel.",
};

export default function TrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[#d2d2d7]/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Mac Place" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-lg font-semibold text-[#1d1d1f] tracking-tight">
              Mac Place
            </span>
          </div>
          <span className="text-sm text-[#86868b]">Suivi de reparation</span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-6 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-[#d2d2d7]/40 bg-[#f5f5f7]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#86868b]">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#1d1d1f]">
                Mac Place
              </span>
              <span>&middot;</span>
              <span>Reparation Mac professionnelle</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="mailto:lucas.macbroker@gmail.com"
                className="hover:text-[#0071e3] transition-colors"
              >
                lucas.macbroker@gmail.com
              </a>
              <span>&middot;</span>
              <a
                href="tel:+33782712123"
                className="hover:text-[#0071e3] transition-colors"
              >
                07 82 71 21 23
              </a>
            </div>
          </div>
          <p className="text-center text-xs text-[#86868b]/60 mt-4">
            &copy; {new Date().getFullYear()} Mac Place. Tous droits
            reserves.
          </p>
        </div>
      </footer>
    </div>
  );
}
