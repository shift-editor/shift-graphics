# Spacing and kerning arrive.

Shift 0.1.2 is the second alpha. The editor canvas now holds a line of proof text, and two new tools, **Spacing** and **Kerning**, let you adjust a font's rhythm directly in that text.

This is still early software. Work on copies of your fonts and keep independent backups. Documents saved in 0.1.2 use a newer format and no longer open in 0.1.1.

<!-- PLACEHOLDER HERO: no 0.1.2 hero image yet. Add /releases/0.1.2/hero.png (and optionally og.png at 1200×630) or remove this comment. -->

## Type proof text around your glyph

The glyph you open now sits inside a line of text. Choose the **Text** tool (**T**) and type around it: the line reflows as you go, and the glyph you are editing stays editable in place. Back in **Select**, double-click any glyph in the line to edit it, or double-click a component to open its base glyph beside the one you are editing.

Press **Escape** to step out one level at a time: deselect, then leave the glyph. At that level, glyphs in the line can be moved, scaled, rotated, and flipped as whole glyphs, and every copy in the line updates together.

Proof text uses the font's pair kerning, so what you type is spaced as the font will be.

<!-- PLACEHOLDER VIDEO: Text tool. Shot: open a glyph (e.g. "n"), press T, type "hnohn" around it, double-click another glyph to edit it in place, Escape out. ~15 s. Upload to R2 at the keys below, then delete this comment. -->
::video{mp4="https://releases.shift.graphics/media/v0.1.2/proof-text.mp4" poster="https://releases.shift.graphics/media/v0.1.2/proof-text.jpg" label="Typing proof text around a glyph and editing glyphs in place in Shift"}

## Space glyphs with the Spacing tool

The **Spacing** tool (**S**) shows each gap between glyphs as two halves: the left glyph's right sidebearing and the right glyph's left sidebearing. Hover a half to see its value, then drag to change it. Every copy of that glyph updates live, and the drag snaps to the other half of the gap or to the glyph's opposite sidebearing.

Click a value to type an exact number. **↑** and **↓** step it (**Shift** for 10), **Tab** moves to the other side, and **Escape** cancels. Click a half to select it, then nudge it with the arrow keys (**Shift** ×10, **Cmd** ×100) and walk along the line with **Tab** and **Shift+Tab**.

In kerned text, each sidebearing is still measured against its own glyph's advance, so spacing never disturbs the kern.

<!-- PLACEHOLDER VIDEO: Spacing tool. Shot: proof text such as "HOHOHnonon", press S, hover gaps, drag an "n" sidebearing (show the snap highlight), click the pill and type a value, Tab across halves. ~20 s. -->
::video{mp4="https://releases.shift.graphics/media/v0.1.2/spacing.mp4" poster="https://releases.shift.graphics/media/v0.1.2/spacing.jpg" label="Adjusting sidebearings in proof text with the Spacing tool in Shift"}

## Kern pairs and groups

The **Kerning** tool (**K**) shares a toolbar slot with **Spacing**. It draws each kern as a strip between the two glyphs with its value below the baseline. Drag the strip or nudge with the arrow keys to change it; hovering a value highlights every pair in the line that the edit will reach.

Select a pair and the **Kerning** section in the sidebar shows each side's group, an exception lock for each side, and the kern value. In a variable font, a **Masters** list shows the pair's value at each master and lets you remove it from one.

Open the kerning groups panel from the **Kerning** section to create, rename, and delete groups, and to add or remove members. Its preview sets every member of a group against the other side of the current pair, so you can check a whole group at once.

Kerning is kept for each master through UFO, Designspace, and Glyphs import, save, and export.

<!-- PLACEHOLDER VIDEO: Kerning tool. Shot: text like "AVATAR To", press K, drag the A/V kern, select T/o, open the groups panel and show the preview of the "o" group against T, add a member. Show the Masters list if using a variable font. ~25 s. -->
::video{mp4="https://releases.shift.graphics/media/v0.1.2/kerning.mp4" poster="https://releases.shift.graphics/media/v0.1.2/kerning.jpg" label="Kerning pairs and editing kerning groups with the Kerning tool in Shift"}

## Snap to metrics and points

Points you drag with **Select** or place with the **Pen** now snap to the baseline, x-height, cap height, ascender, and descender, and line up with other on-curve points on screen. Guides show what a point has snapped to, and points resting exactly on a metric line get a soft halo. Hold **Cmd** (**Ctrl** on Windows and Linux) to suspend snapping, or **Alt** to turn it off for the whole drag.

<!-- PLACEHOLDER VIDEO: Snapping. Shot: drag a point up to the x-height (guide appears), align a second point horizontally with a stem point, place a Pen point onto an existing point. ~12 s. -->
::video{mp4="https://releases.shift.graphics/media/v0.1.2/snapping.mp4" poster="https://releases.shift.graphics/media/v0.1.2/snapping.jpg" label="Points snapping to vertical metrics and aligning with other points in Shift"}

## A toolbar that floats

The tools have moved out of the title bar into a floating bar over the canvas. Drag its grip to dock it to the top, bottom, left, or right edge of the canvas; it turns to fit the edge and follows the canvas as sidebars open and close.

<!-- PLACEHOLDER VIDEO (optional, short): drag the toolbar grip from bottom to left to top. ~6 s. Remove this slot if it feels like too much. -->
::video{mp4="https://releases.shift.graphics/media/v0.1.2/toolbar.mp4" poster="https://releases.shift.graphics/media/v0.1.2/toolbar.jpg" label="Docking the floating toolbar to different canvas edges in Shift"}

## Smaller improvements

- The **Objects** sidebar shows each closed contour's direction and marks its first point. Click the direction icon to reverse the contour.
- The **Add Component** picker can be browsed with the arrow keys.
- Unsaved changes are shown with a dot (in the close button on macOS) instead of "Edited".
- After a crash, forced quit, or update restart, open documents reopen on the glyph they last showed.
- On Windows and Linux, **Open Font…** now lets you pick font files, and **Open Font Folder…** opens UFO and Glyphs packages.
- Imported fonts whose features use `include()` files now compile, and variable fonts with mapped weight axes interpolate correctly again.

## Shift and agents

Every Shift build now bundles `shift-cli`. Choose **Shift → Install Command Line Tool…** (**Help → Install Command Line Tool…** on Windows and Linux) to put it on your `PATH`, and optionally install the Shift agent skill for Claude Code, Codex, and other agents. The CLI can now read and edit kerning, among other font authoring commands.

In **Settings → Agents**, turn on **Allow agent connections** to let local agents read the fonts open in Shift over MCP. It is off by default and read-only: agents can inspect and render, but not change, an open font.

## Platforms

- Windows and Linux now have native arm64 builds, and arm64 packages are published to the APT and DNF repositories.
- On Windows and Linux, Shift draws its own title bar with the menus built in.
- Linux AppImages in a writable folder now update themselves, as macOS builds do.
- Shift now runs on Ubuntu 18.04 and RHEL 8 and later. macOS 13 or later is required; Windows 10 or later as before.

## Known limitations

- Documents opened and saved in 0.1.2 are upgraded to a newer format and cannot be opened in 0.1.1.
- Proof text is a single line, and OpenType features are not yet applied to it.
- TTF and OTF files remain view-only.
- Windows release builds are unsigned, may display an operating-system warning, and do not update automatically.

Please continue working on copies and keep your original sources and independent backups.

## Share feedback

The Help menu includes **Report a Problem**, **Show Logs**, and **Feedback**. You can also [email me directly](mailto:updates@shift.graphics). Try spacing a word or two, and tell me what you would reach for next.

<!-- PRIVATE EDITORIAL CHECK: Replace every ::video slot (keys under media/v0.1.2/ are planned, not uploaded) and add a hero. Importer is pinned to cb0fcac; PR head d318084 also includes #617 (Ubuntu 18.04 / RHEL 8 / macOS 13) — re-run the importer and confirm it appears in changelog.md. After publication, refresh from tag v0.1.2 and verify date, assets (incl. arm64), signing status, and the "Windows does not update automatically" line. -->
