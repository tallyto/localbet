#!/usr/bin/env sh
set -eu

KEY_DIR="/app/keys"
mkdir -p "$KEY_DIR"

if [ -n "${JWT_PRIVATE_KEY_B64:-}" ]; then
  printf '%s' "$JWT_PRIVATE_KEY_B64" | base64 -d > "$KEY_DIR/privateKey.pem"
  export SMALLRYE_JWT_SIGN_KEY_LOCATION="$KEY_DIR/privateKey.pem"
fi

if [ -n "${JWT_PUBLIC_KEY_B64:-}" ]; then
  printf '%s' "$JWT_PUBLIC_KEY_B64" | base64 -d > "$KEY_DIR/publicKey.pem"
  export MP_JWT_VERIFY_PUBLICKEY_LOCATION="$KEY_DIR/publicKey.pem"
fi

exec "$@"
