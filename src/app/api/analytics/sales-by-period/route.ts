import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const period = request.nextUrl.searchParams.get('period') ?? '30d'
    const flowEnv = request.nextUrl.searchParams.get('flowEnv') ?? 'production'
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30

    const payload = await getPayload({ config })

    const since = new Date()
    since.setDate(since.getDate() - days)

    const { docs: orders } = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { createdAt: { greater_than: since.toISOString() } },
          { status: { equals: 'paid' } },
          { flowEnv: { equals: flowEnv } },
        ],
      },
      limit: 0,
      depth: 0,
      overrideAccess: true,
    })

    const grouped: Record<string, { sales: number; orders: number }> = {}

    const now = new Date()
    for (let i = 0; i < days; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      grouped[key] = { sales: 0, orders: 0 }
    }

    for (const order of orders) {
      const key = order.createdAt.slice(0, 10)
      if (grouped[key]) {
        grouped[key].sales += order.total ?? 0
        grouped[key].orders++
      }
    }

    const data = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, ...values }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[analytics/sales-by-period]', error)
    return NextResponse.json(
      { error: 'Error al obtener ventas por período.' },
      { status: 500 },
    )
  }
}
