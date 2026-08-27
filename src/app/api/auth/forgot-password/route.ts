import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import crypto from 'crypto'

import { sendPasswordResetEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email) {
      return NextResponse.json({ success: true })
    }

    const payload = await getPayload({ config })

    const { docs: users } = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    })

    const user = users[0]

    if (!user) {
      return NextResponse.json({ success: true })
    }

    const resetToken = crypto.randomUUID()
    const expiration = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    await payload.update({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiration: expiration,
      },
    })

    await sendPasswordResetEmail(email, resetToken)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[forgot-password]', error)
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500 },
    )
  }
}
