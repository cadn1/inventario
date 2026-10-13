export const COOKIE = "despensa_auth";

// Token derivado de la contraseña; funciona en Edge (middleware) y Node.
export async function authToken() {
  const data = new TextEncoder().encode(
    `${process.env.APP_PASSWORD ?? ""}|${process.env.AUTH_SECRET ?? ""}`
  );
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
