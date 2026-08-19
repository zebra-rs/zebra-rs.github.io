# github.md

repo: zebra-rs/zebra-rs
branch: main
path: book/src

## Last sync

date: 2026-08-19T23:48:18Z
commit: 9a291ce45aa1

### Updated in this project

- Refreshed all 142 book chapters into `book/docs-data.js` (the data file `docs.html` loads).
- New chapter picked up: IS-IS Flexible Algorithm (`ch-07-11-isis-flexalgo.md`).
- Cleaned up temp chunk files and root-level `.md` copies after the rebuild.

## Screen map

| Screen | Built from |
| --- | --- |
| docs.html | `book/src/*.md` (all 142 chapters, via `book/docs-data.js`); sidebar order from `book/src/SUMMARY.md` |
| protocols.html | `book/src/appendix-b-supported-rfcs.md` (mirrored into `assets/rfcs.jsx`) |
| install.html | `book/src/ch-00-06-install.md`, `book/src/ch-00-07-building.md` |
| playset.html | repo `playset/` READMEs + `playset/images/*.png` |
| index.html | hand-authored landing page (version pill tracks the latest release tag) |

## Notes

- `docs.html` renders the Markdown source into this site's own theme; the repo's
  pre-rendered mdBook HTML under `book/book/` is intentionally not used.
- Sync procedure: `github_copy_files` with `path_prefix: book/src` lands files at
  the PROJECT ROOT (prefix stripped). Build `book/docs-data.js` from those root
  `.md` files in chunks of ~25 (a single pass over all of them times out), combine
  the chunks, then delete the root `.md` files and chunk files. Exclude `github.md`
  from that sweep.

## Sync history

- 2026-08-19T04:19:09Z — commit 920e56fe6349 — 141 chapters; added IS-IS hello padding, topology viewer, FlexAlgo AI demo.
- 2026-08-11T14:07:03Z — commit e1796765d096 — 138 chapters refreshed.
- 2026-08-07T16:55:00Z — commit 7a73d869d267 — 138 chapters; latest BGP MUP revisions.
- 2026-08-07T14:19:09Z — commit 47b3138b6302 — 138 chapters refreshed.
- 2026-08-01T18:58:00Z — commit ef3ec26d9b63 — 138 chapters; added VLAN config, multi-address, BGP EVPN over SRv6, IS-IS tracing.
- 2026-07-29T15:43:00Z — commit 2e06d7ba7d1d — 134 chapters refreshed.
- 2026-07-26T02:22:01Z — commit 86b081a3672b — 133 chapters refreshed.
