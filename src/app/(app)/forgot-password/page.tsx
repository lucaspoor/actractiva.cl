'use client'

import { useState } from 'react'
import Link from 'next/link'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border px-4 py-3 outline-none transition-colors ${
    hasError ? 'border-red-500 focus:border-red-500' : 'border-zinc-300 focus:border-zinc-900'
  }`

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()

    if (!trimmed) {
      setError('Ingresa tu email.')
      return
    }
    if (!EMAIL_RE.test(trimmed)) {
      setError('El email no parece válido.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })

      if (!res.ok) {
        setError('Ocurrió un error. Inténtalo de nuevo.')
        setLoading(false)
        return
      }

      setSent(true)
    } catch {
      setError('Ocurrió un error de red. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Revisa tu correo</h1>
        <p className="mt-4 text-zinc-600">
          Si existe una cuenta con <strong>{email}</strong>, recibirás un enlace para restablecer tu
          contraseña.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full border border-zinc-900 px-6 py-3 text-sm font-medium hover:bg-zinc-100"
        >
          Volver a la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Recuperar contraseña</h1>
      <p className="mt-2 text-zinc-600">
        Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-600">Email</span>
          <input
            type="email"
            required
            placeholder="tucorreo@ejemplo.cl"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
            className={inputClass(Boolean(error))}
          />
          {error && (
            <span className="mt-1 block text-xs text-red-600" role="alert">
              {error}
            </span>
          )}
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full border border-zinc-900 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:opacity-50"
        >
          {loading ? 'Enviando…' : 'Enviar enlace de recuperación'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/" className="underline hover:text-zinc-900">
          Volver a la tienda
        </Link>
      </p>
    </div>
  )
}
