# Yandex Object Storage CORS for Presigned Uploads

This project uses presigned PUT uploads for large videos. The browser must be allowed to send cross-origin PUT requests to the bucket. Apply the CORS policy below using the AWS-compatible CLI.

## Prerequisites

- AWS CLI installed (`aws` command).
- Yandex Object Storage access key/secret with permission to edit the bucket CORS.

## Required environment variables

- `S3_ACCESS_KEY` - Yandex access key ID
- `S3_SECRET_KEY` - Yandex secret access key
- `S3_BUCKET` - bucket name
- `S3_ENDPOINT` - optional, defaults to `https://storage.yandexcloud.net`
- `USE_OBJECT_STORAGE` - optional override (`true` to force Object Storage, `false` to force local)

## CORS configuration

The config lives in `scripts/storage/cors.json`:

- Allowed origins: `https://arefev.pro`, `http://localhost:3000`
- Allowed methods: `GET`, `HEAD`, `PUT`
- Allowed headers: `*`
- Expose headers: `ETag`
- Max age: `3600`

## Apply CORS

```bash
S3_ACCESS_KEY=... \
S3_SECRET_KEY=... \
S3_BUCKET=... \
scripts/storage/apply-cors.sh apply
```

## Verify CORS

```bash
S3_ACCESS_KEY=... \
S3_SECRET_KEY=... \
S3_BUCKET=... \
scripts/storage/apply-cors.sh verify
```

## Notes

- The bucket handles the CORS preflight automatically when rules are correct.
- If you see CORS errors, verify the `Origin` header in DevTools matches one of the allowed origins.
