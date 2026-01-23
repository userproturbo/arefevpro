#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  cat <<'USAGE'
Apply or verify Yandex Object Storage bucket CORS.

Usage:
  scripts/storage/apply-cors.sh apply   # default
  scripts/storage/apply-cors.sh verify

Required env:
  S3_ACCESS_KEY
  S3_SECRET_KEY
  S3_BUCKET
Optional env:
  S3_ENDPOINT (default: https://storage.yandexcloud.net)
USAGE
  exit 0
fi

: "${S3_ACCESS_KEY:?S3_ACCESS_KEY is required}"
: "${S3_SECRET_KEY:?S3_SECRET_KEY is required}"
: "${S3_BUCKET:?S3_BUCKET is required}"

S3_ENDPOINT="${S3_ENDPOINT:-https://storage.yandexcloud.net}"
ACTION="${1:-apply}"

aws_cmd=(
  aws --endpoint-url="$S3_ENDPOINT" s3api
)

case "$ACTION" in
  apply)
    AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY" AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY" \
      "${aws_cmd[@]}" put-bucket-cors \
      --bucket "$S3_BUCKET" \
      --cors-configuration file://scripts/storage/cors.json
    ;;
  verify)
    AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY" AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY" \
      "${aws_cmd[@]}" get-bucket-cors \
      --bucket "$S3_BUCKET"
    ;;
  *)
    echo "Unknown action: $ACTION" >&2
    echo "Use 'apply' or 'verify'." >&2
    exit 1
    ;;
esac
