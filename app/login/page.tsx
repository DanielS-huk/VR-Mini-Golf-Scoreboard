import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { login } from "./actions";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const authenticated = await isAdminAuthenticated();

  if (authenticated) {
    redirect("/");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const nextPath =
    resolvedSearchParams?.next && resolvedSearchParams.next.startsWith("/")
      ? resolvedSearchParams.next
      : "/";

  return (
    <main className="page-shell">
      <LoginForm action={login} nextPath={nextPath} />
    </main>
  );
}
