"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { items } from "@/db/schema";
import { COOKIE, authToken } from "@/lib/auth";

export async function login(formData: FormData) {
  if (formData.get("password") !== process.env.APP_PASSWORD) {
    redirect("/login?error=1");
  }
  (await cookies()).set(COOKIE, await authToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 90,
    path: "/",
  });
  redirect("/");
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect("/login");
}

export async function addItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await db.insert(items).values({
    name,
    barcode: String(formData.get("barcode") ?? "").replace(/\D/g, "") || null,
    location: String(formData.get("location") ?? "Alacena"),
    quantity: Math.max(0, Number(formData.get("quantity")) || 0),
    unit: String(formData.get("unit") ?? "unid"),
    minStock: Math.max(0, Number(formData.get("minStock")) || 0),
    expiresAt: String(formData.get("expiresAt") ?? "") || null,
  });
  revalidatePath("/");
  revalidatePath("/compras");
}

export async function adjust(formData: FormData) {
  const id = Number(formData.get("id"));
  const delta = Number(formData.get("delta"));
  await db
    .update(items)
    .set({ quantity: sql`GREATEST(${items.quantity} + ${delta}, 0)` })
    .where(eq(items.id, id));
  revalidatePath("/");
  revalidatePath("/compras");
}

export async function removeItem(formData: FormData) {
  await db.delete(items).where(eq(items.id, Number(formData.get("id"))));
  revalidatePath("/");
  revalidatePath("/compras");
}

export async function updateItem(formData: FormData) {
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;
  await db
    .update(items)
    .set({
      name,
      location: String(formData.get("location") ?? "Alacena"),
      quantity: Math.max(0, Number(formData.get("quantity")) || 0),
      unit: String(formData.get("unit") ?? "unid"),
      minStock: Math.max(0, Number(formData.get("minStock")) || 0),
      expiresAt: String(formData.get("expiresAt") ?? "") || null,
    })
    .where(eq(items.id, id));
  revalidatePath("/");
  revalidatePath("/compras");
  redirect("/");
}
export async function lookupBarcode(code: string) {
  const clean = code.replace(/\D/g, "");
  if (!clean) return { kind: "none" as const };

  const [mine] = await db.select().from(items).where(eq(items.barcode, clean));
  if (mine) {
    return {
      kind: "mine" as const,
      item: { id: mine.id, name: mine.name, quantity: mine.quantity, unit: mine.unit },
    };
  }

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${clean}.json?fields=product_name,product_name_es,brands`,
      { headers: { "User-Agent": "Despensa/0.1 (uso personal)" }, cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const name = [p.product_name_es || p.product_name, String(p.brands ?? "").split(",")[0]]
          .filter(Boolean)
          .join(" - ");
        if (name) return { kind: "off" as const, name };
      }
    }
  } catch {
    // Si falla la consulta externa, se sigue como "no encontrado".
  }
  return { kind: "none" as const };
}