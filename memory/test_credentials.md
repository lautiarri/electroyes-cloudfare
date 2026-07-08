# Test Credentials

## Admin Panel (Electroyes Tienda)
- URL: /tienda/admin/login
- Username: `admin`
- Password: `electroyes2026`

## SMTP (DonWeb — sends order emails)
- Host: `a0100302.ferozo.com`
- Port: `465` (SSL)
- User: `electroyes@arsolutions.com.ar`
- Password: `A9/vMk2Nq7@yLz3`
- Sender & owner recipient: `electroyes@arsolutions.com.ar`

## Notes
- Migrated from Resend to native SMTP via smtplib (no external service).
- SMTP credentials live in backend `.env` locally and must be set in Render env vars for production.
