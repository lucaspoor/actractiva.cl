'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border px-4 py-3 outline-none transition-colors ${
    hasError ? 'border-red-500 focus:border-red-500' : 'border-zinc-300 focus:border-zinc-900'
  }`

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Enlace inválido</h1>
        <p className="mt-4 text-zinc-600">
          El enlace de recuperación no es válido o está incompleto.
        </p>
        <Link
          href="/forgot-password"
          className="mt-8 inline-block rounded-full border border-zinc-900 px-6 py-3 text-sm font-medium hover:bg-zinc-100"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Contraseña actualizada</h1>
        <p className="mt-4 text-zinc-600">
          Tu contraseña fue cambiada correctamente. Ya puedes iniciar sesión.
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

  const validate = (): boolean => {
    const next: typeof errors = {}

    if (!password) {
      next.password = 'Ingresa una contraseña.'
    } else if (password.length < 8) {
      next.password = 'La contraseña debe tener al menos 8 caracteres.'
    }

    if (password !== confirmPassword) {
      next.confirm = 'Las contraseñas no coinciden.'
    }

    setErrors(next)
    return Object.values(next).every((v) => !v)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setApiError(null)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setApiError(data.error ?? 'No pudimos actualizar tu contraseña. El enlace puede haber expirado.')
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setApiError('Ocurrió un error de red. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Nueva contraseña</h1>
      <p className="mt-2 text-zinc-600">Ingresa tu nueva contraseña a continuación.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-600">Nueva contraseña</span>
          <input
            type="password"
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            className={inputClass(Boolean(errors.password))}
          />
          {errors.password && (
            <span className="mt-1 block text-xs text-red-600" role="alert">
              {errors.password}
            </span>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-zinc-600">Confirmar contraseña</span>
          <input
            type="password"
            required
            minLength={8}
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: undefined }))
            }}
            className={inputClass(Boolean(errors.confirm))}
          />
          {errors.confirm && (
            <span className="mt-1 block text-xs text-red-600" role="alert">
              {errors.confirm}
            </span>
          )}
        </label>

        {apiError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{apiError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full border border-zinc-900 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:opacity-50"
        >
          {loading ? 'Guardando…' : 'Restablecer contraseña'}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center text-zinc-400">Cargando…</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
