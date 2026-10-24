import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

export async function signIn(password: string) {
  if (!same(password, secret())) return false;
  (await cookies()).set(COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return true;
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}
