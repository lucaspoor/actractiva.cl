export type SiteInfoItem = {
  title: string
  content: string
}

export const SITE_INFO = {
  fit: {
    title: 'Guía de tallas',
    content:
      'Nuestras prendas tienen un corte regular. XS equivale a talla 34, S a 36, M a 38, L a 40 y XL a 42. Si dudas entre dos tallas, te recomendamos elegir la mayor.',
  },
  shipping: {
    title: 'Política de envío',
    content:
      'Despachamos a todo Chile en 3 a 6 días hábiles. El envío es gratis por compras sobre $50.000. Recibirás un correo de seguimiento al confirmarse tu pago.',
  },
  returns: {
    title: 'Cambios y devoluciones',
    content:
      'Tienes 10 días corridos para solicitar un cambio o devolución con la prenda sin uso y con sus etiquetas originales. Escríbenos a hola@atractivacl.cl.',
  },
} as const satisfies Record<string, SiteInfoItem>

export const SITE_INFO_ITEMS: SiteInfoItem[] = [SITE_INFO.fit, SITE_INFO.shipping, SITE_INFO.returns]
