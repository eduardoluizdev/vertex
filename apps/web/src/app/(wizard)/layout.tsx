import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { VertexHubLogo } from "@/components/vertexhub-logo";
import { apiClient } from "@/lib/api";

export default async function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Check if user has companies to conditionally add back link
  const response = await apiClient("/v1/companies");
  const companies = response.ok ? await response.json() : [];
  const hasCompanies = companies.length > 0;

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 h-screen w-screen overflow-hidden text-slate-900 dark:text-slate-50">
      <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
        {hasCompanies ? (
          <Link
            href="/empresas"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Voltar ao início"
          >
            <VertexHubLogo />
          </Link>
        ) : (
          <>
            <VertexHubLogo />
          </>
        )}
      </div>
      <main className="flex-1 overflow-y-auto w-full">{children}</main>
    </div>
  );
}
