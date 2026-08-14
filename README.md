# Julian Birthday

Private birthday microsite for Julian's 33rd birthday and a 2027 trip to
[WEIN AM STEIN](https://wein-am-stein.de/) in Würzburg.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## RSVP persistence

The planner always saves to the browser under
`julian-birthday-rsvp-v1`. Cloud persistence is optional.

1. Create a Neon database (or Vercel Postgres backed by Neon).
2. Add `DATABASE_URL` in Vercel project settings.
3. Redeploy.

The first API request creates `julian_birthday_rsvp` automatically and
upserts one stable row (`julian`). Without `DATABASE_URL`, the API returns
503 and the client intentionally treats the save as local-only success.

## Dates

The verified official festival window is **8–25 July 2027**. The 2027 lineup
and ticket days are not published yet, so all selected dates remain provisional
and editable.

## Commands

- `npm run lint`
- `npm run build`

No secrets belong in the repository. Copy `.env.example` to `.env.local`
for local cloud-persistence testing.