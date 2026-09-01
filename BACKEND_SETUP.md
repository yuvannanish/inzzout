# INZZOUT backend launch checklist

This project uses Neon Postgres for orders and Resend for notifications. Both have free tiers suitable for a small launch.

1. Create a Neon project and run the complete contents of `database/schema.sql` in the Neon SQL Editor.
2. Copy `.env.local.example` to `.env.local` and set `DATABASE_URL` to Neon’s pooled connection string.
3. Create a Resend account, add the client’s domain, configure the DNS records Resend provides, then set `RESEND_API_KEY`, `ORDER_FROM_EMAIL`, and `ORDER_NOTIFICATION_EMAIL`.
4. Add Razorpay test keys while testing. Once a real test purchase works, replace them with the client’s live key ID and secret.
5. In Razorpay Dashboard → Account & Settings → Webhooks, add `https://YOUR-DOMAIN/api/razorpay/webhook`, use the same `RAZORPAY_WEBHOOK_SECRET`, and subscribe to `order.paid`.
6. Deploy the Node.js Next.js app to commercial hosting, add the same environment variables there, then repeat a test payment before going live.

Never commit `.env.local` or share the Razorpay secret, Neon connection string, Resend key, or webhook secret.
