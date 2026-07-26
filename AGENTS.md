# Sentinel KYC Angular Agent Guide

## Scope

This guide applies to the standalone Sentinel KYC Angular application under
`frontendApplications/sentinel-kyc-angular-cld/`. It is a self-contained
conversion of the `KYC_Overlay_Menu_POC.html` vanilla-JS POC — no shared
libraries, no monorepo path aliases. Treat `KYC_Overlay_Menu_POC.html` in this
same directory as the source of truth when porting more of the POC's behavior;
diff against it rather than guessing at intent.

## Project Shape

- Angular 21, standalone components only — no NgModules
- TypeScript, strict compiler + strict template checks (`tsconfig.json`)
- Zoneless change detection; Signals for local/UI state; RxJS reserved for
  async streams (HTTP, debounced search, etc.)
- Angular CDK for behavior primitives (`Overlay`, `a11y` FocusMonitor) — no
  Angular Material, no Bootstrap, no Font Awesome
- Custom SCSS design-token system in `src/styles/_tokens.scss` — 7 themes as
  CSS custom properties, flipped at runtime via `data-theme`/`.dark` on `<body>`
- Custom SVG icon set — `shared/icon/icon-registry.ts` + `IconComponent`
- i18n via `@jsverse/transloco` (`src/assets/i18n/{en,bn,ar}.json`),
  `DirectionService` handles RTL for Arabic
- Vitest for unit tests, Playwright for e2e
- Application package: `sentinel-kyc`

Useful commands:

```bash
npm install
npm start        # ng serve
npm test         # Vitest unit tests
npm run test:e2e # Playwright e2e
npm run lint
npm run build
```

## Ownership Rules

- `core/guards` — `authGuard`/`guestGuard`
- `core/models` — `NavNode`/`NAVIGATION_TREE` (nav-tree.model.ts), theme model,
  user model, mega-panel context notes
- `core/services` — signal-based state: `ThemeService`, `RailStateService`,
  `NavTreeStateService` (activePath/expandedPaths + tree helpers),
  `MegaPanelService`, `HeaderMenuService`, `DirectionService`,
  `BreadcrumbService`, `AuthService`, `QuickNavService` (T-code index),
  `FavoriteNavService` (favorited nav shortcuts)
- `shared/icon`, `shared/toast`, `shared/modal`, `shared/avatar-upload`,
  `shared/breadcrumb` — small standalone building blocks used app-wide
- `shared/form/*` — Tier 1/2 form controls (CVA-based, extend
  `BaseValueAccessor`); `shared/feedback/*` and `shared/layout/tabs` — Tier 3
  feedback/layout components. See `COMPONENT_LIBRARY_PLAN.md` for what's built,
  what's planned, and the design reasoning behind each one — read it before
  adding a new shared component so you don't duplicate something already
  scoped there.
- `layout/*` — `AppShellComponent`, `HeaderComponent`, `RailNavComponent`,
  `MegaPanelComponent`, `StatusBarComponent` — only mounted for authenticated
  routes
- `features/*` — routed screens (`auth/login`, `auth/register`, `dashboard`,
  `people`). Only `Dashboard` and `Customers > List` are wired into
  `app.routes.ts` today; everything else in the nav tree updates
  breadcrumb/title only until a real screen is built for it.

## Angular Rules

- Standalone components, `ChangeDetectionStrategy.OnPush`, signal-based
  `input()`/`output()` — no `@Input()`/`@Output()` decorators.
- Import every directive/pipe/component a standalone template uses into that
  component's own `imports` array.
- Form controls that plug into Reactive Forms extend
  `shared/form/base-value-accessor.ts` (`BaseValueAccessor<T>`) rather than
  hand-rolling `writeValue`/`registerOnChange`.
- Overlay-based components (Dropdown, Tooltip, Modal, MegaPanel,
  HeaderDropdown) use CDK `Overlay` — `GlobalPositionStrategy` for centered
  dialogs (Modal), connected/anchored positioning for triggers (Dropdown,
  Tooltip, HeaderDropdown).

## Navigation Tree

`NAVIGATION_TREE` in `core/models/nav-tree.model.ts` is a 5-level recursive
tree (Module Group → Module → Category → Feature Group → Feature), ported from
the POC's `navigationTree`. Currently 11 Module Groups: Banking, Compliance,
Survey, POS, Health & Medical, Education, E-Commerce, Finance, Administration,
Security, Reporting.

- `categories(operationGroups, setupGroups?, reportGroups?)` — most modules
  share `DEFAULT_SETUP_GROUPS`/`DEFAULT_REPORT_GROUPS`, but a few (KYC,
  General Ledger, Accounts Payable/Receivable, HR, Payroll, Fixed Asset) define
  their own — pass the optional args rather than forcing every module onto the
  shared defaults.
- `moduleIcon()`/`categoryIcon()` map a node's label to an icon-registry name
  by keyword. When adding a module, check the POC's own `moduleIcon()`/
  `railNodeIcon()` functions for the intended mapping before picking an icon —
  several are ported onto an *existing* icon-registry entry rather than a new
  SVG (e.g. KYC/KYB/AML → `id-card`, Finance ledger modules → `bank`).
- `QuickNavService` builds a flat, code-addressable index over every feature
  leaf (`makeTCode`/`codePart`/`normalizeCode`, ported from the POC) — this is
  what the header's "T Code" search type and the datalist autocomplete use.
  It's rebuilt from `NAVIGATION_TREE` once per app load; adding/removing/
  reordering tree nodes changes generated codes, so don't treat a specific
  T-code as a stable identifier across nav-tree edits.
- `FavoriteNavService` persists a `Set` of `QuickNavItem.pathKey`s to
  `localStorage`, filtered against `QuickNavService.hasPathKey()` on load so a
  stale favorite (from before a nav-tree change) doesn't linger.
- A full 5-level path in `NavTreeStateService.activePath()` means a real
  feature is selected (matches the POC's `currentFeaturePathKey` semantics) —
  that's the signal `StatusBarComponent` uses to swap in the T-code tag +
  favorite toggle instead of the default "Last synced/Audit Logging" info.
  Category-level browsing (mega panel open/hover) only ever sets a 3-length
  path, never 5.

## Styling And UI

- Reuse `src/styles/_tokens.scss` custom properties (`--accent`, `--card`,
  `--border`, `--text-muted`, etc.) — never hardcode a color that already has
  a token, and check all 7 themes (light, dark, blue, navy, green, purple,
  gray) still look right when touching chrome (header/rail/status bar) or
  token-driven components.
- `IconComponent` supports a `filled` input (`fill="currentColor"` vs `none`)
  for toggle-style glyphs like the favorite star — don't reach for a second
  icon variant when a fill toggle will do.
- Dropdown/overlay panel content (`HeaderDropdownComponent`'s `panel` slot,
  Modal body) is portaled by CDK Overlay to a global `.cdk-overlay-container`
  appended to `<body>` — it is **not** a DOM descendant of the host component
  anymore. Styling it requires a genuinely global rule (`::ng-deep` without
  `:host`, as `header.component.scss` already does), not scoped component CSS.

## Testing And Verification

- **This checkout's directory path must not contain parentheses or spaces.**
  Vitest's glob-based test file discovery silently breaks on literal `(`/`)`
  in the path (they're extglob syntax to picomatch/micromatch) and reports "No
  test files found" with zero indication why. If `npm test` ever regresses to
  that error after a directory move/copy, check the path first before
  suspecting the code.
- `jsdom` is a devDependency specifically so `npm test` has a DOM environment
  — don't remove it.
- This app is zoneless (no `zone.js` dependency at all). Do not use
  `fakeAsync`/`tick()` from `@angular/core/testing` in new specs — they
  require `zone.js/testing`, which isn't installed. Use `vi.useFakeTimers()` /
  `vi.advanceTimersByTime()` instead; RxJS's `asyncScheduler` (what
  `debounceTime` etc. use) schedules through the same global
  `setTimeout`/`setInterval` Vitest's fake timers intercept, so this is a
  drop-in replacement. See `dropdown-async.component.spec.ts` for the pattern.
- Specs that need to read a component's `protected` internal signals
  (`open`, `activeIndex`, etc.) use bracket-notation (`instance['open']()`) to
  bypass the access-modifier check — TypeScript permits string-literal
  bracket access to `protected`/`private` members even though dot-notation is
  blocked. Don't widen a field's visibility just to make a test compile.
- `TestBed.createComponent(SomeGenericComponent)` does **not** pick up a
  generic class's default type parameter — you get `SomeGenericComponent<unknown>`
  unless you write `TestBed.createComponent<SomeGenericComponent<string>>(SomeGenericComponent)`.
  This matters for every Tier 2 generic form control (`Dropdown`,
  `DropdownAsync`, `DropdownAsyncScrollable`, `MultiSelect`, `RadioGroup`).
- Run the narrowest meaningful check before completing work:

```bash
npm run build
```

- Run `npm test` when changing services, state logic, component logic, or
  guards.
- Run `npm run lint` when changing TypeScript or template structure broadly —
  there is a stable set of ~36 pre-existing lint errors in Tier 1/2 form
  controls (accessibility rules mostly) that predate this file; know that
  baseline before attributing new ones to your change.
- Run `npm run test:e2e` when changing browser interactions, overlays,
  routing, or responsive shell behavior.
- For UI changes, start the dev server (`.claude/launch.json` is configured
  for this) and check the actual browser — several regressions in this app
  only show up as portaled overlay content, not in a snapshot test.

## Dependency Rules

- Keep `@angular/*`, `@angular/build`, `@angular/cli`, and
  `@angular/compiler-cli` versions aligned.
- Angular 21's `@angular/build:unit-test` builder expects Vitest 4.
- `package.json` pins ranges (`^21.0.0` etc.), not exact patch versions —
  commit `package-lock.json` after `npm install` resolves them so the exact
  versions are reproducible.
- Do not commit `dist/`, `.angular/`, or `node_modules/`.

## Documentation Rules

- `COMPONENT_LIBRARY_PLAN.md` is the living source of truth for the shared
  component library: build status per tier, design decisions and why, and
  which existing screens each component was retrofitted into. Update it
  (§13 build status + a tier notes section) whenever you build, retrofit, or
  materially change a shared component.
- `README.md` documents intentional stubs (SSO app launch, most nav-tree
  leaves having no backing screen, static notification/task data) — keep it
  aligned when that scope changes.
