# @gioguarino/wordsearch-react

React wrapper for the word-search toolkit.

## Public API

- `WordSearchBoard`
- `usePersistentWordSearch`
- `WordSearchBoardProps`
- `WordSearchBoardHandle`
- `WordSearchPersistenceOptions`

## Usage notes

### Puzzle identity

```tsx
<WordSearchBoard key={puzzle.id} puzzle={puzzle} />
```

### Stable props

Memoize:

- responsive
- callbacks
- handlers

### Persistence

Puzzle-level only. Not global progression.

### Meta-game

Scoring, medals, daily sessions → handled outside.
