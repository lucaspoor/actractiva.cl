import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    const { docs: allOrders } = await payload.find({
      collection: 'orders',
      limit: 0,
      depth: 0,
      overrideAccess: true,
    })

    let totalSales = 0
    let paidOrders = 0
    let pendingOrders = 0
    let rejectedOrders = 0
    let cancelledOrders = 0

    for (const order of allOrders) {
      if (order.status === 'paid') {
        totalSales += order.total ?? 0
        paidOrders++
      } else if (order.status === 'pending') {
        pendingOrders++
      } else if (order.status === 'rejected') {
        rejectedOrders++
      } else if (order.status === 'cancelled') {
        cancelledOrders++
      }
    }

    const totalOrders = allOrders.length
    const averageTicket = paidOrders > 0 ? Math.round(totalSales / paidOrders) : 0

    return NextResponse.json({
      totalSales,
      totalOrders,
      paidOrders,
      pendingOrders,
      rejectedOrders,
      cancelledOrders,
      averageTicket,
    })
  } catch (error) {
    console.error('[analytics/summary]', error)
    return NextResponse.json(
      { error: 'Error al obtener métricas.' },
      { status: 500 },
    )
  }
}
