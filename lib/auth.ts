import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

function getAdminUsername() {
  return process.env.ADMIN_USERNAME?.trim() ?? "";
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function getSessionSecret() {
  return process.env.SESSION_SECRET ?? "";
}

function toComparableDigest(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEqual(left: string, right: string) {
  const leftDigest = toComparableDigest(left);
  const rightDigest = toComparableDigest(right);

  return timingSafeEqual(leftDigest, rightDigest);
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function createSessionValue(username: string, secret: string) {
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const payload = `${username}:${expiresAt}`;
  const encodedPayload = toBase64Url(payload);
  const signature = sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

function readSessionValue(sessionValue: string, secret: string) {
  const [encodedPayload, signature] = sessionValue.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload, secret);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  let payload: string;

  try {
    payload = fromBase64Url(encodedPayload);
  } catch {
    return null;
  }

  const separatorIndex = payload.lastIndexOf(":");
  if (separatorIndex === -1) {
    return null;
  }

  const username = payload.slice(0, separatorIndex);
  const expiresAt = Number(payload.slice(separatorIndex + 1));

  if (!username || !Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return null;
  }

  return { username, expiresAt };
}

export function isAdminAuthConfigured() {
  return Boolean(getAdminUsername() && getAdminPassword() && getSessionSecret());
}

export async function isAdminAuthenticated() {
  if (!isAdminAuthConfigured()) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return false;
  }

  const session = readSessionValue(sessionCookie, getSessionSecret());
  return session?.username === getAdminUsername();
}

export async function requireAdmin(nextPath = "/login") {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    const destination = nextPath.startsWith("/login")
      ? nextPath
      : `/login?next=${encodeURIComponent(nextPath)}`;
    redirect(destination);
  }
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, createSessionValue(getAdminUsername(), getSessionSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function validateAdminCredentials(username: string, password: string) {
  if (!isAdminAuthConfigured()) {
    return false;
  }

  return safeEqual(username.trim(), getAdminUsername()) && safeEqual(password, getAdminPassword());
}
