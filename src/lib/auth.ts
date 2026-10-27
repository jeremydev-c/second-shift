import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { recentLoginFailures, recordLoginFailure } from "./store";

// One shared staff password (STAFF_PASSWORD) is enough for a 6-person team; the cookie holds an HMAC of it,
// so changing the password signs everyone out.
const COOKIE = "ss_staff";

function secret() {
  const pw = process.env.STAFF_PASSWORD;
  if (!pw || pw.length < 8) throw new Error("STAFF_PASSWORD must be set (8+ characters)");
  return pw;
}

function token() {
  return createHmac("sha256", secret()).update("second-shift-staff-v1").digest("base64url");
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function isStaff() {
  const c = (await cookies()).get(COOKIE)?.value;
  return !!c && same(c, token());
}

export async function requireStaff() {
  if (!(await isStaff())) redirect("/staff/login");
}

const MAX_FAILURES = 10;

// "locked" after too many wrong passwords from one address in the window, so the password can't be guessed by brute force.
export async function signIn(password: string): Promise<"ok" | "wrong" | "locked"> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if ((await recentLoginFailures(ip)) >= MAX_FAILURES) return "locked";
  if (!same(password, secret())) {
    await recordLoginFailure(ip);
    return "wrong";
  }
  (await cookies()).set(COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return "ok";
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}
