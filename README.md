# Vinsup Skill Academy — Portfolio Builder

A Next.js app: students fill one form → admin reviews and approves → portfolio goes live instantly at its own link.

## Pages

| Link | Who | What |
|---|---|---|
| `/` | Students | Full portfolio form (name, batch, course, roll no, phone, email + about, education, experience, internships, skills, projects, links, photo). Shows "Thanks for submitting" after submit. |
| `/admin` | Admin only | Login, stats, search (phone / email / roll number), filters (status / batch / course), view details, Approve / Reject / Delete, copy portfolio link. |
| `/p/<roll-number>` | Public | The student's portfolio (white + blue, red accents). Only visible after approval. Admin can preview before approval while logged in. |

## Default admin login

- Email: `cpmadhu24@gmail.com`
- Password: `Vinsup@2026`

**Change these** by setting environment variables in Vercel (Project → Settings → Environment Variables):
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SECRET` (any long random text).

## Deploy to Vercel (one time, ~5 minutes)

1. Push this folder to a GitHub repo (or run `npx vercel` inside this folder with the Vercel CLI).
2. In https://vercel.com → **Add New → Project** → import the repo. Framework is auto-detected (Next.js). Deploy.
3. **Connect storage (required):** In the project → **Storage** tab → **Create Database → Blob** → connect it to the project. This adds the `BLOB_READ_WRITE_TOKEN` variable automatically.
4. Go to **Deployments** → ⋯ menu on the latest deployment → **Redeploy** (so the storage token takes effect).
5. Done. Share `https://<your-app>.vercel.app/` with students. Admin panel: `https://<your-app>.vercel.app/admin`.

## Run locally

```bash
npm install
npm run dev
```
Note: submissions need the Vercel Blob token. For local testing create `.env.local` with `BLOB_READ_WRITE_TOKEN=<token from Vercel Storage page>`.

## Logo

The footer currently shows a styled text mark "Powered by Vinsup Skill Academy". To use your real logo, put it at `public/logo.png` and replace the `.powered` span in `app/p/[slug]/page.js` and `app/page.js` with:
`<img src="/logo.png" alt="Vinsup Skill Academy" />`
