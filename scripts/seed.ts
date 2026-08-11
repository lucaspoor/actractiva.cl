import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../src/payload.config'

/**
 * Seed básico: crea un usuario admin y los dos productos (Chaqueta y Pantalón).
 * Uso: npm run seed
 */
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

    if (docs.length === 0) {
      await payload.create({
        collection: 'products',
        data: product,
        overrideAccess: true,
      })
      console.log(`✓ Producto creado: ${product.title}`)
    } else {
      console.log(`· Producto "${product.title}" ya existe, se omite.`)
    }
  }

  console.log('\nSeed completado. Productos disponibles en /admin.')
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
