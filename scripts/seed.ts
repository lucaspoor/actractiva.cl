import 'dotenv/config'

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload } from 'payload'

import config from '../src/payload.config'

/**
 * Seed básico: crea un usuario admin y los dos productos (Chaqueta y Pantalón)
 * con sus imágenes subidas desde la carpeta `media/`.
 * Uso: npm run seed
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MEDIA_DIR = process.env.SEED_MEDIA_DIR || path.resolve(__dirname, '..', 'media')

const PRODUCT_IMAGES: Record<string, string> = {
  Chaqueta: '1JINN_STUDIO_워시드_큐빅_데님-removebg-preview.png',
  'Pantalón': 'NYKKO_JEAN_-_BLUE_-_S___BLUE-removebg-preview.png',
}

async function ensureMedia(payload: ReturnType<typeof getPayload> extends Promise<infer T> ? T : never, filePath: string) {
  const filename = path.basename(filePath)

  const { docs: existing } = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.length > 0) {
    console.log(`· Media "${filename}" ya existe, se omite.`)
    return existing[0]
  }

  const media = await payload.create({
    collection: 'media',
    overrideAccess: true,
    filePath,
    data: {
      alt: path.parse(filename).name,
    },
  })
  console.log(`✓ Media subida: ${filename}`)
  return media
}

async function seed() {
  const payload = await getPayload({ config })

  const { docs: existingUsers } = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
  })

  if (existingUsers.length === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: process.env.SEED_ADMIN_EMAIL || 'admin@atractivacl.cl',
        password: process.env.SEED_ADMIN_PASSWORD || 'atractiva-admin',
        name: 'Admin Atractiva',
      },
    })
    console.log('✓ Usuario admin creado (admin@atractivacl.cl / atractiva-admin)')
  } else {
    console.log('· Usuario admin ya existe, se omite.')
  }

  const products: {
    title: string
    price: number
    sizes: ('XS' | 'S' | 'M' | 'L' | 'XL')[]
    stock: number
    featured: boolean
    description: string
  }[] = [
    {
      title: 'Chaqueta',
      price: 69990,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      stock: 30,
      featured: true,
      description:
        'Chaqueta oversize de corte limpio, confeccionada en algodón grueso. El básico que organiza cualquier look.',
    },
    {
      title: 'Pantalón',
      price: 49990,
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 40,
      featured: true,
      description:
        'Pantalón de corte recto con cintura ajustada. Versátil, cómodo y pensado para el día a día.',
    },
  ]

  for (const product of products) {
    const { docs } = await payload.find({
      collection: 'products',
      where: { title: { equals: product.title } },
      limit: 1,
      overrideAccess: true,
    })

    if (docs.length > 0) {
      console.log(`· Producto "${product.title}" ya existe, se omite.`)
      continue
    }

    const imageFile = PRODUCT_IMAGES[product.title]
    const imagePath = imageFile ? path.join(MEDIA_DIR, imageFile) : null

    let images: { image: number }[] = []
    if (imagePath && fs.existsSync(imagePath)) {
      const media = await ensureMedia(payload, imagePath)
      images = [{ image: media.id }]
    } else {
      console.warn(`  ! No se encontró imagen para "${product.title}" (${imageFile ?? 'n/a'}).`)
    }

    await payload.create({
      collection: 'products',
      data: { ...product, images },
      overrideAccess: true,
    })
    console.log(`✓ Producto creado: ${product.title}${images.length > 0 ? ' (con imagen)' : ''}`)
  }

  console.log('\nSeed completado. Productos disponibles en /admin.')
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
