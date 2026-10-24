# Club Event Radar — Handoff for Nicole

## What works now

Website: https://hyrids.github.io/BUS4498_InClass_Builds/event_radar/

The public event board reads published events from Supabase. The `submit-event` Edge Function uses `OPENAI_API_KEY` to turn announcements into event cards, checks the posting rules, catches duplicates, and accepts optional JPG/PNG flyer photos up to 5 MB. Posts with photos always wait for moderator review, and approved photos appear on the event card.

## Where things live

- Repository: `BUS4498_InClass_Builds`
- Supabase project: `event-radar`
- Project URL: https://bhrkeunjxvyyopmxexnp.supabase.co
- Website files: `event_radar/index.html`, `event_radar/style.css`, `event_radar/app.js`, and `event_radar/config.js`
- Rules and places: `event_radar/context/posting-rules.md` and `event_radar/context/campus-places.md`
- Database migrations: `event_radar/supabase/migrations/`
- AI agent: `event_radar/supabase/functions/submit-event/index.ts`
- Flyer storage bucket: `flyers`

## Secrets

The secret name is `OPENAI_API_KEY`, stored in Supabase → Edge Functions → Secrets. Nicole does not need the value. The website contains only the public Project URL and publishable key; never add a secret key, database password, or AI key to the repository.

## How to test

1. Post the clean Game Night example in `test/sample-announcements.md`: it should be **Published**.
2. Post the off-campus/alcohol/Venmo example: it should be **Waiting for review**, with those reasons and no personal phone number or payment handle on the card.
3. Upload `test/sample-flyer.png` with “Clothing swap next week, all the details are on the flyer!”: it should be **Waiting for review**, the card should read the flyer details, and the photo should open from Storage after approval.

## What’s next

The Stage 8 moderator interface is written in `index.html` and `app.js`, and its migration is saved as `supabase/migrations/20261023000300_moderator_sign_in.sql`, but Supabase still needs approval to apply the authenticated moderator permissions. After applying it, confirm the moderator account works, approve a waiting flyer post, and verify that it appears on the public website. New user sign-ups should remain disabled.

## How we take turns

Download or pull the latest repository before starting. Upload or push your changes when you stop. Tell each other before working so we do not overwrite each other’s files.
