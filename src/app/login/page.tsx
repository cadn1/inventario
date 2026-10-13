import { login } from "../actions";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <form action={login} className="mx-auto mt-24 flex max-w-xs flex-col gap-3">
      <h1 className="text-2xl font-semibold">Despensa</h1>
      <input
        name="password" type="password" required autoFocus placeholder="Contraseña"
        className="rounded-lg border border-line bg-card px-3 py-3"
      />
      {error && <p className="text-sm text-alert">Contraseña incorrecta. Inténtalo de nuevo.</p>}
      <button className="rounded-lg bg-jar px-3 py-3 font-medium text-white">Entrar</button>
    </form>
  );
}
