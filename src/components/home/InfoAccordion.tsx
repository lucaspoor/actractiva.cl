'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { SITE_INFO_ITEMS, type SiteInfoItem } from '@/lib/site-info'

function AccordionRow({ item, isOpen, onToggle }: { item: SiteInfoItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-zinc-200">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left font-medium"
      >
        <span>{item.title}</span>
        <span className="text-xl leading-none transition-transform duration-300">{isOpen ? '−' : '+'}</span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-zinc-600">{item.content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function InfoAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="guia" className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <h2 className="mb-8 text-2xl font-semibold tracking-tight sm:text-3xl">Información útil</h2>
      <div>
        {SITE_INFO_ITEMS.map((item, index) => (
          <AccordionRow
            key={item.title}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </section>
  )
}
