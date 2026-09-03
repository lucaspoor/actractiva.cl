# Atractiva CL — Tienda

usuarios base de datos:
admin@atractivacl.cl
1234



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

PostgreSQL corre self-hosted como servicio `db` de docker-compose en el mismo
servidor. El esquema lo gestionan las **migraciones de Payload commiteadas en
`src/migrations`**; el deploy manual las aplica **antes** del build. No hay
CI/CD: cada release se despliega por SSH.

### Requisitos en el servidor

- Docker + Docker Compose v2 (`docker compose`)
- git (deploy manual por SSH)
- Puerto `5433` libre en el host (publicación loopback de Postgres)

### Pasos

1. Copia el proyecto al servidor (git clone o rsync).

2. Crea el archivo de entorno a partir del ejemplo y edita los valores reales:

   ```bash
   cp .env.production .env
   nano .env
   ```

   Al menos revisa: `NEXT_PUBLIC_BASE_URL`, `PAYLOAD_SECRET`, `FLOW_*`,
   `RESEND_*`. Agrega/ajusta las variables de Postgres: `POSTGRES_USER`,
   `POSTGRES_PASSWORD` (**alfanumérica**: se interpola en URLs de conexión),
   `POSTGRES_DB`, `POSTGRES_PORT=5433`.

   > `FLOW_ENV` puede ser `sandbox` (pruebas) o `production`. Si quieres probar
   > pagos reales, usa `FLOW_ENV=production` con las claves de producción en
   > la consola de Flow.

3. Deploy manual — cada release (las migraciones SIEMPRE antes del build: el
   init de Payload conecta a la DB durante `next build`, por eso `db` debe
   estar healthy y el build usa la URL host):

   ```bash
   set -e
   cd ~/actractiva.cl
   git pull --ff-only
   docker compose up -d db
   for i in $(seq 1 30); do
     status=$(docker inspect -f '{{.State.Health.Status}}' "$(docker compose ps -q db)" 2>/dev/null || echo starting)
     [ "$status" = "healthy" ] && break
     [ "$i" = "30" ] && echo "postgres no quedó healthy" && exit 1
     sleep 5
   done
   docker compose build migrate
   docker compose run --rm migrate        # aplica migraciones pendientes; exit≠0 aborta
   docker compose up -d --build web
   for i in $(seq 1 30); do
     status=$(docker inspect -f '{{.State.Health.Status}}' "$(docker compose ps -q web)" 2>/dev/null || echo starting)
     [ "$status" = "healthy" ] && break
     [ "$i" = "30" ] && echo "web no quedó healthy tras 150s" && exit 1
     sleep 5
   done
   docker image prune -f
   ```

   El sitio queda en `http://TUSERVER:3000` y el admin en `/admin`.

4. Seed — solo en el cutover inicial o si la DB está vacía:

   ```bash
   docker compose run --rm migrate npm run seed
   ```

   No va en la secuencia de deploy: evita recrear productos si el admin los
   renombró/borró en producción.

### Primer arranque (cutover desde SQLite)

La DB de producción arranca limpia (no se migran datos sqlite). Antes de
desplegar por primera vez con Postgres: respalda el volumen sqlite, ajusta
`.env` (`DATABASE_URI` apuntando a `db`, agrega `POSTGRES_*`), despliega y
corre el seed una sola vez. El volumen sqlite (`db_data`) puede borrarse tras
confirmar que todo funciona. Ver el procedimiento exacto en el historial de
release (Paso 11 del plan de migración).

### Cambios de esquema (flujo dev/prod)

1. Edita la colección → `npm run dev` sincroniza solo la DB de desarrollo
   (push, nunca contra producción).
2. Al terminar la feature, genera la migración contra la DB de dev (que ya
   tiene el esquema pusheado) y revisa el DDL generado:

   ```bash
   DATABASE_URI=postgres://atractiva:atractiva-pg@127.0.0.1:5433/atractiva_dev npm run migrate:create <nombre>
   git add src/migrations && git commit
   ```

3. El siguiente deploy (paso 3) aplica la migración pendiente con el job
   `migrate`. Nunca corras migraciones contra la DB de dev: su esquema ya está
   pusheado y la baseline fallaría por tablas existentes.

### Backup / restore

```bash
# Backup (dentro del contenedor db)
docker compose exec db pg_dump -U atractiva atractiva > backup.sql

# Restore
docker compose exec -T db psql -U atractiva atractiva < backup.sql
```

### Nginx / HTTPS (opcional pero recomendado)

El contenedor publica el puerto 3000. Un ejemplo de proxy inverso:

```nginx
server {
    listen 80;
    server_name atractivacl.cl www.atractivacl.cl;

    location / {
        proxy_pass http://127.0.0.1:3000;
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

- `FLOW_ENV` puede ser `sandbox` (pruebas) o `production`.
- Si cambias el secreto de Payload después de crear datos, las sesiones se
  invalidan; cámbialo antes del primer arranque.
- El usuario `db` (Postgres) se publica solo en `127.0.0.1:5433` del host; la
  red interna de compose (`web`/`migrate`) lo alcanza como `db:5432`.
- Los datos persisten en los volúmenes nombrados `_pg_data` (Postgres) y
  `_media_data` (imágenes). El media ya presente en `_media_data` (era SQLite)
  no se borra: quedan archivos huérfanos inocuos.
