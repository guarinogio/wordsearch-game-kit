# @gioguarino/wordsearch-core

Headless runtime for a single word-search puzzle.

## Public API

- `createWordSearchGame`
- geometry helpers
- matching helper
- snapshot helpers
- validation helper

## Contract notes

### Puzzle input

Requires precomputed placements.

### Reveal semantics

`revealWords()` does not populate `foundWordIds`.

### Snapshot

Puzzle-scoped. Mismatch throws.
