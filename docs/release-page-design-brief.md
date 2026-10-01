# Release page design brief

Status: draft, 9 Sep 2026. Owner: Kostya. Shortlist of liked references still to be added (see the end).

## What we are building

Redesign the two existing release routes on shift.graphics so they read like a product changelog rather than a plain notes page:

- `/releases` — the index (`src/app/releases/page.tsx`)
- `/releases/<version>` — one page per release (`src/app/releases/[version]/page.tsx`)

Content comes from `content/releases/v<version>/` (`release.json`, `notes.md`, `changelog.md`). Do not change that content model or the publishing flow in `content/releases/README.md` and `.agents/skills/shift-release-prep/SKILL.md`. The redesign is presentation only. Downloads are derived from `release.json` assets by filename pattern (macOS arm64/x64 DMG, Windows x64 setup, Linux AppImage/deb/rpm) plus an "All files" link to GitHub. Nightly is a rolling GitHub prerelease and is linked, not rendered.

Site constraints already in place: light background `#e9e9e9`, DM Sans body, Familjen Grotesk headings, `royalblue` accent, `SiteNav` at the top, Tailwind 4, Next 16 app router, react-markdown for notes. Stay inside that.

## Inspiration board

Canvas: `/Users/kostyafarber/Downloads/shift-reference.tldraw`, page **Releases Pages** (page id `page:_0ivo3xqECUU6bFcnyqmb`).

How to read it with the `tldraw-offline` skill: the page holds 50 frames, one per reference, laid out in five sections (Code editors, Font editors, Design tools, Product changelogs, Galleries). Each frame is named after the site, contains a text shape with a one-line design note plus the URL, and an image shape of the top ~3200px of the page at 1440px wide. The image shape's `url` prop is the live page. Frame ids are `rel-frame-<slug>`, note ids `rel-note-<slug>`.

Fallback list if the canvas is not reachable:

| Section | References |
| --- | --- |
| Code editors | Zed `zed.dev/releases` and `zed.dev/releases/stable/latest`, VS Code `code.visualstudio.com/updates`, Cursor `cursor.com/changelog`, Warp `docs.warp.dev/changelog/2026/`, Sublime Text `sublimetext.com/download` and `/dev`, IntelliJ `jetbrains.com/idea/whatsnew/`, Nova `nova.app/releases/` and `/releases/13/`, Ghostty `ghostty.org/docs/install/release-notes/1-3-0`, Helix `helix-editor.com/news/release-25-07-highlights/`, Tailwind `github.com/tailwindlabs/tailwindcss/releases` |
| Font editors | Glyphs `glyphsapp.com/news/glyphs-4-create-love-the-process`, `/news/glyphs-3-4-released`, `/news`; RoboFont `robofont.com/version-history/` and `/announcements/RoboFont-4.3/`; FontLab `help.fontlab.com/fontlab/8/whats-new/` and `/whats-new/whats-new-01-explore-prepare/`; Fontra `fontra.xyz/changelog.html`; Glyphr Studio `glyphrstudio.com/help/about/updates.html`; Fontself `fontself.com/blog`; LTTR/INK `lttrink.com` |
| Design tools | Figma `figma.com/release-notes/`, Sketch `sketch.com/changelog/` and `/changelog/florence/`, Framer `framer.com/updates/`, Rive `rive.app/changelog`, Spline `updates.spline.design`, Blender `blender.org/download/releases/5-0/` and `/download/releases/`, Godot `godotengine.org/releases/4.7/`, Krita `krita.org/en/posts/2026/krita-5.3.0-released/`, Inkscape `wiki.inkscape.org/wiki/Release_notes/1.4`, Penpot `penpot.app/dev-diaries`, Affinity `affinity.studio/blog/affinity-update-april-2026`, Procreate `help.procreate.com/articles/Ls9oMu-procreate-5-4-update-at-a-glance` |
| Product changelogs | Raycast `raycast.com/changelog`, Linear `linear.app/changelog`, Vercel `vercel.com/changelog`, GitHub `github.blog/changelog/`, tldraw `tldraw.dev/releases/v5.4.0`, Obsidian `obsidian.md/changelog/`, Things `culturedcode.com/things/whats-new/`, Craft `craft.do/blog/category/whats-new`, Notion `notion.com/releases` |
| Galleries | `nicelydone.club/pages/changelog`, `saasinterface.com/pages/changelog-updates/`, `saasframe.io/categories/changelog` |

## Direction (from Kostya)

- Liked: **Cursor, Notion, Raycast.**
- The shape that works: a gutter on the left carrying version and date, a hero, then the release content, and a **download panel underneath with the date and platform links**.
- Undecided: one long feed page, or one page per release.

Recommendation: do both, which is exactly what Cursor, Notion and Raycast do. The index is the feed of full entries. Each entry has a permalink to `/releases/<version>`, which renders the same entry on its own with the download panel expanded and the full changelog open. One component, two contexts.

## Layout archetypes (measured at 1440px viewport)

| Archetype | Examples | Numbers |
| --- | --- | --- |
| **Feed with left rail** (liked) | Cursor, Linear, Notion, Raycast, Vercel | Single centred text column 600 to 730px wide starting around x=400 to 570. Rail to the left holds date or version and is sticky per entry. Hero images equal the column width (620 to 760px). Body 16px. Header 52 to 73px, fixed or sticky. |
| **Three-column docs** | Zed, VS Code, tldraw, Warp | Left sidebar 224 to 300px listing versions or channels, right sidebar 224 to 256px for TOC or pin board, content between. Body 13 to 16px. Best when there are many versions to navigate. |
| **Download page as release page** | Sublime Text, Zed single release | 740px changelog column with a ~290px aside of download buttons. Every version block carries its own platform grid. |
| **Splash page per major version** | Blender, Godot, Nova 13, Glyphs 4 | Full-bleed hero art, h1 55 to 80px, 620 to 800px text column, images up to full width. Too heavy for a point release; keep for milestones. |
| **Plain centred column** | RoboFont, Fontra, Obsidian, Figma | 660 to 820px column, no rail, no hero. What we have today. |

Palette note: Raycast, Linear, Rive, Ghostty, Framer and Nova are dark. Shift's site is light, so the closest tonal matches are Cursor (`#f7f7f4`), Vercel and Sketch (`#fafafa`), Notion and Glyphs (white).

## Proposed layout for Shift

Index and version page share one entry component.

- **Grid:** max width about 1040px. Left rail 200px, gap 40px, content column 720px. Below ~900px the rail collapses above the entry.
- **Rail (sticky within the entry):** version as the largest element, date below it in `text-neutral-500`, a "Prerelease" tag when set. On the version page the rail also gets "All releases" and, later, previous and next.
- **Entry body, in order:** title (first H1 of `notes.md`), one-paragraph summary (first paragraph), hero image (first image in `notes.md`, 1800x1000, rendered at column width with the existing `#e3e3e1` placeholder), highlights from the rest of `notes.md` with h2 and h3 as today.
- **Download panel** directly under the highlights: a card the width of the column with the version and date repeated in its header, one row per platform (macOS: Apple silicon, Intel; Windows: x64; Linux: AppImage, deb, rpm), an "All files" link and the Nightly note as a footer line. This is the piece Kostya specifically asked for. Cursor's "Get started" strip and Sublime's grid are the references.
- **Full changelog** stays in a `details` block below the panel on the version page. On the index it is a link only.
- **Index-only extras:** the empty state stays as today; when there are more than about eight entries, add year grouping in the rail like Warp and Penpot.

Typography stays with the existing stack. Suggested sizes: h1 36 to 40px, body 15 to 16px, rail version 20 to 24px.

## URL structure

What the references do:

| Pattern | Who |
| --- | --- |
| Feed plus a permalink per entry | Cursor `/changelog/<slug>` and `/changelog/page/2`, Linear `/changelog/YYYY-MM-DD-slug`, Notion `/releases/YYYY-MM-DD`, Vercel `/changelog/<slug>`, GitHub `/changelog/YYYY-MM-DD-slug`, Obsidian `/changelog/YYYY-MM-DD-<platform>-v1.14.1/`, Sketch `/changelog/<city>/`, Penpot `/release-notes/2-17-the-universal`, Glyphs `/news/<slug>` |
| Channel then version | Zed `/releases/stable/1.18.1`, `/releases/preview/…`, `/releases/stable/latest`; Raycast `/changelog/macos/2-2` |
| Version only | VS Code `/updates/v1_137`, tldraw `/releases/v5.4.0` |
| Year archive with anchors | Warp `/changelog/2026/#20260902-v…`, Nova `/releases/#v14.1` |
| RSS or Atom | Raycast `changelog/feed.xml`, Linear `rss/changelog.xml`, Notion `releases/rss.xml`, Zed `stable-releases.rss`, Nova `feeds/releases.xml`, Sketch `changelog/feed.xml`, GitHub `changelog/feed/`, Obsidian `changelog.xml` |

For Shift, keep the current scheme and add the small things everyone else has:

- Keep `/releases` and `/releases/<version>` with the exact version and no leading `v`. Already canonicalised in metadata.
- Add `/releases/latest` as a redirect to the newest published version, like Zed.
- Add `/releases/feed.xml` (RSS) generated from the same snapshots at build time.
- Add stable anchors on each entry: `#highlights`, `#downloads`, `#changelog`, and on the index `#<version>` so an email can deep-link a section.
- Do not add channel segments yet. Nightly has no snapshots to render, so link it rather than route it. Revisit if Nightly ever gets curated notes.

## Out of scope

- Any change to `content/releases` format, the private notes repo, the import script, or email templates.
- Dark mode.
- GitHub fetches at build or request time.

## Shortlist

To be filled in by Kostya with the references he likes most from the board. Until then treat Cursor, Notion and Raycast as the primary references and the rest as secondary.

## Open questions

- Should the index show the full highlights per entry (Cursor, Linear) or a summary plus "Read release notes" (current)? Recommendation: full highlights while there are fewer than ten releases.
- Does the download panel belong on the index too, or only on the version page? Recommendation: both, since the index is where people land from the homepage nav.
