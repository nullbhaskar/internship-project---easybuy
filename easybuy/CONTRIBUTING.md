# EasyBuy — Contribution & Code Style Guide

## Folder Conventions

| Folder | Purpose |
|--------|---------|
| `app/` | Expo Router screens only. No raw logic here. |
| `components/` | Reusable UI components, grouped by feature. |
| `context/` | React Context providers and their hooks. |
| `hooks/` | Custom React hooks (non-context state logic). |
| `utils/` | Pure functions: formatting, validation, array helpers. |
| `types/` | Shared TypeScript interfaces and type definitions. |
| `constants/` | Static data, catalog generators, theme tokens. |
| `services/` | External API clients: Firebase, Groq AI, email. |

## Component Rules

- One component per file.
- File name must match the exported component name.
- Style objects go at the **bottom** of the file using `StyleSheet.create`.
- No inline styles longer than 2 properties. Use the StyleSheet.

## TypeScript Rules

- No `any` types. Use proper interfaces from `types/index.ts`.
- All props must be typed with an interface, not inline.
- Prefer `unknown` over `any` for external API responses.

## Naming Conventions

- **Components**: `PascalCase` (e.g., `ProductCard.tsx`)
- **Hooks**: `camelCase` prefixed with `use` (e.g., `useDebounce.ts`)
- **Utils**: `camelCase` (e.g., `formatters.ts`)
- **Constants**: `SCREAMING_SNAKE_CASE` for values, `PascalCase` for objects

## Git Commit Style

```
feat: add QuickBuy express delivery filter
fix: correct rupee symbol encoding on Windows
refactor: extract shuffle into utils/arrayUtils
style: update ProductCard to match new design system
```
