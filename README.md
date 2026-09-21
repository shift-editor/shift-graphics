# Shift Graphics

Website and marketing site for [Shift](https://github.com/shift-editor/shift) — a free, open-source font editor built with TypeScript and Rust.

## Run locally

Use Node.js 24 (the server tests use Node’s TypeScript stripping).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

## Footer updates signup

`UpdatesSignupForm` appears in the shared site footer and uses the `subscribeToUpdates` Server Action. It stores contacts in Resend for release announcements and occasional development notes. A separately controlled confirmation email can be sent once to newly created contacts. Signup is **off by default**; without its required configuration, the form stays visible but its submit button is disabled.

### Configuration — set manually in Vercel, not in agent-accessible files

| Variable | Purpose |
| --- | --- |
| `UPDATES_SIGNUP_ENABLED` | Set to the literal `true` to enable contact storage. Unset or any other value disables it. |
| `UPDATES_SIGNUP_EMAILS_ENABLED` | Separately set to `true` to send a best-effort confirmation to newly created contacts. Leave off for collection-only rollout. |
| `RESEND_API_KEY` | Server-only Resend key. Contact management requires Full access, which also permits sending; it is **not** a no-send credential. |
| `TURNSTILE_SECRET_KEY` | Server-only Cloudflare Turnstile secret. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public site key for the same Turnstile widget. |

Do not paste secrets into chat or commit them. The switch is a rollout control, not a security sandbox.

Before enabling signup:

1. Configure Turnstile for `shift.graphics` and `www.shift.graphics`. The server requires a successful, single-use token with the `updates-signup` action and one of those hostnames. Production verification rejects localhost. No Turnstile script loads while signup is disabled.
2. Configure suitable request-rate limits at Cloudflare/Vercel for Server Action POST requests. Turnstile is bot protection, not a distributed rate limiter.
3. Review the form states at `/preview/footer?state=idle|submitting|success|error` and the confirmation template at `/preview/updates-confirmation`. Both previews disable external actions and return 404 outside development. Verify the Resend sending domain and reply routing before enabling confirmation delivery.
4. Deploy with both switches off and review the footer. Redeploy after setting the environment variables because the enabled state and public site key are set during the build. Enable contact storage before separately enabling confirmations.
5. Before sending any announcement, use a subscription-aware Resend Broadcast with an unsubscribe link. Existing opted-out contacts must remain opted out.

No deployment, credential change, contact import, campaign creation, scheduling, or live email delivery is part of this implementation.

### Behaviour and limits

- Form states: `idle` → `submitting` → `success` or `error`. Errors preserve the email and reset the challenge for a retry.
- Email is required, trimmed, validated, and lowercased. Contact storage must succeed before the UI reports success.
- Existing contacts are never mutated by signup, so an opted-out contact stays opted out. Concurrent duplicate creates resolve without changing email preferences.
- Confirmation delivery is best-effort and only attempted for a newly created, still-subscribed contact. Existing contacts receive no repeat or retroactive confirmation. A delivery failure does not invalidate the saved contact, and Resend receives an idempotency key for accepted retries.
- Provider failures, invalid input, and failed challenges never produce fake signup success. Raw addresses, secrets, tokens, and provider error bodies are not logged by application code.
- Resend Broadcasts, rather than custom website endpoints, own campaign delivery and unsubscribe handling. The transactional confirmation tells recipients that future updates include an unsubscribe link.

## Verification

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

`npm test` runs a fake provider entirely in-process with dummy keys and blocks real network access. It covers validation, Turnstile claims and replay, duplicate and concurrent signups, opt-out preservation, confirmation gating and delivery failures, and provider failures. It does not establish live Resend or Turnstile account configuration.

## Build

```bash
npm run build
npm start
```

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS.
