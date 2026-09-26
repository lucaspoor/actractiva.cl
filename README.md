# Atractiva CL — Tienda

usuarios base de datos:
admin@atractivacl.cl
atractiva-admin



E-commerce minimalista (Chaqueta y Pantalón) construido con Next.js + Payload CMS + PostgreSQL + Flow (pagos) + Resend (email).

## Desarrollo local

Requisitos: Node 20+ y Docker (para el servicio `db` de PostgreSQL).

```bash
npm install
docker compose up -d db   # PostgreSQL en 127.0.0.1:5433 (solo loopback)
npm run dev
# http://localhost:3000 (admin: /admin)
```

`.env` / `.env.local` apuntan a la DB `atractiva_dev` (creada por Payload en el
primer arranque). El esquema se crea solo en desarrollo con el push de Payload
(`db.push: true` cuando `NODE_ENV !== 'production'`).

Seed (solo DB vacía; crea admin + Chaqueta + Pantalón con imágenes):

```bash
DATABASE_URI=postgres://atractiva:atractiva-pg@127.0.0.1:5433/atractiva_dev npm run seed
```

El seed es idempotente: omite lo que ya existe (admin por cualquier user,
productos por `title`, media por `filename`). Escribe las imágenes en `media/`.

## Despliegue en servidor con Docker

Docker Compose orquesta **todo el stack** (PostgreSQL + migraciones + app) con
un solo comando. No requiere Postgres externo: el servicio `db` lo levanta.

### Requisitos en el servidor

- Docker + Docker Compose v2 (`docker compose`)
- git (deploy manual por SSH)
- Puerto `5433` libre en el host (publicación loopback de Postgres, solo para
  `psql`/desarrollo local; la app interna usa `db:5432`)

### Un solo comando

```bash
docker compose up -d --build
```

Esto hace, en orden automático:

1. **Build de las imágenes** (`migrate` y `web`) — **sin** necesidad de que
   Postgres esté arriba: `next build` no consulta la DB (todas las páginas son
   `force-dynamic`).
2. **`db`** arranca (Postgres 16) y se espera a que quede **healthy**.
3. **`migrate`** corre `npx payload migrate` (aplica las migraciones de
   `src/migrations`, es idempotente) y termina con éxito.
4. **`web`** arranca recién cuando `db` está healthy **y** `migrate` terminó.

El nombre de proyecto está fijado en `name: atractivacl` al tope del compose:
no depende de cómo se llame la carpeta, así que `docker compose ps` y el resto
de comandos siempre apuntan a la misma stack.

### Qué levanta

| Servicio | Imagen             | Puerto host        | Persistencia                    |
|----------|--------------------|--------------------|---------------------------------|
| `db`     | `postgres:16-alpine` | `127.0.0.1:5433`  | volumen `atractivacl_pg_data`   |
| `migrate`| one-shot           | —                  | (no persiste, media en `media_data`) |
| `web`    | construida del Dockerfile (`target: runner`) | `0.0.0.0:3005` | volumen `atractivacl_media_data` |

- Sitio: `http://TUSERVER:3005` · Admin: `/admin` · Cambia el puerto con
  `WEB_PORT=xxxx` en `.env`.
- La app y las migraciones hablan con Postgres por la **red interna de compose**
  (`db:5432`). El `5433` del host es solo para que tú puedas hacer `psql` o
  correr `npm run dev` local contra el mismo Postgres.

### Configuración (`.env`)

```bash
cp .env.production .env
nano .env
```

Revisa al menos: `NEXT_PUBLIC_BASE_URL`, `PAYLOAD_SECRET`, `FLOW_*`,
`RESEND_*`. Y las variables de Postgres, que el compose interpola en las URLs
de conexión: `POSTGRES_USER`, `POSTGRES_PASSWORD` (**alfanumérica**),
`POSTGRES_DB`, `POSTGRES_PORT=5433`.

> `FLOW_ENV` puede ser `sandbox` (pruebas) o `production`.

### Primer arranque

La DB arranca limpia y las migraciones crean el esquema automáticamente. Para
tener productos y admin (solo la primera vez):

```bash
docker compose run --rm migrate npm run seed
```

### Operación diaria

```bash
docker compose ps                 # estado de la stack
docker compose logs -f web        # logs de la app
docker compose logs -f db         # logs de Postgres
docker compose up -d --build      # aplicar nuevo código (rebuild + migra + up)
docker compose down               # detener sin borrar datos
docker compose down -v            # detener Y borrar volúmenes (reset total)
```

### Cambios de esquema (flujo dev/prod)

1. Edita la colección → `npm run dev` sincroniza solo la DB de desarrollo
   (push, nunca contra producción).
2. Al terminar la feature, genera la migración contra la DB de dev (que ya
   tiene el esquema pusheado) y revisa el DDL generado:

   ```bash
   DATABASE_URI=postgres://atractiva:atractiva-pg@127.0.0.1:5433/atractiva_dev npm run migrate:create <nombre>
   git add src/migrations && git commit
   ```

3. El siguiente `docker compose up -d --build` aplica la migración pendiente
   con el job `migrate`. Nunca corras migraciones contra la DB de dev: su
   esquema ya está pusheado y la baseline fallaría por tablas existentes.

### Backup / restore

```bash
# Backup (dentro del contenedor db)
docker compose exec db pg_dump -U atractiva atractiva_dev > backup.sql

# Restore
docker compose exec -T db psql -U atractiva atractiva_dev < backup.sql
```

### Nginx / HTTPS (opcional pero recomendado)

El contenedor publica el puerto 3005. Un ejemplo de proxy inverso:

```nginx
server {
    listen 80;
    server_name atractivacl.cl www.atractivacl.cl;

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Luego agrega HTTPS con certbot. Recuerda que el webhook de Flow
(`/api/flow/webhook`) debe ser alcanzable por **URL pública** (configúralo en
`NEXT_PUBLIC_BASE_URL` y en Flow).

### Notas

- El `build` de la imagen `web` **no necesita** la DB: se compiló y verificó sin
  Postgres arriba. El job `migrate` (one-shot) es quien prepara el esquema antes
  de que `web` arranque.
- Los datos persisten en los volúmenes nombrados `atractivacl_pg_data`
  (Postgres) y `atractivacl_media_data` (imágenes). El media viaja desde el
  build (`COPY media ./media`) y luego el volumen lo sobreescribe en runtime.
- El job `migrate` necesita `scripts/` en la imagen para poder correr el seed
  (el Dockerfile lo copia en la etapa `deps`).
- El Dockerfile copia `postcss.config.mjs`: sin él, `next build` no ejecuta el
  plugin `@tailwindcss/postcss` y el storefront sale sin estilos.
- El job `migrate` corre con `yes |` (no interactivo): si corriste `npm run dev`
  contra la misma DB (compartida en `127.0.0.1:5433`), Payload deja una marca
  `dev` (`batch = -1`) en `payload_migrations` que hace que `payload migrate`
  pregunte en consola; el `yes |` la acepta automáticamente y nunca se cuelga en
  el deploy. Es inofensiva: con las migraciones ya aplicadas, solo se filtra.
- Si cambias el secreto de Payload después de crear datos, las sesiones se
  invalidan; cámbialo antes del primer arranque.