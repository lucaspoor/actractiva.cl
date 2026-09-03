import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Products } from './collections/Products'
import { Users } from './collections/Users'
import { SizeCharts } from './globals/SizeCharts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    routes: {
      forgot: '/forgot-password',
    },
    components: {
      afterDashboard: ['@/components/admin/DashboardLink'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Products, Orders, Media, Users],
  globals: [SizeCharts],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || 'postgres://atractiva:atractiva-pg@127.0.0.1:5432/atractiva',
    },
    push: process.env.NODE_ENV !== 'production',
  }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-atractiva-change-me',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
