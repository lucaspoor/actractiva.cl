import type { GlobalConfig } from 'payload'

const sizeRowFields = (columns: { name: string; label: string }[]) =>
  columns.map((col) => ({
    name: col.name,
    type: 'text' as const,
    label: col.label,
    required: true,
  }))

export const SizeCharts: GlobalConfig = {
  slug: 'size-charts',
  admin: {
    group: 'Catálogo',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Polera',
          name: 'polera',
          fields: [
            {
              name: 'rows',
              type: 'array',
              labels: {
                singular: 'Fila',
                plural: 'Filas',
              },
              fields: sizeRowFields([
                { name: 'talla', label: 'Talla' },
                { name: 'pecho', label: 'Pecho' },
                { name: 'largo', label: 'Largo' },
              ]),
            },
          ],
        },
        {
          label: 'Chaqueta',
          name: 'chaqueta',
          fields: [
            {
              name: 'rows',
              type: 'array',
              labels: {
                singular: 'Fila',
                plural: 'Filas',
              },
              fields: sizeRowFields([
                { name: 'talla', label: 'Talla' },
                { name: 'pecho', label: 'Pecho' },
                { name: 'largo', label: 'Largo' },
                { name: 'manga', label: 'Manga' },
              ]),
            },
          ],
        },
        {
          label: 'Pantalón',
          name: 'pantalon',
          fields: [
            {
              name: 'rows',
              type: 'array',
              labels: {
                singular: 'Fila',
                plural: 'Filas',
              },
              fields: sizeRowFields([
                { name: 'talla', label: 'Talla' },
                { name: 'cintura', label: 'Cintura' },
                { name: 'largo', label: 'Largo' },
              ]),
            },
          ],
        },
      ],
    },
  ],
}
