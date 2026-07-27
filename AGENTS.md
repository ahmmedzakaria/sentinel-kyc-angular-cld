# Sentinel KYC Angular Agent Guide

## Scope

This guide applies to the standalone Sentinel KYC Angular application under
`frontendApplications/sentinel-kyc-angular-cld/`. It is a self-contained
conversion of the `KYC_Overlay_Menu_POC.html` vanilla-JS POC — no shared
libraries, no monorepo path aliases. Treat `KYC_Overlay_Menu_POC.html` in this
same directory as the source of truth when porting more of the POC's behavior;
diff against it rather than guessing at intent.

## Non-Negotiable Rules

These apply to every change in this app, regardless of what area of the code
it touches:

- **Never hardcode a value in a `.scss` file (or a component's inline
  `styles:` array) — always use a variable or a calculated expression.**
  This applies to every numeric or color literal, not just the "obvious"
  ones: size (spacing/width/height/max-width/min-width), color, border-radius,
  border/outline width, font-size, font-weight, line-height, opacity, and
  transform/rotation all go through `src/styles/_tokens.scss`'s custom
  properties — `--accent`/`--text-muted`/`--border`/etc. for color,
  `--space-1`…`--space-32` for spacing/sizing, `--radius-sm`…`--radius-pill`
  for border-radius, `--border-width-thin`…`--border-width-accent` +
  `--outline-offset-flush`/`--outline-offset-detached` for borders/outlines,
  `--font-size-3xs`…`--font-size-2xl` for type size, `--font-weight-normal`…
  `--font-weight-bold` for weight, `--line-height-tight`…
  `--line-height-relaxed` for leading, `--opacity-disabled`/`--opacity-muted`/
  `--opacity-disabled-strong` for opacity, `--rotate-open` for the disclosure-
  chevron rotation. If a real value doesn't land on an existing token, that's
  a signal to add one (see the mixing functions/scale in `_tokens.scss`) —
  not to drop back to a bare literal. See "Styling And UI" below for the full
  token list and the rounding tradeoffs already made when the existing app
  was migrated onto it.
  - **A genuinely one-off value still isn't a bare literal** — name it as a
    local SCSS `$variable` in that component's own stylesheet (e.g. the
    mega-panel's `$panel-width-desktop: 790px`, RadioGroup's
    `$dot-checked-border-width: 5px`) rather than typing the number directly
    into a rule. Promote it to a global `_tokens.scss` custom property once a
    second component needs the same value — see "Styling And UI" for
    examples of dimensions that crossed that line (`--panel-width-md` etc.).
    A component's inline `styles: [...]` array (not a `.scss` file) isn't
    Sass-processed, so `$variables` don't work there — use `var()`/`calc()`
    instead (both are native CSS), e.g. `calc(var(--space-unit) * 120)`.
  - **The only literals that stay bare** are structural/mathematical
    constants with exactly one correct value, not a tunable design decision:
    `opacity: 0`/`1` (fade toggles), a spin animation's `rotate(360deg)`
    keyframe end-state, `translateX(-100%)`/`translateX(0)` (fully off/onscreen
    slide extremes), percentages and viewport units (`%`/`vh`/`vw`), the
    flex-reset idiom (`min-width: 0`/`min-height: 0`), `border-style` keywords
    (`solid`/`dashed`/`none`), `z-index` stacking values, and transition/
    animation *durations* (`0.15s`, etc. — timing isn't on any scale in this
    app yet). If you're unsure whether a value is "structural" or a real
    design decision, default to tokenizing it — this app's history is
    corrections in that direction, not the reverse.
- **Every new or touched UI must work at mobile, tablet, and desktop.** Use
  the shared breakpoints in `src/styles/_breakpoints.scss`
  (`@include bp.mobile { }` / `@include bp.tablet-down { }`) rather than
  inventing ad hoc `@media` queries. If a component needs fundamentally
  different markup per breakpoint (not just different CSS), branch on
  `ViewportService.isDesktop()` in the component — see `RailNavComponent`'s
  mega-panel rendering for the pattern. Verify all three sizes before calling
  a UI change done, including realistic content (a long scrolled list, not
  just the empty/default state) — a change that only looks right at your
  current viewport, or only in the state you happened to test, is not
  finished. See "Testing And Verification" for a concrete case this bit:
  row-anchored overlay content breaks below desktop once the trigger is
  scrolled near the viewport edge.
- **Keep this file current.** When you introduce a new convention, service,
  or pattern other work in this app should follow (a new token, a new
  responsive pattern, a new testing gotcha), add it here in the same change —
  don't let this file drift behind what the codebase actually does. And never
  contradict an existing rule here without updating the rule itself; needing
  to break one is a signal the rule needs to change, not that this one
  instance is exempt.

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

- `core/guards` — `authGuard` (also loads the layout config — see "Layout
  Config" below)/`guestGuard`
- `core/models` — `NavNode` (nav-tree.model.ts, data now lives in JSON —
  see "Layout Config"), `layout-config.model.ts` (the full config payload
  shape), theme model (`ThemeDef`/`DEFAULT_THEMES` fallback), user model,
  mega-panel context notes
- `core/theme` — `color-math.ts`, the runtime TS port of `_tokens.scss`'s
  color-mixing functions (see "Layout Config")
- `core/services` — signal-based state: `LayoutConfigService` (loads/exposes
  the layout config — see "Layout Config"), `ThemeService`, `RailStateService`,
  `NavTreeStateService` (activePath/expandedPaths + tree helpers, tree sourced
  from `LayoutConfigService`), `MegaPanelService`, `HeaderMenuService`,
  `DirectionService`, `BreadcrumbService`, `AuthService`, `QuickNavService`
  (T-code index, built from `LayoutConfigService`'s tree), `FavoriteNavService`
  (favorited nav shortcuts), `ViewportService` (reactive `isDesktop()`, for
  components that need different markup, not just different CSS, per
  breakpoint)
- `shared/icon`, `shared/toast`, `shared/modal`, `shared/avatar-upload`,
  `shared/breadcrumb` — small standalone building blocks used app-wide
- `shared/form/*` — Tier 1/2 form controls (CVA-based, extend
  `BaseValueAccessor`); `shared/feedback/*` and `shared/layout/tabs` — Tier 3
  feedback/layout components; `shared/data/*` — Tier 4 data/list composites
  (`Pagination`, `SearchToolbar`, `FilterBar`, `DataTable`, `ExportButton`).
  DataTable is presentational only — it never sorts/paginates `data` itself,
  the consumer owns `sort`/`page`/`total` as its own state and DataTable just
  emits change *requests* (`sortChange`/`pageChange`), the same "value in,
  change event out" shape as every CVA-based form control. Row actions and
  any non-trivial cell content go through `ColumnDef.cellTemplate`
  (`TemplateRef`, grabbed via `viewChild()` in the consumer), not a
  `<ng-content>` slot — content projection only inserts once per component
  instance, not once per row. See `COMPONENT_LIBRARY_PLAN.md` for what's
  built, what's planned, and the design reasoning behind each one — read it
  before adding a new shared component so you don't duplicate something
  already scoped there.
- `shared/workflow/*` — Tier 5 workflow composites (`Stepper`, `Wizard` +
  `WizardStep`, `ApprovalActions`, `Timeline`, `ActivityFeed`, `CaseThread`).
  Stepper is presentational/controlled like DataTable (`activeIndex`/
  `stepChange` are value-in/change-request-out, not self-managed like Tabs);
  Wizard layers form-validity gating on top of it via `WizardStepComponent`'s
  optional `AbstractControl` `form` input (bridged to a signal with
  `toObservable`/`toSignal`), not by teaching Stepper about forms. Timeline
  and ActivityFeed share `_timeline-shell.scss`'s mixins (ActivityFeed is a
  genuine variant, not a rebuild) — same mixin-not-global-class reasoning as
  Tier 1's `_field-shell.scss`. None of Tier 5 has an existing screen to
  retrofit into yet. See `COMPONENT_LIBRARY_PLAN.md` for the full design
  reasoning.
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

The nav tree is a 5-level recursive structure (Module Group → Module →
Category → Feature Group → Feature), ported from the POC's `navigationTree`.
Currently 11 Module Groups: Banking, Compliance, Survey, POS, Health &
Medical, Education, E-Commerce, Finance, Administration, Security, Reporting.
The tree *data* now lives in `src/assets/config/layout-config.json`'s
`navTree`, loaded at runtime by `LayoutConfigService` — see "Layout Config"
below for why and how. `core/models/nav-tree.model.ts` only keeps the
`NavNode` shape plus `moduleIcon()`/`categoryIcon()`, which are presentation
logic, not data.

- The JSON is generated, not hand-written — `scripts/generate-layout-config.mjs`
  is a plain-JS port of the tree-builder functions that used to live in
  `nav-tree.model.ts` (`feature`/`featureGroup`/`categories`/`buildModule`/
  `moduleGroup`, including `DEFAULT_SETUP_GROUPS`/`DEFAULT_REPORT_GROUPS` and
  the per-module overrides for KYC/General Ledger/Accounts Payable/
  Receivable/HR/Payroll/Fixed Asset). To change the tree: edit the script,
  run `node scripts/generate-layout-config.mjs`, commit the regenerated JSON.
  Don't hand-edit `navTree` in the JSON directly — the next regeneration would
  silently overwrite it.
- `moduleIcon()`/`categoryIcon()` (still in `nav-tree.model.ts`) map a node's
  label to an icon-registry name by keyword. When adding a module, check the
  POC's own `moduleIcon()`/`railNodeIcon()` functions for the intended mapping
  before picking an icon — several are ported onto an *existing* icon-registry
  entry rather than a new SVG (e.g. KYC/KYB/AML → `id-card`, Finance ledger
  modules → `bank`).
- `QuickNavService` builds a flat, code-addressable index over every feature
  leaf (`makeTCode`/`codePart`/`normalizeCode`, ported from the POC) — this is
  what the header's "T Code" search type and the datalist autocomplete use.
  `items` is a computed signal over `LayoutConfigService.navTree()` (empty
  until config loads); adding/removing/reordering tree nodes changes generated
  codes, so don't treat a specific T-code as a stable identifier across
  nav-tree edits.
- `FavoriteNavService` persists a `Set` of `QuickNavItem.pathKey`s to
  `localStorage`, filtered against `QuickNavService.hasPathKey()` on load so a
  stale favorite (from before a nav-tree change) doesn't linger.
- A full 5-level path in `NavTreeStateService.activePath()` means a real
  feature is selected (matches the POC's `currentFeaturePathKey` semantics) —
  that's the signal `StatusBarComponent` uses to swap in the T-code tag +
  favorite toggle instead of the default "Last synced/Audit Logging" info.
  Category-level browsing (mega panel open/hover) only ever sets a 3-length
  path, never 5.

## Layout Config

The header/rail-nav/status-bar chrome's content (nav tree, header dropdown
lists, status-bar labels) and theme configuration (color primaries, size
primitives) are loaded at runtime rather than hardcoded, so a real backend can
serve them post-authentication without an app rebuild. This replaced the
previously hardcoded `NAVIGATION_TREE`/`THEMES`/header constants — don't
reintroduce a hardcoded tree or theme list elsewhere; extend the config
instead.

- **`LayoutConfigService`** (`core/services/layout-config.service.ts`) fetches
  `LayoutConfig` (`core/models/layout-config.model.ts`) via `HttpClient` and
  exposes it as signals: `navTree`, `header`, `statusBar`, `themes`, `sizes`
  (all empty/null until loaded). `ensureLoaded()` fetches-and-caches (safe to
  call repeatedly; only one HTTP request ever fires); `applyConfig()` is a
  test-only seam to seed state synchronously without HTTP.
- **Today** it fetches a static asset, `src/assets/config/layout-config.json`
  (generated by `scripts/generate-layout-config.mjs` — see "Navigation Tree"
  above). **Swapping to a real API** once the backend serves this
  post-authentication is a one-line change to the URL constant in
  `layout-config.service.ts` — nothing downstream needs to change, since every
  consumer reads the service's signals, not the URL.
- **Loaded right after login, before the shell renders**: `authGuard`
  (`core/guards/auth.guard.ts`) calls `layoutConfig.ensureLoaded()` after
  confirming the user is authenticated, so `AppShellComponent` (header/rail/
  status-bar) never mounts against an empty config. It fails soft — a load
  error still lets navigation proceed, just with the config signals at their
  empty defaults, rather than locking an authenticated user out.
- **Theme colors/sizes are computed at runtime, not compile time.**
  `core/theme/color-math.ts` is a TypeScript port of `_tokens.scss`'s
  color-mixing functions (`soft-tone`/`muted-tone`/`border-tone`/
  `surface-tone`/`deepen-tone`/`on-color`) and its `--space-*`/`--radius-*`/
  `--font-size-*` calc()s. `computeThemeTokens(theme)`/`computeSizeTokens(sizes)`
  reproduce the exact same formulas from a `ThemeConfigEntry`'s primaries
  (`text`/`paper`/`card`/`accent`/`amber`/`red`/`success`/`info`) — keep the
  two in sync if either changes; there's a parity test in
  `color-math.spec.ts` (Navy's gold accent must resolve to the dark ink
  foreground, not white — the case that originally motivated `on-color()`).
  `ThemeService`'s constructor `effect()` calls `applyTokens()` to set the
  computed result as **inline custom properties on `document.body`** — inline
  style always outranks a stylesheet rule, so this cleanly overrides
  `_tokens.scss`'s compiled defaults once config loads, without needing to
  rip out the SCSS system.
- **Pre-auth/pre-load fallback**: the login/register pages render outside
  `authGuard` and never trigger the config load, so `ThemeService`/
  `HeaderComponent`/`StatusBarComponent` each keep a small `DEFAULT_*`
  constant (`DEFAULT_THEMES`/`DEFAULT_SIZES` in `theme.model.ts`,
  `DEFAULT_APPS`/`DEFAULT_TENANTS`/`DEFAULT_LANGUAGES`/`DEFAULT_SEARCH_TYPES`
  in `header.component.ts`, `DEFAULT_STATUS_BAR` in `status-bar.component.ts`)
  — a 1:1 copy of the JSON's current values, used via `?? DEFAULT_*` until
  `LayoutConfigService.loaded()` is true. Keep these in sync with the JSON:
  if you change a default's *value* in the JSON, update its fallback copy
  too, in the same change.
- `NavTreeStateService.tree` and `QuickNavService.items` are both `computed()`
  signals over `LayoutConfigService.navTree()`, not the array-typed properties
  they used to be — call them (`.tree()`, `.items()`), don't read them as
  plain arrays.

## Styling And UI

- Reuse `src/styles/_tokens.scss` custom properties (`--accent`, `--card`,
  `--border`, `--text-muted`, etc.) — never hardcode a color that already has
  a token, and check all 7 themes (light, dark, blue, navy, green, purple,
  gray) still look right when touching chrome (header/rail/status bar) or
  token-driven components. Per-theme colors are themselves derived from a
  handful of primaries (neutrals + hues) via mixing functions
  (`soft-tone()`, `muted-tone()`, `border-tone()`, `surface-tone()`,
  `deepen-tone()`, `on-color()`) rather than hand-picked per shade — retune a
  theme by changing its primaries, not by hand-tuning individual derived
  shades.
- Never hardcode white/black text or icon color on a saturated background
  (a colored badge, the logo mark, a filled checkbox) — use `--on-accent`/
  `--on-accent-soft`/`--on-accent-strong` (foreground for content drawn on
  `--accent`) or `--on-red` (foreground on `--red`), derived by `on-color()`
  from perceived brightness (ITU-R BT.601 luma), not assumed to always be
  white. This isn't cosmetic: Navy's gold accent (`#c99a3b`) reads as "light"
  by this measure, so `on-color()` picks the app's dark ink tone there
  instead of white — genuinely better contrast than the white every other
  theme's darker accent hues correctly get. If a new saturated background
  color is introduced, give it an `--on-<name>` token the same way rather
  than hardcoding `#fff` against it.
- Size scale, also in `_tokens.scss`, driven by three primitives
  (`--space-unit: 2px`, `--radius: 8px`, `--font-size-base: 13.5px`), all
  wired through `calc()` so they stay live if a primitive is ever changed at
  runtime:
  - Spacing/padding/margin/gap, and any element width/height/max-height that
    lands on the scale → `--space-1` (2px) through `--space-19` (38px), then
    `--space-22` (44px) and `--space-32` (64px) for the larger chrome
    dimensions (rail width, mega-panel subitem row height, etc.) — in 2px
    steps up to 38px, then named steps for the handful of larger recurring
    sizes. Don't assume the scale is dense above 38px; check `_tokens.scss`
    for the actual defined step before adding a new one.
  - Border-radius → `--radius-sm` (6px), `--radius` (8px), `--radius-md`
    (9px — the recurring "slightly more than base" chrome radius),
    `--radius-lg` (12px), `--radius-pill` (999px, for pill/circle shapes).
  - Font-size → `--font-size-3xs` (~9px) through `--font-size-2xl` (~26px).
  - Font-weight → `--font-weight-normal` (400), `--font-weight-medium` (500),
    `--font-weight-semibold` (600), `--font-weight-bold` (700). Never hardcode
    a numeric `font-weight` — the four steps cover every weight this app
    actually uses.
  - Opacity → `--opacity-disabled` (0.6), `--opacity-muted` (0.55),
    `--opacity-disabled-strong` (0.35) — hand-picked intensity levels, same
    "snap to the nearest existing step" tolerance as the size scale (e.g.
    Tabs' originally-0.5 disabled state snapped onto `--opacity-muted`).
    **Not** every `opacity` needs one of these: `opacity: 0`/`1` used for
    fade toggles (rail labels, toast enter/exit, visually-hidden native
    `<input>`s in Checkbox/RadioGroup) are structural endpoints with only one
    correct value, not a tunable design decision, so they stay literal.
  - Rotation → `--rotate-open` (180deg), the disclosure-chevron open state
    shared by every Tier 2 dropdown-style control's `.chev`/`.chevron`. A
    spin animation's `rotate(360deg)` keyframe end-state is **not** tokenized
    for the same reason as opacity 0/1 above — "one full turn" has only one
    correct value.
  - Line-height → `--line-height-tight` (1, single-line icon/glyph/numeral),
    `--line-height-snug` (1.25), `--line-height-base` (1.4, compact body
    copy — near-duplicate originals like 1.45 snap onto this step, same
    tolerance as the size/opacity scales), `--line-height-relaxed` (1.5,
    standard paragraph copy). Unitless multipliers, hand-picked like the
    opacity scale, not derived from a primitive.
  - Border/outline width → `--border-width-thin` (1px, the overwhelming
    default for every panel/control/divider border), `--border-width-md`
    (1.5px — Checkbox/RadioGroup/MultiSelect's unchecked option ring),
    `--border-width-thick` (2px — avatar/badge ring, focus outline, spinner
    ring, header swatch's inner box-shadow ring), `--border-width-accent`
    (3px — Banner's left accent bar, rail-nav's active-row indicator,
    header swatch's outer box-shadow ring). Pair with `--outline-offset-flush`
    (-1px, ring flush against the control's own border — text inputs) or
    `--outline-offset-detached` (2px, ring floats outside — checkbox/radio
    dot, buttons) for `outline-offset`. A genuinely one-off border-width used
    by exactly one component (RadioGroup's 5px "filled dot" trick) stays a
    local `$variable` instead of joining this scale — same rule as one-off
    panel dimensions.
  - `--control-height` (38px, i.e. `var(--space-19)`) and `--control-height-sm`
    (36px, `var(--space-18)`) are semantic aliases for the two recurring
    interactive-control heights (inputs, buttons, header pills/icon-buttons) —
    prefer these over the raw `--space-*` step when sizing a control, so
    intent (a control height) reads separately from an incidental spacing
    match.
  - The unit is 2px (not a rounder 4px) because this app's real paddings/gaps
    were hand-picked on a fine, often-odd grid (3, 5, 7, 9, 15…) — expect ~1px
    rounding drift on odd legacy values when migrating more of the app onto
    these tokens; that's expected, not a bug to chase down.
  - A genuinely one-off dimension (not reused elsewhere, and not a natural
    fit for the scale — e.g. the mega-panel's 790px desktop width, the
    header's 560px search max-width) gets named as a local SCSS `$variable`
    in that component's own stylesheet instead of promoted to a global token
    — see `header.component.scss`, `mega-panel.component.scss`, and
    `rail-nav.component.scss` for the pattern. Promote it to a global token
    only once a second component needs the same value.
  - A handful of one-off tokens exist alongside the scale for values that
    recur across components and would otherwise drift out of sync as
    separate literals: `--shadow-sm` (a tighter version of `--shadow` for
    small elements like the header's logo badge), `--overlay-backdrop` (the
    dim scrim behind a hand-rolled backdrop — rail drawer, mega-panel bottom
    sheet; CDK's own overlay backdrops use its own classes instead),
    `--header-height`/`--statusbar-height` (the header and status bar's own
    fixed heights, also read by `RailNavComponent` to offset its mobile/
    tablet drawer between them), `--rail-width-collapsed`/`--rail-width-expanded`
    (the left nav's icon-only/expanded desktop widths — config-driven via
    `sizes.railWidthCollapsed`/`railWidthExpanded`, see "Layout Config"; the
    mobile/tablet off-canvas drawer width stays a local one-off in
    `rail-nav.component.scss` since that's a distinct overlay behavior, not
    the same reserved-column concept), `--panel-max-height-sm` (280px —
    Dropdown/MultiSelect's compact select-style panels), `--panel-width-md`
    (260px — DropdownAsync/DropdownAsyncScrollable/DatePicker/DateRangePicker's
    search/calendar panels), `--panel-max-height-md` (320px — DropdownAsync/
    DropdownAsyncScrollable). Add a token like these when a literal is
    genuinely shared across components, not per-component — each panel
    dimension above started as a duplicated literal in ≥2 Tier 2 form
    controls before being promoted here; a dimension that's still only used
    by one component (e.g. Dropdown's own 180px panel `min-width`,
    MultiSelect's 200px) stays a local `$variable` in that component's own
    stylesheet instead.
- Responsive breakpoints live in `src/styles/_breakpoints.scss`:
  `@include bp.mobile { }` (<768px) and `@include bp.tablet-down { }`
  (<1024px). Use these mixins, not ad hoc `@media` queries, so every
  component's responsive behavior stays pinned to the same breakpoints. For
  TypeScript-side branching (a component needs different markup, not just
  different CSS, per breakpoint), inject `ViewportService` and read
  `isDesktop()` — see `RailNavComponent`'s mega-panel rendering, which uses a
  CDK connected-overlay anchored to the trigger row on desktop, but a
  viewport-anchored bottom sheet (`ViewportService`-gated, ignores the
  trigger's position entirely) below desktop.
- `IconComponent` supports a `filled` input (`fill="currentColor"` vs `none`)
  for toggle-style glyphs like the favorite star — don't reach for a second
  icon variant when a fill toggle will do.
- Dropdown/overlay panel content (`HeaderDropdownComponent`'s `panel` slot,
  Modal body) is portaled by CDK Overlay to a global `.cdk-overlay-container`
  appended to `<body>` — it is **not** a DOM descendant of the host component
  anymore. Styling it requires a genuinely global rule (`::ng-deep` without
  `:host`, as `header.component.scss` already does), not scoped component CSS.
- A component's inline `styles: [...]` array (`TooltipPanelComponent`, e.g.)
  is **not** Sass-processed — it's plain CSS, so SCSS `$variables`/`@use`
  don't work there. `var(--token)` and `calc(...)` still work fine (they're
  native CSS, not Sass features), so a one-off dimension that would normally
  get a local `$variable` in a `.scss` file instead gets computed inline,
  e.g. `calc(var(--space-unit) * 120)`.
- A component that accepts projected content (`<ng-content>`) and also
  supplies *default* fallback markup inside that `<ng-content>` tag — see
  `ConfirmDialogComponent`'s `<p class="confirm-message">` default — only
  gets its own component stylesheet applied to that fallback when nothing is
  projected. Once a consumer projects its own content (every current
  `app-confirm-dialog` usage does), Angular's emulated view encapsulation
  scopes the projected element's classes to the *consumer's* stylesheet, not
  the child component's — a class name matching the child's CSS is a
  coincidence, not a guarantee it's styled. Don't assume a `.scss` rule is
  reaching projected content without checking who actually declared the
  projected markup.
- CDK connected-overlay content anchored to a *row inside a scrollable list*
  (e.g. a drawer) breaks once that row can be scrolled near the viewport
  edge — there may be no room in the anchored direction to render into.
  Below desktop, prefer a viewport-anchored strategy (fixed position, ignores
  the trigger element) over adding more `cdkConnectedOverlayPositions`
  fallbacks; see the mega panel's mobile/tablet bottom sheet for the pattern
  this app settled on after hitting exactly this bug.

## Testing And Verification

- **Specs touching the nav tree (`NavTreeStateService`, `QuickNavService`,
  `FavoriteNavService`, or anything that injects them transitively) must seed
  `LayoutConfigService` first**, or the tree/items signals stay at their
  empty defaults and every tree-dependent assertion fails. Inject
  `LayoutConfigService` and call `.applyConfig(layoutConfig as LayoutConfig)`
  with the real JSON asset imported directly (`import layoutConfig from
  '.../assets/config/layout-config.json'` — `resolveJsonModule` is on in
  `tsconfig.json` for exactly this) in a `beforeEach`, rather than mocking a
  trimmed fixture; that keeps these specs honest against the real tree
  instead of a hand-maintained stand-in. See
  `nav-tree-state.service.spec.ts`/`quick-nav.service.spec.ts`/
  `favorite-nav.service.spec.ts` for the pattern — note
  `favorite-nav.service.spec.ts`'s persistence test re-applies the config
  after `TestBed.resetTestingModule()`, since that wipes the seeded state too.
  `LayoutConfigService.spec.ts` itself is the one spec that *should* exercise
  the real HTTP path, via `provideHttpClientTesting()`/`HttpTestingController`.
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
- **jsdom (this project's test environment) does not implement
  `window.matchMedia` at all** — it's not just unmocked, the property is
  genuinely absent. Any service/component that reads it (`ViewportService`)
  must guard `typeof window.matchMedia === 'function'`, not just
  `typeof window !== 'undefined'`. Specs that need it stub it directly
  (`window.matchMedia = vi.fn(...)`) rather than `vi.spyOn(window,
  'matchMedia')`, which requires the property to already exist as a function.
- `TestBed.createComponent(SomeGenericComponent)` does **not** pick up a
  generic class's default type parameter — you get `SomeGenericComponent<unknown>`
  unless you write `TestBed.createComponent<SomeGenericComponent<string>>(SomeGenericComponent)`.
  This matters for every Tier 2 generic form control (`Dropdown`,
  `DropdownAsync`, `DropdownAsyncScrollable`, `MultiSelect`, `RadioGroup`) and
  for `DataTableComponent<T>`/`ExportButtonComponent<T>`.
- **jsdom does not implement the Blob URL API** (`URL.createObjectURL`/
  `URL.revokeObjectURL`) — a spec that exercises a real file-download path
  (`ExportButtonComponent`'s CSV export) must stub both directly
  (`window.URL.createObjectURL = vi.fn(...)`) before calling the code under
  test, same reasoning/pattern as the `matchMedia` gotcha above.
- **An `output()` name that collides with a real DOM event fails lint**
  (`@angular-eslint/no-output-native`), not just at authoring time but for
  any name you'd reach for instinctively — `search`, `change`, `input`,
  `focus`, `blur`, `scroll`, `error`, `load`, `submit`, `reset`, `select`,
  `drag`/`drop` variants, etc. are all real DOM events, and are all
  disallowed as-is. `SearchToolbarComponent.search` had to become `searched`
  for this reason — reach for a past-tense or otherwise DOM-disjoint name up
  front instead of hitting this at lint time.
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
