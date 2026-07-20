import { cookies } from "next/headers";
import crypto from "node:crypto";

const VOTER_ID_COOKIE = "voter_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function getOrCreateVoterId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VOTER_ID_COOKIE)?.value;

  if (existing) return existing;

  const id = crypto.randomUUID();
  cookieStore.set(VOTER_ID_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return id;
}

export function hashFallbackId(ip: string, userAgent: string): string {
  return crypto.createHash("sha256").update(`${ip}:${userAgent}`).digest("hex");
}
