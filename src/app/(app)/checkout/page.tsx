'use client'

import { useState } from 'react'
import Link from 'next/link'

import { useHydrated } from '@/components/providers/CartProvider'
import { useCartStore } from '@/store/useCartStore'
import { formatPrice } from '@/lib/utils'

type CustomerForm = {
  name: string
  email: string
  phone: string
  address: string
  city: string
  region: string
}

type FormErrors = Partial<Record<keyof CustomerForm, string>>

const INITIAL_FORM: CustomerForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  region: '',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CHILE_PHONE_RE = /^(\+?56)?\d{8,9}$/

export const REGION_CITIES: Record<string, string[]> = {
  'Arica y Parinacota': ['Arica', 'Putre'],
  Tarapacá: ['Iquique', 'Alto Hospicio', 'Pozo Almonte'],
  Antofagasta: ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones', 'San Pedro de Atacama'],
  Atacama: ['Copiapó', 'Vallenar', 'Caldera', 'Chañaral'],
  Coquimbo: ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña'],
  Valparaíso: [
    'Valparaíso',
    'Viña del Mar',
    'Quilpué',
    'Villa Alemana',
    'Concón',
    'San Antonio',
    'Los Andes',
    'Quillota',
    'San Felipe',
    'Casablanca',
  ],
  'Metropolitana de Santiago': [
    'Santiago',
    'Puente Alto',
    'Maipú',
    'Las Condes',
    'Providencia',
    'Ñuñoa',
    'La Florida',
    'San Bernardo',
    'Peñalolén',
    'Vitacura',
    'Lo Barnechea',
    'Colina',
  ],
  "O'Higgins": ['Rancagua', 'San Fernando', 'Rengo', 'Machalí', 'Santa Cruz', 'Pichilemu'],
  Maule: ['Talca', 'Curicó', 'Linares', 'Constitución', 'Molina', 'Cauquenes'],
  Ñuble: ['Chillán', 'San Carlos', 'Coihueco', 'Bulnes', 'Quirihue'],
  Biobío: [
    'Concepción',
    'Talcahuano',
    'Los Ángeles',
    'Coronel',
    'Chiguayante',
    'San Pedro de la Paz',
    'Hualpén',
    'Tomé',
    'Penco',
  ],
  Araucanía: ['Temuco', 'Angol', 'Villarrica', 'Pucón', 'Padre Las Casas'],
  'Los Ríos': ['Valdivia', 'La Unión', 'Río Bueno', 'Panguipulli'],
  'Los Lagos': ['Puerto Montt', 'Osorno', 'Castro', 'Puerto Varas', 'Ancud', 'Calbuco'],
  Aysén: ['Coyhaique', 'Puerto Aysén', 'Chile Chico', 'Cochrane'],
  Magallanes: ['Punta Arenas', 'Puerto Natales', 'Porvenir'],
}

function validate(form: CustomerForm): FormErrors {
  const errors: FormErrors = {}

  if (!form.name.trim()) {
    errors.name = 'Ingresa tu nombre.'
  }

  const email = form.email.trim()
  if (!email) {
    errors.email = 'Ingresa tu email.'
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'El email no parece válido.'
  }

  const phone = form.phone.trim().replace(/[\s-]/g, '')
  if (!phone) {
    errors.phone = 'Ingresa tu teléfono.'
  } else if (!CHILE_PHONE_RE.test(phone)) {
    errors.phone = 'Ingresa un teléfono chileno válido (ej: +56 9 1234 5678).'
  }

  if (!form.region) {
    errors.region = 'Selecciona una región.'
  }
  if (!form.city) {
    errors.city = 'Selecciona una comuna.'
  }

  return errors
}

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border px-4 py-3 outline-none transition-colors ${
    hasError ? 'border-red-500 focus:border-red-500' : 'border-zinc-300 focus:border-zinc-900'
  }`

export default function CheckoutPage() {
  const hydrated = useHydrated()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.totalPrice())

  const [form, setForm] = useState<CustomerForm>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateField = (field: keyof CustomerForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, region: e.target.value, city: '' }))
    setErrors((prev) => ({ ...prev, region: undefined, city: undefined }))
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, city: e.target.value }))
    if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/flow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          items: items.map((item) => ({
            product: item.id,
            size: item.size,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'No pudimos crear el pago. Inténtalo de nuevo.')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Ocurrió un error de red. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  const fieldError = (field: keyof CustomerForm) =>
    errors[field] && (
      <span className="mt-1 block text-xs text-red-600" role="alert">
        {errors[field]}
      </span>
    )

  if (hydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Tu carrito está vacío</h1>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full border border-zinc-900 px-6 py-3 text-sm font-medium hover:bg-zinc-100"
        >
          Volver a la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Checkout</h1>

      <form onSubmit={handleSubmit} noValidate className="grid gap-10 md:grid-cols-[1fr_320px]">
        <fieldset className="space-y-5">
          <legend className="mb-2 font-medium">Datos de envío</legend>

          <label className="block">
            <span className="mb-1 block text-sm text-zinc-600">Nombre completo</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={updateField('name')}
              className={inputClass(Boolean(errors.name))}
            />
            {fieldError('name')}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-zinc-600">Email</span>
            <input
              type="email"
              required
              placeholder="tucorreo@ejemplo.cl"
              value={form.email}
              onChange={updateField('email')}
              className={inputClass(Boolean(errors.email))}
            />
            {fieldError('email')}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-zinc-600">Teléfono</span>
            <input
              type="tel"
              required
              placeholder="+56 9 1234 5678"
              value={form.phone}
              onChange={updateField('phone')}
              className={inputClass(Boolean(errors.phone))}
            />
            {fieldError('phone')}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-zinc-600">Dirección</span>
            <input
              type="text"
              value={form.address}
              onChange={updateField('address')}
              className={inputClass(false)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-zinc-600">Región</span>
            <select
              required
              value={form.region}
              onChange={handleRegionChange}
              className={inputClass(Boolean(errors.region))}
            >
              <option value="">Selecciona una región</option>
              {Object.keys(REGION_CITIES).map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            {fieldError('region')}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-zinc-600">Comuna</span>
            <select
              required
              value={form.city}
              onChange={handleCityChange}
              disabled={!form.region}
              className={inputClass(Boolean(errors.city))}
            >
              <option value="">
                {form.region ? 'Selecciona una comuna' : 'Primero selecciona una región'}
              </option>
              {(form.region ? REGION_CITIES[form.region] : []).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {fieldError('city')}
          </label>
        </fieldset>

        <aside className="space-y-4 rounded-lg border border-zinc-200 p-6">
          <h2 className="font-medium">Resumen</h2>
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4">
                <span>
                  {item.name}
                  {item.size ? ` (${item.size})` : ''} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-zinc-200 pt-4">
            <span className="font-medium">Total</span>
            <span className="font-semibold">{formatPrice(total)}</span>
          </div>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full border border-zinc-900 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:opacity-50"
          >
            {loading ? 'Redirigiendo a Flow…' : 'Pagar con Flow'}
          </button>
          <p className="text-center text-xs text-zinc-400">Serás redirigido a la pasarela Flow.</p>
        </aside>
      </form>
    </div>
  )
}
