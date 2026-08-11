import { getPayload } from 'payload'
import config from '@payload-config'

import { Hero } from '@/components/home/Hero'
import { InfoAccordion } from '@/components/home/InfoAccordion'
import { ScrollShowcase, type ShowcaseProduct } from '@/components/home/ScrollShowcase'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'products',
    depth: 1,
    sort: '-createdAt',
    limit: 20,
  })

  const products: ShowcaseProduct[] = docs.map((product) => ({
    id: product.id,
    title: product.title,
    slug: String(product.slug ?? product.id),
    price: product.price,
    sizes: product.sizes ?? [],
    images: product.images?.map((entry) => {
      const media = entry.image
      const url = media && typeof media === 'object' ? media.url ?? undefined : undefined
      return { image: url ? { url } : null }
    }),
  }))

  return (
    <>
      <Hero />
      <ScrollShowcase products={products} />
      <InfoAccordion />
    </>
  )
}
