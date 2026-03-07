export const metadata = {
  title: "Connexion - Mac Place",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      {children}
    </div>
  );
}
