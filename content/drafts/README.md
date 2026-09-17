# Release-note drafts

Release-note drafts are public editorial work stored in this repository. They appear on local development builds and Vercel Preview deployments, but never on the production site.

Each draft lives in `v<version>/` and contains exactly:

- `release.json`: generated PR or release metadata.
- `notes.md`: hand-edited release highlights.
- `changelog.md`: generated changelog text.

Refresh a Release Please draft with:

```sh
npm run release:prepare -- --pr <number>
```

After GitHub publishes the release, refresh the same directory with:

```sh
npm run release:prepare -- --pr <number> --tag <tag>
```

Generated metadata and changelog files must not be hand-edited. The importer preserves `notes.md`. Announcement emails, recipient data, credentials, and live unsubscribe links do not belong here.

Embed a release video with a local H.264 MP4, optional WebM, poster image, and concise accessible label:

```md
::video{mp4="/releases/0.1.1/outline-editing.mp4" webm="/releases/0.1.1/outline-editing.webm" poster="/releases/0.1.1/outline-editing.jpg" label="Drawing and editing curves in Shift"}
```

All media must share the same directory under `public/releases/`. Videos play muted and inline, expose native controls, loop, and remain paused when the visitor prefers reduced motion.

Publishing remains manual: after review and an approved GitHub release, copy the three files into `content/releases/v<version>/`. Creating a public draft does not publish the production website, deploy a preview, or send an announcement.
