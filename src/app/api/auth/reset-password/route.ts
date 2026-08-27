import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = typeof body?.token === 'string' ? body.token.trim() : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contraseña son requeridos.' },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres.' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    const { docs: users } = await payload.find({
      collection: 'users',
      where: {
        resetPasswordToken: { equals: token },
      },
      limit: 1,
      depth: 0,
    })

    const user = users[0]

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido o expirado.' },
        { status: 400 },
      )
    }

    if (user.resetPasswordExpiration) {
      const expiration = new Date(user.resetPasswordExpiration)
      if (expiration < new Date()) {
        return NextResponse.json(
          { error: 'Token inválido o expirado.' },
          { status: 400 },
        )
      }
    }

    await payload.update({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
      data: {
        password,
        resetPasswordToken: null,
        resetPasswordExpiration: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[reset-password]', error)
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500 },
    )
  }
}
