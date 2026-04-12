"use server";

import { redirect } from "next/navigation";
import { clearAdminSession, createAdminSession, isAdminAuthConfigured, validateAdminCredentials } from "@/lib/auth";

export type LoginActionState = {
  error: string | null;
};

function invalidState(message: string): LoginActionState {
  return { error: message };
}

export async function login(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const username = formData.get("username");
  const password = formData.get("password");
  const next = formData.get("next");

  if (!isAdminAuthConfigured()) {
    return invalidState("Admin login is not configured yet.");
  }

  if (typeof username !== "string" || typeof password !== "string") {
    return invalidState("Enter your username and password.");
  }

  if (!validateAdminCredentials(username, password)) {
    return invalidState("Incorrect username or password.");
  }

  await createAdminSession();

  const nextPath =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  redirect(nextPath);
}

export async function logout() {
  await clearAdminSession();
  redirect("/");
}
