# MASTER PROMPT: E-Commerce Architecture & Functional Skeleton (Next.js + Payload CMS v3 + Flow + Resend)

Actúa como un Desarrollador Fullstack Senior especialista en Next.js, Payload CMS, Tailwind CSS y Node.js. 

Tu objetivo es construir la estructura, configuración y código funcional base para un e-commerce minimalista enfocado en vender solo 2 productos (Chaqueta y Pantalón). No te preocupes por el diseño estético pulido; enfócate en la arquitectura, la conectividad entre módulos, el estado global, el scroll interactivo y el flujo de pagos.

---

## 1. ESPECIFICACIONES TÉCNICAS Y STACK

- **Framework:** Next.js (App Router, TypeScript, Tailwind CSS)
- **CMS & Database:** Payload CMS v3 (integrado nativamente en App Router en la ruta `/admin`).
- **Estado Global:** Zustand con persistencia (`localStorage`).
- **Animaciones de Scroll:** Framer Motion y `@studio-freight/react-lenis` (o `@darkroom.engineering/lenis`) para Smooth Scroll.
- **Pasarela de Pagos:** API de Flow (Chile/LATAM) con firma HMAC SHA256.
- **Email Transaccional:** Resend SDK.

---

## 2. ESTRUCTURA DE ARCHIVOS Y CARPETAS

Genera la siguiente estructura dentro de la carpeta `src`:

```text
/src
  /app
    /(app)
      /page.tsx                  # Home interactiva con scroll
      /producto/[slug]/page.tsx   # Detalle de producto
      /checkout/page.tsx          # Resumen e ingreso de datos
      /gracias/page.tsx           # Pantalla de éxito tras pago en Flow
    /(payload)                    # Configuración de rutas de Payload v3
    /api
      /flow
        /create/route.ts         # Genera orden en Payload y pago en Flow
        /webhook/route.ts        # Recibe confirmación POST/GET de Flow
  /collections
    /Products.ts                 # Colección de Productos
    /Orders.ts                   # Colección de Ventas/Órdenes
    /Media.ts                    # Archivos multimedia
  /components
    /cart/
      /CartDrawer.tsx            # Drawer lateral del carrito
      /CartButton.tsx            # Botón con badge de cantidad
    /layout/
      /Navbar.tsx                # Cabecera
      /Footer.tsx                # Pie de página
    /home/
      /Hero.tsx                  # Sección inicial
      /ScrollShowcase.tsx        # Galería de productos con transiciones por scroll
      /InfoAccordion.tsx         # Guía de tallas y políticas de envío
  /store/
    /useCartStore.ts             # Estado Zustand del carrito
  /lib/
    /flow.ts                     # Funciones helpers para firmar y consumir Flow API
    /resend.ts                   # Cliente y helper para envío de correos
  /payload.config.ts             # Configuración central de Payload CMS