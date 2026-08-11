import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import { createPayment, getPaymentUrl } from '@/lib/flow'
import { getBaseUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type CreateBody = {
  customer?: {
    name?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    region?: string
  }
  items?: {
    product: string
    size?: string
    quantity?: number
  }[]
}

/**
 * Crea la orden en Payload, genera el pago en Flow y devuelve la URL del checkout.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateBody
    const { customer, items } = body

    if (!customer || !customer.name || !customer.email || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Faltan datos del cliente o del carrito.' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Precios siempre se recalculan desde la base de datos.
    const productIds = items
      .map((item) => Number(item.product))
      .filter((id) => Number.isFinite(id))
    const { docs: products } = await payload.find({
      collection: 'products',
      where: { id: { in: productIds } },
      limit: 50,
      depth: 0,
    })
    const productMap = new Map(products.map((product) => [String(product.id), product]))

    const normalizedItems: {
      product: number
      name: string
      size?: string
      price: number
      quantity: number
    }[] = []
    let total = 0

    for (const item of items) {
      const product = productMap.get(String(item.product))
      if (!product) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.product}` },
          { status: 400 },
        )
      }

      const quantity = Math.max(1, Math.min(99, Number(item.quantity) || 1))
      total += product.price * quantity

      normalizedItems.push({
        product: product.id,
        name: product.title,
        size: item.size,
        price: product.price,
        quantity,
      })
    }

    const orderNumber = `ATC-${Date.now()}`
    const order = await payload.create({
      collection: 'orders',
      overrideAccess: true,
      data: {
        orderNumber,
        status: 'pending',
        total,
        items: normalizedItems,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          region: customer.region,
        },
        paymentProvider: 'flow',
      },
    })

    const baseUrl = getBaseUrl(request.nextUrl.origin)
    const flow = await createPayment({
      commerceOrder: String(order.id),
      subject: `Orden ${orderNumber} — Atractiva`,
      currency: 'CLP',
      amount: total,
      email: customer.email,
      urlReturn: `${baseUrl}/gracias`,
      urlConfirmation: `${baseUrl}/api/flow/webhook`,
      optional: JSON.stringify({ orderId: order.id }),
    })

    await payload.update({
      collection: 'orders',
      overrideAccess: true,
      id: order.id,
      data: {
        flowToken: flow.token,
        flowOrder: String(flow.flowOrder),
      },
    })

    return NextResponse.json({ url: getPaymentUrl(flow), token: flow.token })
  } catch (error) {
    console.error('[flow/create]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno al crear el pago.' },
      { status: 500 },
    )
  }
}
