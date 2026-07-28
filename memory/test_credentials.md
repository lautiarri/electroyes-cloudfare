# Test Credentials

## Admin Panel (Electroyes Tienda)
- URL: `/tienda/admin/login`
- Username: `admin`
- Password: `electroyes2026` *(configured as `ADMIN_PASSWORD` secret in Cloudflare Worker)*

## Resend (email)
- API Key stored as `RESEND_API_KEY` secret in Cloudflare Worker.
- Sender: `onboarding@resend.dev` (fallback until `electroyes.com.ar` verified in Resend).

## Notes
- Backend migrated Feb 2026 from FastAPI/Render/Mongo/SMTP → Cloudflare Workers + D1 + R2 + Resend HTTP API.
- Old MongoDB/SMTP credentials no longer used.
