#!/bin/sh
set -e

# =====================================================
# Primer arranque: si los volúmenes están vacíos, se
# copia la DB sembrada (admin + productos) y el media.
# =====================================================

DATA_DIR="/app/data"
MEDIA_DIR="/app/media"
SEED_DB="/seed/payload.db"
SEED_MEDIA="/seed/media"

mkdir -p "$DATA_DIR" "$MEDIA_DIR"

if [ ! -f "$DATA_DIR/payload.db" ]; then
  echo "[init] Copiando DB sembrada a $DATA_DIR ..."
  cp "$SEED_DB" "$DATA_DIR/payload.db"
fi

if [ -z "$(ls -A "$MEDIA_DIR")" ]; then
  echo "[init] Copiando media inicial a $MEDIA_DIR ..."
  cp -a "$SEED_MEDIA/." "$MEDIA_DIR/"
fi

echo "[init] Listo. Ejecutando: $*"
exec "$@"