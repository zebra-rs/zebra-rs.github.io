# github.md

repo: zebra-rs/zebra-rs
branch: main
path: book/src

## Last sync

date: 2026-07-26T02:22:01Z
commit: 86b081a3672b

### Updated in this project

- Refreshed all 133 book chapters into `book/docs-data.js` (the data file `docs.html` loads).
- Removed the stale `ch-16-00-ebpf.md` left at the project root.
- Cleaned up temp chunk files and root-level `.md` copies after the rebuild.

## Screen map

| Screen | Built from |
| --- | --- |
| docs.html | `book/src/*.md` (all 133 chapters, via `book/docs-data.js`); sidebar order from `book/src/SUMMARY.md` |
| protocols.html | `book/src/appendix-b-supported-rfcs.md` (mirrored into `assets/rfcs.jsx`) |
| install.html | `book/src/ch-00-06-install.md`, `book/src/ch-00-07-building.md` |
| playset.html | repo `playset/` READMEs + `playset/images/*.png` |
| index.html | hand-authored landing page (version pill tracks the latest release tag) |

## Notes

- `docs.html` renders the Markdown source into this site's own theme; the repo's
  pre-rendered mdBook HTML under `book/book/` is intentionally not used.
- Sync procedure: `github_copy_files` with `path_prefix: book/src` lands files at
  the PROJECT ROOT (prefix stripped). Build `book/docs-data.js` from those root
  `.md` files in chunks of ~25 (a single pass over all 133 times out), combine the
  chunks, then delete the root `.md` files and chunk files.
