export function formatPrice(value: number): string {
  return `$ ${value.toLocaleString('es-CL')}`
}

/**
 * Base URL pública de la app. Se usa para construir urlReturn / urlConfirmation.
 */
export function getBaseUrl(origin?: string): string {
  return process.env.NEXT_PUBLIC_BASE_URL || origin || 'http://localhost:3000'
}

/**
 * Construye la URL pública de un archivo subido a la colección media de Payload.
 */
export function getMediaUrl(
  media:
    | {
        url?: string | null
        sizes?: { card?: { url?: string | null } | null; thumbnail?: { url?: string | null } | null }
      }
    | null
    | undefined,
  size: 'card' | 'thumbnail' | 'original' = 'card',
): string | undefined {
  if (!media) return undefined
  if (size === 'card') return media.sizes?.card?.url ?? media.url ?? undefined
  if (size === 'thumbnail') return media.sizes?.thumbnail?.url ?? media.url ?? undefined
  return media.url ?? undefined
}
