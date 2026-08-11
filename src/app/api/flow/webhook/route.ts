import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import { FLOW_STATUS_MAP, getPaymentStatus } from '@/lib/flow'
import { sendOrderConfirmation } from '@/lib/resend'

export const dynamic = 'force-dynamic'

/**
 * Confirma el estado real del pago consultando a Flow (payment/getStatus)
 * y actualiza la orden correspondiente. Envía el correo si quedó pagada.
 */
async function processConfirmation(token: string) {
  const paymentStatus = await getPaymentStatus(token)
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'orders',
    where: { flowToken: { equals: token } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const order = docs[0]
  if (!order) return

  const orderStatus = FLOW_STATUS_MAP[paymentStatus.status] ?? 'pending'

  await payload.update({
    collection: 'orders',
    overrideAccess: true,
    id: order.id,
    data: {
      status: orderStatus,
      flowStatus: paymentStatus.status,
    },
  })

  if (orderStatus === 'paid') {
    await sendOrderConfirmation(order.customer.email, {
      orderNumber: order.orderNumber ?? '',
      customerName: order.customer.name,
      total: order.total,
      items: (order.items ?? []).map((item) => ({
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      })),
    })
  }
}

/**
 * Webhook de confirmación (urlConfirmation). Flow envía un POST con el token.
 */
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const token = String(form.get('token') ?? form.get('flow_token') ?? '')

    if (token) {
      await processConfirmation(token)
    }
  } catch (error) {
    // Siempre responder 200 para evitar reintentos infinitos de Flow.
    console.error('[flow/webhook POST]', error)
  }

  return new NextResponse('ok', { status: 200 })
}

/**
 * Variante GET por si Flow (o el retorno del usuario) llega con ?token=.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (token) {
    try {
      await processConfirmation(token)
    } catch (error) {
      console.error('[flow/webhook GET]', error)
    }
  }

  return new NextResponse('ok', { status: 200 })
}
