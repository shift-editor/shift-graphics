# Pages, proof text, spacing and kerning.

Shift 0.2.0 is the second alpha. A document now holds pages of proof text shaped by your own font, and two new tools, **Spacing** and **Kerning**, let you adjust a font's rhythm directly in that text.

This is still early software. Work on copies of your fonts and keep independent backups. Documents saved in 0.2.0 use a newer format and no longer open in 0.1.1.

![The Spacing tool in Shift: the i in "minimum" set in Newsreader, both sidebearings hatched and snapped to 48](/releases/0.2.0/hero.png)

## Pages and tabs

A document now holds pages, and the canvas shows one at a time. Add, rename, and reorder pages from the pages list in the sidebar. The glyph overview is a pinned tab; each glyph and page you open gets a tab of its own, and the window reopens with the tabs you left.

Undo and redo switch to the page they change, so you always see what came back. Each page keeps its own pan and zoom, and switching pages or tabs never marks the document unsaved.

::video{mp4="https://releases.shift.graphics/media/v0.2.0/tabs-pages.mp4" poster="https://releases.shift.graphics/media/v0.2.0/tabs-pages.jpg" label="Opening glyphs in tabs and adding pages in Shift"}

## Proof text, shaped by your font

The glyph you open sits inside a line of text. Choose the **Text** tool (**T**) and type around it: the text reflows as you go, and the glyph you are editing stays editable in place. Back in **Select**, double-click any glyph in the line to edit it, or double-click a component to open its base glyph beside the one you are editing. Press **Escape** to step out one level at a time; at that level, glyphs in the line can be moved, scaled, rotated, and flipped as whole glyphs.

::video{mp4="https://releases.shift.graphics/media/v0.2.0/type-typing.mp4" poster="https://releases.shift.graphics/media/v0.2.0/type-typing.jpg" label="Typing proof text in Latin, Arabic and Hangul in Shift"}

Proof text is shaped with your font's own feature code and pair kerning, so what you type is set as the font will be. Arabic and other right-to-left scripts work, including lines that mix directions: arrow keys move on screen, and clicks land on ligature carets where the font puts them.

::video{mp4="https://releases.shift.graphics/media/v0.2.0/type-shaping.mp4" poster="https://releases.shift.graphics/media/v0.2.0/type-shaping.jpg" label="Arabic letters changing form and Hangul jamo composing as they are typed in Shift"}

The **Text** section of the sidebar sets each run's size, line height, alignment, language, and script. Turn off **Shaping** to see the text one glyph per character.

::video{mp4="https://releases.shift.graphics/media/v0.2.0/type-bidi.mp4" poster="https://releases.shift.graphics/media/v0.2.0/type-bidi.jpg" label="Mixed Arabic and Latin proof text realigned from the Text section in Shift"}

## Switch features on and off

The **Features** section lists every feature the proof text can switch, grouped as Ligatures, Letter case, Figures, and so on. Click a feature's dot to turn it on or off for the run, or back to the font's default. Hover a tag to highlight the glyphs it changes in the text, and click it to open a preview of every substitution it makes, from which glyphs can be copied or inserted into the text.

::video{mp4="https://releases.shift.graphics/media/v0.2.0/ligatures.mp4" poster="https://releases.shift.graphics/media/v0.2.0/ligatures.jpg" label="Turning ligatures and discretionary ligatures on in the Features section in Shift"}

::video{mp4="https://releases.shift.graphics/media/v0.2.0/stylistic-sets.mp4" poster="https://releases.shift.graphics/media/v0.2.0/stylistic-sets.jpg" label="Switching stylistic sets on one at a time in Shift"}

## Space glyphs with the Spacing tool

The **Spacing** tool (**S**) shows each gap between glyphs as two halves: the left glyph's right sidebearing and the right glyph's left sidebearing. Hover a half to see its value, then drag to change it. Every copy of that glyph updates live, and the drag snaps to the other half of the gap or to the glyph's opposite sidebearing.

Click a value to type an exact number. **↑** and **↓** step it (**Shift** for 10), **Tab** moves to the other side, and **Escape** cancels. Click a half to select it, then nudge it with the arrow keys (**Shift** ×10, **Cmd** ×100) and walk along the line with **Tab** and **Shift+Tab**.

In kerned text, each sidebearing is still measured against its own glyph's advance, so spacing never disturbs the kern.

::video{mp4="https://releases.shift.graphics/media/v0.2.0/spacing.mp4" poster="https://releases.shift.graphics/media/v0.2.0/spacing.jpg" label="Opening a sidebearing with the Spacing tool: every i widens, then it snaps to the opposite sidebearing"}

## Kern pairs and groups

The **Kerning** tool (**K**) shares a toolbar slot with **Spacing**. It draws each kern as a strip between the two glyphs with its value below the baseline. Drag the strip or nudge with the arrow keys to change it; hovering a value highlights every pair in the line that the edit will reach.

Select a pair and the **Kerning** section in the sidebar shows each side's group, an exception lock for each side, and the kern value. In a variable font, a **Masters** list shows the pair's value at each master and lets you remove it from one.

Open the kerning groups panel from the **Kerning** section to create, rename, and delete groups, and to add or remove members. Its preview sets every member of a group against the other side of the current pair, so you can check a whole group at once.

Kerning is kept for each master through UFO, Designspace, and Glyphs import, save, and export.

::video{mp4="https://releases.shift.graphics/media/v0.2.0/kerning.mp4" poster="https://releases.shift.graphics/media/v0.2.0/kerning.jpg" label="Kerning To and We with the Kerning tool in Shift"}

::video{mp4="https://releases.shift.graphics/media/v0.2.0/kerning-breathe.mp4" poster="https://releases.shift.graphics/media/v0.2.0/kerning-breathe.jpg" label="A kern pair following the font's interpolation as the weight changes in Shift"}

## Anchors and marks

Accented glyphs now inherit anchors from their components, as Glyphs and fontc compile them: an accented letter takes its base's anchors and its accent's, so further marks stack on top. Inherited anchors are drawn dimmed in the editor.

Choose **Glyph → Add Anchor** (also in the canvas context menu) to add an anchor at the pointer and name it in the sidebar. Components placed on matching anchors stay attached: move a base anchor and every composite built on it follows, in one undo step. **Align to Anchors** in the context menu reattaches components you moved by hand.

Shift now records each glyph's category and compiles it into GDEF, so glyphs like `jdotless` are no longer treated as marks, and combining marks export at zero width.

## Snap to metrics and points

Points you drag with **Select** or place with the **Pen** now snap to the baseline, x-height, cap height, ascender, and descender, and line up with other on-curve points on screen. Guides show what a point has snapped to, and points resting exactly on a metric line get a soft halo. Hold **Cmd** (**Ctrl** on Windows and Linux) to suspend snapping, or **Alt** to turn it off for the whole drag.

## A toolbar that floats

The tools have moved out of the title bar into a floating bar over the canvas. Drag its grip to dock it to the top, bottom, left, or right edge of the canvas, or double-click the grip to flip it to the opposite edge. It turns to fit the edge and follows the canvas as sidebars open and close.

::video{mp4="https://releases.shift.graphics/media/v0.2.0/toolbar.mp4" poster="https://releases.shift.graphics/media/v0.2.0/toolbar.jpg" label="Dragging the floating toolbar to the left, top and right edges of the canvas, then flipping it with a double-click"}

## Themes

Shift now ships 34 community themes, converted from Tinted Theming's base16 schemes: Catppuccin, Rosé Pine, Tokyo Night, Flexoki, Kanagawa, Everforest, and more. In **Settings → Appearance**, pick one theme for light mode and one for dark, and let Shift follow the system.

Your choice is saved in a plain `config.toml` in Shift's config folder, so it can live in your dotfiles:

```toml
theme = { mode = "system", light = "catppuccin-latte", dark = "kanagawa" }
```

Edits to the file apply to every open window without a restart. Drop a base16 palette into `themes/<name>.toml` to add your own theme, and use its `[colors]` table to override any interface or canvas color, from the accent to the selection fill.

::video{mp4="https://releases.shift.graphics/media/v0.2.0/themes.mp4" poster="https://releases.shift.graphics/media/v0.2.0/themes.jpg" label="One Shift window changing through several bundled themes"}

## A new launcher, and updates in the window

The launcher has a new layout: your most recent font gets a wide tile with its family name set in the font itself, and the rest sit in a grid or list beside **Open…** and **New font**.

Updates are now offered in a small strip at the bottom of the launcher and editor windows, instead of a separate window. Download, watch it fill, and restart when you are ready.

::video{mp4="https://releases.shift.graphics/media/v0.2.0/update-strip.mp4" poster="https://releases.shift.graphics/media/v0.2.0/update-strip.jpg" label="The update strip downloading and offering a restart in Shift"}

## Shift and agents

Every Shift build bundles `shift-cli`. Choose **Shift → Install Command Line Tool…** (**Help → Install Command Line Tool…** on Windows and Linux) to put it on your `PATH`, and optionally install the Shift agent skill for Claude Code, Codex, and other agents. New commands include:

- `shift-cli check` reports interpolation, axis, drawing, and kerning problems in any source Shift opens, with `--json` output.
- `shift-cli font create --from` starts a document with another font's axes, masters, and metrics, and `shift-cli glyph export` copies glyphs, components included, from any font into it.
- `shift-cli` can read and edit kerning, and render proofs of a font without opening the app.

In **Settings → Agents**, turn on **Allow agent connections** to let local agents work with the fonts open in Shift over MCP. It is off by default. Agents can read the font and render it, write proof text, add and rename pages, undo and redo, and change the tool, page, and view. They cannot change glyphs, kerning, or files directly.

::video{mp4="https://releases.shift.graphics/media/v0.2.0/mcp-agent.mp4" poster="https://releases.shift.graphics/media/v0.2.0/mcp-agent.jpg" label="Claude Code setting proof text in Shift over MCP and reading back the kern"}

## Smaller improvements

- Editing large glyphs and large fonts is faster: drags, undo, and opening fonts do less work per edit.
- The **Objects** sidebar shows each closed contour's direction and marks its first point. Click the direction icon to reverse the contour.
- The **Add Component** picker can be browsed with the arrow keys.
- Unsaved changes are shown with a dot (in the close button on macOS) instead of "Edited".
- After a crash, forced quit, or update restart, open documents reopen on the glyph they last showed.
- On Windows and Linux, **Open Font…** now lets you pick font files, and **Open Font Folder…** opens UFO and Glyphs packages.
- Imported fonts whose features use `include()` files now compile, sources with several families or repeated instances open, and variable fonts with mapped axes or scaled components interpolate correctly.

## Platforms

- Windows and Linux now have native arm64 builds, and arm64 packages are published to the APT and DNF repositories.
- On Windows and Linux, Shift draws its own title bar with the menus built in.
- Linux AppImages in a writable folder now update themselves, as macOS builds do, and Linux uses the GPU for drawing.
- Shift now runs on Ubuntu 18.04 and RHEL 8 and later. macOS 13 or later is required; Windows 10 or later as before.

## Known limitations

- Documents opened and saved in 0.2.0 are upgraded to a newer format and cannot be opened in 0.1.1.
- TTF and OTF files remain view-only.
- Windows release builds are unsigned, may display an operating-system warning, and do not update automatically.

Please continue working on copies and keep your original sources and independent backups.

## Share feedback

The Help menu includes **Report a Problem**, **Show Logs**, and **Feedback**. You can also [email me directly](mailto:updates@shift.graphics). Try spacing and kerning a word or two, and tell me what you would reach for next.
