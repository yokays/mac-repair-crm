import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mac Place — Réparation Mac",
  description: "Suivi de réparation Mac — Envoi postal & atelier local",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-white text-apple-dark">{children}</body>
    </html>
  );
}
