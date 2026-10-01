# Published release notes

Only explicitly approved, published entries belong here. Public editorial drafts live in `content/drafts/`; announcement emails remain outside the website repository.

An entry is a directory named `v<version>` containing exactly:

- `release.json`: imported release metadata and changelog digest.
- `notes.md`: reviewed editorial highlights, local screenshot links, and limitations.
- `changelog.md`: generated GitHub release body, unmodified.

PR-only snapshots without a publication date are rejected. Published prereleases, including alphas, are allowed.

Publishing is a manual, approval-required step: refresh the local draft using `--pr <number> --tag <tag>`, review the exact generated source and editorial copy, then copy these three files into `content/releases/v<version>/`. Production deployment and email sending require their own approval.

`/releases` lists entries and links to `/releases/<version>`, where highlights, downloads, and the full changelog render. The URL uses `release.json`'s exact `version` without a leading `v`, including any prerelease suffix; the original GitHub `tag` is preserved. Each version must be unique. Version pages are generated from approved snapshots at build time; unknown versions return 404.

Both routes read these files locally, with no GitHub request during builds or page visits. Local development and Vercel Preview builds also include `content/drafts/`; production excludes it.
