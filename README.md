# Atractiva CL — Tienda

E-commerce minimalista (Chaqueta y Pantalón) construido con Next.js + Payload CMS + SQLite + Flow (pagos) + Resend (email).

## Desarrollo local

```bash
npm install
npm run dev
# http://localhost:3000 (admin: /admin)
```

## Despliegue en servidor con Docker

El proyecto trae listo `Dockerfile`, `docker-compose.yml` y un seed inicial
(usuario admin + 2 productos con imágenes) que se aplica solo en el primer
arranque si los volúmenes están vacíos.

### Requisitos en el servidor

- Docker + Docker Compose (`docker compose` o `docker-compose`)
- Ubuntu x86_64 (el build usa sharp/libsql nativos para `linux-x64`, glibc)

### Pasos

1. Copia el proyecto al servidor (git clone o rsync).

2. Crea el archivo de entorno a partir del ejemplo y edita los valores reales:

   ```bash
   cp .env.production .env
   nano .env
   ```

   Al menos revisa: `NEXT_PUBLIC_BASE_URL`, `PAYLOAD_SECRET`, `FLOW_*`, `RESEND_*`.

   > `FLOW_ENV` puede ser `sandbox` (pruebas) o `production`. Si quieres probar
   > pagos reales, usa `FLOW_ENV=production` con las claves de producción en
   > la consola de Flow.

3. Construye y levanta:

   ```bash
   docker compose up -d --build
   ```

   (Si tu Docker Compose es v1, usa `docker-compose up -d --build`.)

4. Verifica:

   ```bash
   docker compose logs -f web
   docker compose ps              # status healthy
   ```

   El sitio queda en `http://TUSERVER:3000` y el admin en `/admin`.

### Primer arranque

Al primer levantar, el entrypoint copia al volumen persistente:

- La **base de datos** sembrada (`payload.db` con admin `admin@atractivacl.cl`
  y la password de `SEED_ADMIN_PASSWORD`).
- Las **imágenes** iniciales de los productos a `/app/media`.

Los datos persisten en los volúmenes nombrados `_db_data` y `_media_data`
(con prefijo según el nombre de carpeta del proyecto). Si borras los volúmenes
(`docker compose down -v`) se re-seedea.

### Cambios en el código / rebuild

```bash
docker compose up -d --build
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
- Para persistencia de datos se usan volúmenes Docker; no es necesario copiar
  la base a mano.