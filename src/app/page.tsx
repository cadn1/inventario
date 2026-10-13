import { asc } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { items, LOCATIONS, UNITS, type Item } from "@/db/schema";
import { adjust, removeItem } from "./actions";
import AddForm from "./AddForm";

export const dynamic = "force-dynamic";

function daysLeft(expiresAt: string | null) {
  if (!expiresAt) return null;
  const today = new Date(new Date().toDateString()).getTime();
  return Math.round((new Date(expiresAt + "T00:00:00").getTime() - today) / 86400000);
}

function Row({ item }: { item: Item }) {
  const days = daysLeft(item.expiresAt);
  const low = item.quantity <= item.minStock;
  const btn = "h-11 w-11 rounded-lg border border-line bg-paper text-xl active:bg-line";
  return (
    <li className="flex items-center gap-3 border-b border-line py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <Link href={`/editar/${item.id}`} className="block truncate font-medium underline decoration-line underline-offset-4">{item.name}</Link>
        <p className="text-sm text-muted">
          {low && <span className="text-alert">Stock bajo · </span>}
          mín. {item.minStock} {item.unit}
          {days !== null && (
            <span className={days < 0 ? " text-alert" : days <= 7 ? " text-amber" : ""}>
              {" · "}
              {days < 0 ? `venció hace ${-days} d` : days === 0 ? "vence hoy" : `vence en ${days} d`}
            </span>
          )}
        </p>
      </div>
      <form action={adjust}>
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="delta" value="-1" />
        <button className={btn} aria-label={`Quitar uno de ${item.name}`}>−</button>
      </form>
      <span className="w-14 text-center tabular-nums">
        <b className="text-lg">{item.quantity}</b> <span className="text-xs text-muted">{item.unit}</span>
      </span>
      <form action={adjust}>
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="delta" value="1" />
        <button className={btn} aria-label={`Agregar uno de ${item.name}`}>+</button>
      </form>
      <form action={removeItem}>
        <input type="hidden" name="id" value={item.id} />
        <button className="px-1 text-muted" aria-label={`Eliminar ${item.name}`}>✕</button>
      </form>
    </li>
  );
}

export default async function Home() {
  const all = await db.select().from(items).orderBy(asc(items.name));
  const expiring = all
    .filter((i) => i.quantity > 0 && daysLeft(i.expiresAt) !== null && daysLeft(i.expiresAt)! <= 7)
    .sort((a, b) => a.expiresAt!.localeCompare(b.expiresAt!));

  return (
    <div className="flex flex-col gap-8">
      <AddForm locations={[...LOCATIONS]} units={[...UNITS]} />

      {expiring.length > 0 && (
        <section>
          <h2 className="mb-1 text-lg font-semibold text-amber">Por vencer</h2>
          <ul className="rounded-xl border border-line bg-card px-4">
            {expiring.map((i) => <Row key={i.id} item={i} />)}
          </ul>
        </section>
      )}

      {LOCATIONS.map((loc) => {
        const list = all.filter((i) => i.location === loc);
        return (
          <section key={loc}>
            <h2 className="mb-1 text-lg font-semibold">{loc}</h2>
            {list.length === 0 ? (
              <p className="text-sm text-muted">Aún no hay productos aquí.</p>
            ) : (
              <ul className="rounded-xl border border-line bg-card px-4">
                {list.map((i) => <Row key={i.id} item={i} />)}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}