# Shift Graphics

Website and marketing site for [Shift](https://github.com/shift-editor/shift) — a free, open-source font editor built with TypeScript and Rust.

## Run locally

Use Node.js 24 (the server tests use Node’s TypeScript stripping).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Waitlist and email design preview

With `npm run dev` running, open [http://localhost:3000/preview/waitlist](http://localhost:3000/preview/waitlist).

- Development-only page; returns 404 in production.
- Editable fields for visual review, with submission deliberately disabled. No mock submission flow yet.
- Thank-you email draft: `src/emails/thank-you.html`. Uses inline styles and presentation tables; no external assets or tracking.
- Email logo: `src/emails/assets/shift-logo.svg`, copied from Shift’s `apps/desktop/src/renderer/src/assets/launcher-logo.svg` (blue landing-page lockup). `shift-logo.png` is its email-compatible export, cropped to `{ left: 140, top: 170, width: 890, height: 225 }` and resized to 448px wide. The preview embeds the PNG locally; future delivery must attach it with Content-ID `shift-logo` to resolve the template’s `cid:shift-logo` image.
- This preview never invokes the form action or connects to Resend. Its links are sandboxed, and its unsubscribe URL is an inert placeholder.
- Browser preview is not email-client compatibility testing.

## Release notes and announcement preparation

`/releases` is a full release feed with editorial highlights and asset-backed downloads. The shared `ReleaseEntry({ release, view })` renders the same entry at `/releases/<version>` (for example, `/releases/0.1.1` or `/releases/0.1.1-alpha.1`), with the generated full changelog open by default. Desktop entries use a sticky version/date rail; mobile entries stack the metadata above the content. Version pages support `#highlights`, `#downloads`, and `#changelog`; feed permalinks use `#<version>`. Slugs use the exact version without a leading `v`; the original GitHub tag remains in metadata. Unknown versions return 404. Approved emails should link directly to the version page, not the index. The homepage navigation links to the index. There is no GitHub request during builds or page visits, no remote MDX execution, and no automatic publication.

- Approved published entries live in `content/releases/v<version>/`, containing exactly `release.json`, `notes.md`, and `changelog.md`. See `content/releases/README.md` for the publication contract.
- Public editorial drafts live in `content/drafts/`. Local development and Vercel Preview builds show them on `/releases`; production builds exclude them. See `content/drafts/README.md`.
- Announcement email drafts remain in the sibling private `shift-comms` checkout. `/preview/release?release=pr-<number>` previews the corresponding private `email.html` in local development only. Its sandbox and content policy disable scripts, external resources, forms, and new-window navigation.
- Keep recipient data, credentials, and live unsubscribe links out of both repositories.

```sh
npm run release:prepare -- --pr <number>
# After the app release is published, retain the same editorial directory:
npm run release:prepare -- --pr <number> --tag <tag>
```

The local importer pins the Release Please PR head SHA, checks its manifest, and extracts only that version's changelog. It updates generated files while preserving `notes.md`. Published prereleases are eligible; rolling Nightly is not a versioned alpha. Unpublished GitHub draft releases are prepared from their PR instead.

The project skill `.agents/skills/shift-release-prep/SKILL.md` documents the complete preparation/review workflow; reload Pi and invoke `/skill:shift-release-prep`. The private repo contains the scheduled/private-PR workflow, initially **unpublished with its cron commented out**. Enabling it requires a reviewed push and repository permission setup; it has no website deployment or email-send credentials.

Draft notes are public once pushed to this repository, but importing source data is not production publication approval. Preview deployment, production deployment, and email delivery are separate actions. No Resend contact import, scheduling, campaign creation, or delivery occurs in these pages or preparation scripts.

To revert this feature, remove the `/releases` route, `src/lib/releases.ts`, `content/releases/`, the homepage navigation link, and the `release:prepare` package script; remove `react-markdown`/`remark-gfm` if unused elsewhere. Keep the private checkout so editorial work is not lost.

## Server-backed waitlist

Homepage signup buttons link to `/waitlist`, which uses `WaitlistForm` and the `submitWaitlist` server action instead of Formspree. The form and its confirmation stay on that dedicated page. **Signups and welcome delivery are both off by default.** Deploying without the configuration below keeps submission disabled while leaving the fields editable; it does not fall back to Formspree or pretend to save signups.

### Configuration — set manually in Vercel, not in agent-accessible files

| Variable | Purpose |
| --- | --- |
| `WAITLIST_ENABLED` | Set to the literal `true` to enable signup storage. Unset or any other value disables it. |
| `WAITLIST_EMAILS_ENABLED` | Separately set to `true` to enable a best-effort thank-you email for newly created contacts. Leave off for collection-only rollout. |
| `RESEND_API_KEY` | Server-only Resend key. Contact management requires Full access, which also permits sending; it is **not** a no-send credential. |
| `TURNSTILE_SECRET_KEY` | Server-only Cloudflare Turnstile secret. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public site key for the same Turnstile widget. |
| `UNSUBSCRIBE_SECRET` | Independent, cryptographically random secret of at least 32 characters for signing unsubscribe links. Required before welcome delivery; keep it available long-term. |

Do not paste secrets into chat, commit them, or expose them to this agent. Vercel storage is not an agent isolation boundary if the agent can retrieve those values with other credentials or tools. The switches are rollout controls, not a security sandbox.

Before enabling anything:

1. Review remaining transitive dependency audit findings before production rollout. The Next.js-specific advisories were cleared by upgrading `next` and `eslint-config-next` to `16.3.4`.
2. In Resend, create a **string** contact property named `feedback`. The form accepts up to 2,000 characters and does not truncate. Confirm that limit in the configured account before rollout.
3. Configure Turnstile for `shift.graphics` and `www.shift.graphics`. The server requires a successful, single-use token with the `waitlist` action and one of those hostnames. Production verification deliberately rejects localhost. No Turnstile script loads while submission is disabled.
4. Configure suitable request-rate limits at Cloudflare/Vercel for Server Action POST requests (normally `/waitlist`). Turnstile is bot protection, not a distributed rate limiter. Resend may also return rate-limit errors; the form handles storage failures without reporting false success.
5. Verify the sending domain in Resend. From is `Shift <updates@shift.graphics>` and Reply-To is `updates@shift.graphics`; keep Cloudflare’s incoming-mail forwarding intact.
6. Deploy with both switches off and review. Enable collection first; enable thank-you emails only after explicitly approving a real delivery test and confirming reply routing, email rendering, and unsubscribe. Redeploy after environment changes: the waitlist page’s enabled state and public site key are set during the build.

No deployment, credentials, real delivery test, CSV import, or changes to the existing Formspree account are part of this implementation.

### Behaviour and limits

- Form states: `idle` → `submitting` → `success` or `error`. Errors preserve controlled input values and reset the challenge so the user can retry with a fresh token.
- Email is required, trimmed, validated, and lowercased. Feedback is optional. Existing contacts retain their unsubscribe status, and blank repeat feedback does not erase previous feedback. Nonempty repeat feedback replaces the previous value; this is **not** a feedback history database.
- Contact storage must succeed before the UI reports success. Provider failures, invalid input, and failed challenges never produce fake success. Raw addresses, feedback, secrets, tokens, and provider error bodies are not logged by application code.
- Thank-you delivery is **best-effort**, not a transactional outbox. A failed welcome does not invalidate the saved contact. There is no background queue or automatic retry; repeating the form for an existing contact does not resend the welcome. A create whose response was lost may save the contact without a welcome.
- New-contact sends recheck the subscription status and use `shift-welcome/<contact-id>` as a Resend idempotency key (retained by Resend for 24 hours). Normal repeat signups skip sending independently of that window. There is no claim of durable exactly-once delivery across deletes/reimports or every possible provider race.
- `/unsubscribe?token=…` is a signed confirmation page. GET only checks the signature locally; link scanners do not change subscriptions. Confirming POST sets the contact’s global `unsubscribed` flag in Resend. Opt-outs continue to work with both rollout switches off, provided the API key and signing secret remain configured. Keep the signing secret stable or old links will stop working.
- The URL uses an opaque contact ID, not an email address, and the page sets `no-referrer` and `noindex`. It is a bearer link: do not log/share it. This is a confirmation flow, not an RFC 8058 one-click endpoint.
- Future update/release campaigns are not implemented. Use subscription-aware Resend Broadcasts for those; the transactional welcome endpoint is not a campaign sender.

## Verification

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

`npm test` runs a fake provider entirely in-process with dummy keys and blocks real network access. It covers validation, Turnstile claims/replay, duplicate and concurrent signups, feedback persistence, opt-out preservation, delivery failures, idempotency, signed links, and unsubscribe retries. It does not establish live Resend account configuration or email-client compatibility.

## Build

```bash
npm run build
npm start
```

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS.
