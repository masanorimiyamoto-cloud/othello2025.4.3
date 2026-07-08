import { createHash, timingSafeEqual } from "node:crypto";
export const AUTH_COOKIE = "my_items_auth";
export function authToken(pin = process.env.APP_PIN ?? "") { return createHash("sha256").update(`my-items:${pin}`).digest("hex"); }
export function isValidToken(value?: string) {
  const expected = authToken();
  if (!value || !process.env.APP_PIN || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}
