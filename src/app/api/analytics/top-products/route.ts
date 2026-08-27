import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 5
    const flowEnv = request.nextUrl.searchParams.get('flowEnv') ?? 'production'

    const payload = await getPayload({ config })

    const { docs: paidOrders } = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { status: { equals: 'paid' } },
          { flowEnv: { equals: flowEnv } },
        ],
      },
      limit: 0,
      depth: 0,
      overrideAccess: true,
    })

    const productStats: Record<string, { title: string; totalSold: number; totalRevenue: number }> = {}

    for (const order of paidOrders) {
      if (!order.items) continue
      for (const item of order.items) {
        const key = String(item.product ?? item.name)
        if (!productStats[key]) {
          productStats[key] = { title: item.name, totalSold: 0, totalRevenue: 0 }
        }
        productStats[key].totalSold += item.quantity ?? 0
        productStats[key].totalRevenue += (item.price ?? 0) * (item.quantity ?? 0)
      }
    }

    const products = Object.values(productStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit)

    return NextResponse.json({ products })
  } catch (error) {
    console.error('[analytics/top-products]', error)
    return NextResponse.json(
      { error: 'Error al obtener productos más vendidos.' },
      { status: 500 },
    )
  }
}
