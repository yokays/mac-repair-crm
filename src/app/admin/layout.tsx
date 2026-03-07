import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ToastProvider } from "@/components/ui/Toast";
import Sidebar from "@/components/admin/Sidebar";

export const metadata = {
  title: "Admin - Mac Place",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#f5f5f7]">
        <Sidebar />
        <main className="lg:ml-[280px] min-h-screen">
          <div className="pt-18 lg:pt-8 px-4 pb-8 lg:px-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
