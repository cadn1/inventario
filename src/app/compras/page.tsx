import { asc, sql } from "drizzle-orm";
import { db } from "@/db";
import { items } from "@/db/schema";
import { adjust } from "../actions";

export const dynamic = "force-dynamic";

export default async function Compras() {
  const list = await db
    .select()
    .from(items)
    .where(sql`${items.quantity} <= ${items.minStock}`)
    .orderBy(asc(items.name));

  return (
    <section>
      <h1 className="mb-1 text-2xl font-semibold">Lista de compras</h1>
      <p className="mb-4 text-sm text-muted">Productos en o bajo su stock mínimo.</p>
      {list.length === 0 ? (
        <p className="text-muted">Todo está abastecido. No hay nada que comprar.</p>
      ) : (
        <ul className="rounded-xl border border-line bg-card px-4">
          {list.map((i) => (
            <li key={i.id} className="flex items-center justify-between border-b border-line py-3 last:border-0">
              <div>
                <p className="font-medium">{i.name}</p>
                <p className="text-sm text-muted">
                  Tienes {i.quantity} {i.unit} · mínimo {i.minStock}
                </p>
              </div>
              <form action={adjust}>
                <input type="hidden" name="id" value={i.id} />
                <input type="hidden" name="delta" value={Math.max(i.minStock - i.quantity, 1)} />
                <button className="rounded-lg bg-jar px-3 py-2 text-sm font-medium text-white">
                  Ya lo compré
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
