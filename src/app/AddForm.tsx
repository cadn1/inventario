"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from "@zxing/library";
import { addItem, adjust, lookupBarcode } from "./actions";

type Mine = { id: number; name: string; quantity: number; unit: string };

export default function AddForm({ locations, units }: { locations: string[]; units: string[] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [existing, setExisting] = useState<Mine | null>(null);
  const [msg, setMsg] = useState("");

  async function onCode(code: string) {
    setBarcode(code);
    setMsg("Buscando producto…");
    const r = await lookupBarcode(code);
    if (r.kind === "mine") {
      setExisting(r.item);
      setMsg("");
    } else if (r.kind === "off") {
      setName(r.name);
      setMsg("Lo encontré en Open Food Facts. Completa los datos y guarda.");
    } else {
      setMsg("No está en ninguna base. Escribe el nombre y guárdalo: la próxima vez lo reconocerá.");
    }
  }

  useEffect(() => {
    if (!scanning) return;
    let disposed = false;
    let handled = false;
    
    // 1. Configurar los formatos esperados (EAN_13, UPC) acelera enormemente la detección
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.EAN_8,
      BarcodeFormat.QR_CODE
    ]);

    const codeReader = new BrowserMultiFormatReader(hints);

    // 2. Iniciar la cámara (usar undefined toma la principal por defecto)
    codeReader.decodeFromVideoDevice(
      null, 
      videoRef.current!,
      (result, error) => {
        if (result && !handled && !disposed) {
          handled = true;
          setScanning(false);
          onCode(result.getText());
        }
        
        // Si quieres ver si realmente está escaneando, descomenta la siguiente línea:
        // if (error) console.log("Buscando código...", error.name);
      }
    ).catch((err) => {
      if (!disposed) {
        setScanning(false);
        setMsg("No se pudo abrir la cámara. Revisa el permiso del navegador.");
        console.error(err);
      }
    });

    // 3. Limpieza de la cámara al desmontar o cancelar
    return () => {
      disposed = true;
      codeReader.reset();
    };
  }, [scanning]);

  async function change(delta: number) {
    if (!existing) return;
    const fd = new FormData();
    fd.set("id", String(existing.id));
    fd.set("delta", String(delta));
    await adjust(fd);
    setExisting({ ...existing, quantity: Math.max(0, existing.quantity + delta) });
  }

  const field = "mt-1 w-full rounded-lg border border-line bg-card px-3 py-3 text-ink";
  const label = "text-sm text-muted";

  return (
    <details className="rounded-xl border border-line bg-card p-4">
      <summary className="cursor-pointer font-medium">Agregar producto</summary>
      <div className="mt-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            setMsg("");
            setExisting(null);
            setScanning(true);
          }}
          className="rounded-lg border border-jar px-3 py-3 font-medium text-jar"
        >
          Escanear código de barras
        </button>

        {scanning && (
          <div>
            <video ref={videoRef} muted playsInline className="w-full rounded-lg bg-ink" />
            <button type="button" onClick={() => setScanning(false)} className="mt-2 text-sm text-muted underline">
              Cancelar escaneo
            </button>
          </div>
        )}

        {msg && <p role="status" className="text-sm text-muted">{msg}</p>}

        {existing && (
          <div className="rounded-lg border border-line bg-paper p-3">
            <p className="font-medium">Ya lo tienes: {existing.name}</p>
            <p className="mb-2 text-sm text-muted">
              Cantidad actual: {existing.quantity} {existing.unit}
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => change(-1)} className="h-11 flex-1 rounded-lg border border-line bg-card">
                Quitar 1
              </button>
              <button type="button" onClick={() => change(1)} className="h-11 flex-1 rounded-lg bg-jar text-white">
                Agregar 1
              </button>
            </div>
          </div>
        )}

        <form
          action={async (fd) => {
            await addItem(fd);
            setName("");
            setBarcode("");
            setMsg("Producto guardado.");
          }}
          className="grid grid-cols-2 gap-3"
        >
          <input type="hidden" name="barcode" value={barcode} />
          <label className={`${label} col-span-2`}>
            Nombre
            <input
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Arroz"
              className={field}
            />
          </label>
          <label className={label}>
            Cantidad
            <input name="quantity" type="number" min="0" defaultValue="1" className={field} />
          </label>
          <label className={label}>
            Unidad
            <select name="unit" className={field}>
              {units.map((u) => <option key={u}>{u}</option>)}
            </select>
          </label>
          <label className={label}>
            Ubicación
            <select name="location" className={field}>
              {locations.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label className={label}>
            Stock mínimo
            <input name="minStock" type="number" min="0" defaultValue="1" className={field} />
          </label>
          <label className={`${label} col-span-2`}>
            Vencimiento (opcional)
            <input name="expiresAt" type="date" className={field} />
          </label>
          <button className="col-span-2 rounded-lg bg-jar px-3 py-3 font-medium text-white">
            Guardar producto
          </button>
        </form>
      </div>
    </details>
  );
}