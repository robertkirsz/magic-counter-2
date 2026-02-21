# Agent context: Magic Counter 2

## Project overview

**Magic Counter 2** is a Commander (MTG) life counter and game tracker. It tracks life totals, commander damage, poison counters, monarch, and turn order. It supports game history, charts (life over time, commander damage, round duration), and optional deck/commander association per player.

**Tech stack**: React 19, Vite 7, TypeScript 5.9, Tailwind CSS 4, daisyUI 5, Chart.js / react-chartjs-2, Luxon, @dnd-kit (sortable player sections), Lucide icons. It is a PWA (vite-plugin-pwa); all data is stored in localStorage (no backend).

See [package.json](package.json) and [docs/APP_STRUCTURE.md](docs/APP_STRUCTURE.md) for more.

## Architecture

- **Entry**: [src/main.tsx](src/main.tsx) → [src/App.tsx](src/App.tsx) (wrapped in [ErrorBoundary](src/components/ErrorBoundary.tsx)). There is no router; the app conditionally renders the active game view or the intro screen.
- **Main view**: If there is an active (non-finished) game → [Board](src/components/Board.tsx). Otherwise → [IntroScreen](src/components/IntroScreen.tsx) (Games, Decks, Users management).
- **Providers** (order matters): `UsersProvider` → `GamesProvider` → `DecksProvider`. All state is React state with localStorage sync.

Full component tree, directory layout, and data flow: [docs/APP_STRUCTURE.md](docs/APP_STRUCTURE.md).

## Conventions and rules

- **Class names**: Use the `cn()` helper from [src/utils/cn.ts](src/utils/cn.ts) (clsx + tailwind-merge) for conditional or merged Tailwind/daisyUI classes.
- **UI**: daisyUI for buttons, modals, forms, etc. When the user says "daisy" or "daisyUI", use the **daisyUI Blueprint MCP** (see [.cursor/rules/daisyui-mcp.mdc](.cursor/rules/daisyui-mcp.mdc)) for snippets and patterns.
- **Styling**: Global styles and theme live in [src/index.css](src/index.css) (`@import 'tailwindcss'`, `@plugin 'daisyui'`, `bg-base-300`, `text-base-content`). Component-specific classes (e.g. `.PlayerSection.eliminated`, `.hide-number-arrows`) are defined there.
- **Codebase**: TypeScript throughout; functional components and hooks. Contexts use a `*ContextDef.ts` (types) plus `*Context.tsx` (provider). Data access via hooks in [src/hooks/](src/hooks/) (`useGames`, `useUsers`, `useDecks`).

## Data model and persistence

- **Global types**: [src/types/global.d.ts](src/types/global.d.ts) — `Game`, `Player`, `User`, `Deck`, `ScryfallCard`, `GameState`, `ManaColor`, action types (`LifeChangeAction`, `TurnChangeAction`, `MonarchChangeAction`), `WinCondition`.
- **Persistence**: Games, users, and decks each use a single localStorage key (`games`, `users`, `decks`). Contexts read on init and sync to localStorage in `useEffect` when state changes. Corrupted data triggers an alert and optional clear + reload (see [src/contexts/GamesContext.tsx](src/contexts/GamesContext.tsx) for the pattern).
- **Events**: Typed custom events via [src/utils/eventDispatcher.ts](src/utils/eventDispatcher.ts) and [src/types/events.ts](src/types/events.ts) — game-state-change, turn-change, life-change, monarch-change, game-delete. Use `EventDispatcher` and the `use*Listener` hooks when adding cross-component behavior.

## Key paths

- **Components**: [src/components/](src/components/) — `Board`, `PlayerSection`, `Game`, `IntroScreen`, `Modal`, etc. Player-specific under [src/components/player/](src/components/player/); board-specific under [src/components/board/](src/components/board/).
- **State**: [src/contexts/](src/contexts/) and [src/hooks/](src/hooks/).
- **Utils**: [src/utils/](src/utils/) — `cn`, `eventDispatcher`, `idGenerator`, `scryfall`, `gameUtils`, `gameGenerator`, etc. See [src/utils/README.md](src/utils/README.md) for the event system.
- **Types**: [src/types/global.d.ts](src/types/global.d.ts), [src/types/events.ts](src/types/events.ts).
- **Constants**: [src/constants/mana.ts](src/constants/mana.ts).

## Learned User Preferences

*Bullets added from transcript mining.*

## Learned Workspace Facts

*Bullets added from transcript mining.*
