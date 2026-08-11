import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { CartDrawer } from '@/components/cart/CartDrawer'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { CartProvider } from '@/components/providers/CartProvider'
import { LenisProvider } from '@/components/providers/LenisProvider'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Atractiva CL — Moda esencial',
    template: '%s · Atractiva CL',
  },
  description: 'Tienda minimalista chilena: chaqueta y pantalón.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <LenisProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </LenisProvider>
      </body>
    </html>
  )
}
