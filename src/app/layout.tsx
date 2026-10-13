import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import Link from "next/link";
import { logout } from "./actions";
import "./globals.css";

const font = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });

export const metadata: Metadata = { title: "Despensa", description: "Inventario de mi despensa" };
export const viewport: Viewport = { themeColor: "#f1f4ee" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={font.variable}>
      <body className="font-sans antialiased">
        <header className="mx-auto flex max-w-2xl items-center justify-between px-4 pt-5">
          <nav className="flex gap-5 text-lg font-semibold">
            <Link href="/">Despensa</Link>
            <Link href="/compras" className="text-muted">Compras</Link>
          </nav>
          <form action={logout}>
            <button className="text-sm text-muted underline">Salir</button>
          </form>
        </header>
        <main className="mx-auto max-w-2xl px-4 pb-24 pt-4">{children}</main>
      </body>
    </html>
  );
}
