import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { items, LOCATIONS, UNITS } from "@/db/schema";
import { updateItem } from "../../actions";

export const dynamic = "force-dynamic";

export default async function Editar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item] = await db.select().from(items).where(eq(items.id, Number(id)));
  if (!item) notFound();

  const field = "mt-1 w-full rounded-lg border border-line bg-card px-3 py-3 text-ink";
  const label = "text-sm text-muted";

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Editar producto</h1>
      <form action={updateItem} className="grid grid-cols-2 gap-4">
        <input type="hidden" name="id" value={item.id} />
        <label className={`${label} col-span-2`}>
          Nombre
          <input name="name" required defaultValue={item.name} className={field} />
        </label>
        <label className={label}>
          Cantidad
          <input name="quantity" type="number" min="0" defaultValue={item.quantity} className={field} />
        </label>
        <label className={label}>
          Unidad
          <select name="unit" defaultValue={item.unit} className={field}>
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </select>
        </label>
        <label className={label}>
          Ubicación
          <select name="location" defaultValue={item.location} className={field}>
            {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>
        <label className={label}>
          Stock mínimo
          <input name="minStock" type="number" min="0" defaultValue={item.minStock} className={field} />
        </label>
        <label className={`${label} col-span-2`}>
          Vencimiento (opcional)
          <input name="expiresAt" type="date" defaultValue={item.expiresAt ?? ""} className={field} />
        </label>
        <button className="col-span-2 rounded-lg bg-jar px-3 py-3 font-medium text-white">
          Guardar cambios
        </button>
        <Link href="/" className="col-span-2 text-center text-sm text-muted underline">
          Cancelar
        </Link>
      </form>
    </section>
  );
}