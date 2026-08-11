'use client'

import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl"
      >
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Colección esencial
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Chaqueta y Pantalón
        </h1>
        <p className="mt-6 text-lg text-zinc-600">
          Dos piezas pensadas para construir un guardarropa. Nada más, nada menos.
        </p>
      </motion.div>
    </section>
  )
}
