export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} Atractiva CL. Todos los derechos reservados.</p>
        <div className="flex items-center gap-6">
          <span>Envíos a todo Chile</span>
          <span>Pagos vía Flow</span>
        </div>
      </div>
    </footer>
  )
}
