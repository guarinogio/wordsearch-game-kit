# wordsearch-game-kit

Monorepo for a responsive word-search game toolkit.

## Packages

- `@gioguarino/wordsearch-types`
- `@gioguarino/wordsearch-core`
- `@gioguarino/wordsearch-pixi`
- `@gioguarino/wordsearch-react`

## Apps

- `apps/demo-web`

## Scripts

```bash
pnpm dev
pnpm build
pnpm test
pnpm lint
pnpm format

---

## 3) Archivos de los packages

### `packages/wordsearch-types/package.json`

```json
{
  "name": "@gioguarino/wordsearch-types",
  "version": "0.0.0",
  "private": false,
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "lint": "eslint src --ext .ts"
  }
}