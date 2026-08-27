import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const flowEnv = request.nextUrl.searchParams.get('flowEnv') ?? 'production'

    const payload = await getPayload({ config })

    const { docs: orders } = await payload.find({
      collection: 'orders',
      where: { flowEnv: { equals: flowEnv } },
      limit: 10,
      depth: 0,
      sort: '-createdAt',
      overrideAccess: true,
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('[analytics/recent-orders]', error)
    return NextResponse.json(
      { error: 'Error al obtener pedidos recientes.' },
      { status: 500 },
    )
  }
}
