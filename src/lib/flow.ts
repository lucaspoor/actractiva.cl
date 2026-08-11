import crypto from 'node:crypto'
import 'server-only'

/**
 * Cliente para la API de Flow (Chile/LATAM).
 *
 * Protocolo:
 * - Base URL: https://www.flow.cl/api (producción) | https://sandbox.flow.cl/api (sandbox)
 * - Todos los parámetros (excepto el hash `s`) se ordenan alfabéticamente y se
 *   concatenan como `clavevalorclavevalor...` sin separadores.
 * - El string resultante se firma con HMAC-SHA256 usando el secretKey.
 * - La firma viaja en el parámetro `s`.
 */

const API_URL =
  process.env.FLOW_ENV === 'production'
    ? 'https://www.flow.cl/api'
    : 'https://sandbox.flow.cl/api'

export type FlowParams = Record<string, string | number>

export type CreatePaymentResponse = {
  url: string
  token: string
  flowOrder: number
}

export type PaymentStatusResponse = {
  flowOrder: number
  commerceOrder: string
  requestDate: string
  status: 1 | 2 | 3 | 4
  subject: string
  currency: string
  amount: number
  payer: string
  optional?: string | null
}

export const FLOW_STATUS_MAP: Record<number, 'pending' | 'paid' | 'rejected' | 'cancelled'> = {
  1: 'pending',
  2: 'paid',
  3: 'rejected',
  4: 'cancelled',
}

function getCredentials() {
  const apiKey = process.env.FLOW_API_KEY
  const secretKey = process.env.FLOW_SECRET_KEY

  if (!apiKey || !secretKey) {
    throw new Error('Faltan variables FLOW_API_KEY / FLOW_SECRET_KEY en el entorno.')
  }

  return { apiKey, secretKey }
}

/**
 * Firma HMAC-SHA256 sobre los parámetros ordenados alfabéticamente y
 * concatenados como `clavevalor` (sin separadores), excluyendo la firma misma.
 */
export function sign(params: FlowParams, secretKey: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join('')

  return crypto.createHmac('sha256', secretKey).update(toSign).digest('hex')
}

/**
 * Verifica que la firma `s` recibida sea válida para los parámetros dados.
 */
export function verifySignature(params: FlowParams, signature: string): boolean {
  const { secretKey } = getCredentials()
  return sign(params, secretKey) === signature
}

/**
 * POST a un endpoint de Flow con body `application/x-www-form-urlencoded` firmado.
 */
async function flowRequest<T>(path: string, params: FlowParams): Promise<T> {
  const { apiKey, secretKey } = getCredentials()

  const body: FlowParams = { apiKey, ...params }
  const s = sign(body, secretKey)

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: new URLSearchParams({ ...body, s }),
  })

  const text = await res.text()

  if (!res.ok) {
    throw new Error(`Flow API ${path} respondió ${res.status}: ${text}`)
  }

  return JSON.parse(text) as T
}

/**
 * Crea una orden de cobro en Flow (payment/create).
 */
export async function createPayment(params: {
  commerceOrder: string
  subject: string
  currency: string
  amount: number
  email: string
  urlReturn: string
  urlConfirmation: string
  optional?: string
}): Promise<CreatePaymentResponse> {
  return flowRequest<CreatePaymentResponse>('/payment/create', {
    commerceOrder: params.commerceOrder,
    subject: params.subject,
    currency: params.currency,
    amount: params.amount,
    email: params.email,
    urlReturn: params.urlReturn,
    urlConfirmation: params.urlConfirmation,
    ...(params.optional ? { optional: params.optional } : {}),
  })
}

/**
 * Consulta el estado de un pago mediante su token (payment/getStatus).
 */
export async function getPaymentStatus(token: string): Promise<PaymentStatusResponse> {
  return flowRequest<PaymentStatusResponse>('/payment/getStatus', { token })
}

/**
 * Construye la URL del checkout de Flow a partir de la respuesta de createPayment.
 */
export function getPaymentUrl(response: CreatePaymentResponse): string {
  return `${response.url}?token=${response.token}`
}
