import type { CollectionConfig } from 'payload'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    group: 'Catálogo',
    defaultColumns: ['title', 'price', 'stock', 'featured', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Slug único usado en la URL pública del producto.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Precio en pesos chilenos (CLP).',
      },
    },
    {
      name: 'sizes',
      type: 'select',
      hasMany: true,
      options: ['XS', 'S', 'M', 'L', 'XL'],
      defaultValue: ['M'],
    },
    {
      name: 'stock',
      type: 'number',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create' && data?.title && !data?.slug) {
          data.slug = slugify(data.title)
        }
        return data
      },
    ],
  },
}
