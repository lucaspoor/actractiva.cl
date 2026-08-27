import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    group: 'Ventas',
    defaultColumns: ['orderNumber', 'status', 'total', 'customer', 'updatedAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Número de orden legible, ej: ATC-1690000000.',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      index: true,
      options: ['pending', 'paid', 'rejected', 'cancelled'],
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Total de la orden en CLP.',
      },
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'size',
          type: 'text',
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
      ],
    },
    {
      name: 'customer',
      type: 'group',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
        { name: 'address', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'region', type: 'text' },
      ],
    },
    {
      name: 'paymentProvider',
      type: 'text',
      defaultValue: 'flow',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'flowToken',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'flowOrder',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'flowStatus',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Código de estado devuelto por Flow (1-4).',
      },
    },
    {
      name: 'flowEnv',
      type: 'select',
      options: [
        { label: 'Test', value: 'sandbox' },
        { label: 'Producción', value: 'production' },
      ],
      defaultValue: 'sandbox',
      admin: {
        position: 'sidebar',
        description: 'Entorno donde se procesó el pago.',
      },
    },
  ],
}
