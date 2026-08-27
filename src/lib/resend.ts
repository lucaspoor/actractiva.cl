import { Resend } from 'resend'
import 'server-only'

export type OrderEmailData = {
  orderNumber: string
  customerName: string
  total: number
  items: { name: string; size?: string | null; quantity: number; price: number }[]
}

/**
 * Envía el correo de confirmación de compra vía Resend.
 * Si no hay API key configurada, lo omite con un warning (útil en dev).
 */
export async function sendOrderConfirmation(to: string, order: OrderEmailData) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !from) {
    console.warn('[resend] Variables RESEND_API_KEY / RESEND_FROM_EMAIL no configuradas. Correo omitido.')
    return null
  }

  const resend = new Resend(apiKey)

  const rows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee">${item.name}${
            item.size ? ` (talla ${item.size})` : ''
          } x ${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">$ ${item.price.toLocaleString('es-CL')}</td>
        </tr>`,
    )
    .join('')

  return resend.emails.send({
    from,
    to,
    subject: `Confirmación de compra ${order.orderNumber} — Atractiva`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto">
        <h2>Hola ${order.customerName}, gracias por tu compra</h2>
        <p>Tu orden <strong>${order.orderNumber}</strong> fue recibida y tu pago confirmado.</p>
        <table style="width:100%;border-collapse:collapse">
          ${rows}
        </table>
        <p style="font-size:18px"><strong>Total: $ ${order.total.toLocaleString('es-CL')}</strong></p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://atractivacl.cl'

  if (!apiKey || !from) {
    console.warn('[resend] Variables RESEND_API_KEY / RESEND_FROM_EMAIL no configuradas. Correo omitido.')
    return null
  }

  const resend = new Resend(apiKey)
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

  return resend.emails.send({
    from,
    to,
    subject: 'Restablece tu contraseña — Atractiva',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 0">
        <h2 style="margin-bottom:16px">Restablece tu contraseña</h2>
        <p style="margin-bottom:24px;color:#52525b">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta.
          Haz clic en el botón de abajo para crear una nueva contraseña.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:500">
          Restablecer contraseña
        </a>
        <p style="margin-top:32px;color:#a1a1aa;font-size:14px">
          Este enlace expira en 1 hora. Si no solicitaste este cambio, puedes ignorar este mensaje.
        </p>
      </div>
    `,
  })
}
