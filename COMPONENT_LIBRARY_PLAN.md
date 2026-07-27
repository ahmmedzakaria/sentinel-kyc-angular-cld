# Sentinel KYC — Shared Component Library: Build Plan

**Status:** Draft for review
**Scope:** 33 reusable components requested, organized into a dependency-ordered build plan

---

## 1. Guiding principles (apply to every component below)

- **Standalone, OnPush, signal-based inputs/outputs** (`input()`/`output()`) — matches every component already built.
- **No Angular Material, no Bootstrap** — Angular CDK for behavior primitives (`Overlay`, `a11y`, `ScrollDispatcher`), custom SCSS on the existing design tokens (`--accent`, `--card`, `--border`, etc.), same as `ModalComponent`/`HeaderDropdownComponent`.
- **Form controls implement `ControlValueAccessor`** so every one of them works with `formControlName` exactly like a native `<input>` — this is the single most important architectural decision below (§2).
- **Icons** come from the existing `IconComponent` + registry; extend the registry rather than inlining new SVGs per component.
- **Testing**: Vitest unit specs for anything with real logic (sorting, pagination, stepper navigation, CVA value propagation); Playwright e2e for a small number of representative flows, not all 33 components individually.

---

## 2. Shared infrastructure to build *before* the component list

**A `ControlValueAccessor` base.** Ten of the 33 components (Textbox, Textarea, Checkbox, Dropdown, DropdownAsync, DropdownAsyncScrollable, Password-group, Radio-group, MultiSelect, TagInput, DatePicker, DateRangePicker) are all "a form control that plugs into Reactive Forms." Without a shared base, that's the same `writeValue`/`registerOnChange`/`registerOnTouched`/`setDisabledState` boilerplate copy-pasted 12 times, with 12 chances to get the disabled-state or touched-state handling subtly wrong.

Build a small abstract base (`shared/form/base-value-accessor.ts`) once, providing:
- `value` signal + `onChange`/`onTouched` callback storage
- `writeValue()`, `registerOnChange()`, `registerOnTouched()`, `setDisabledState()` implemented once
- A `disabled` signal every subclass gets for free

Every form-control component below extends this instead of reimplementing CVA from scratch.

---

## 3. Proposed folder structure

Flat `shared/` with 33 folders becomes unmanageable. Group by purpose:

```
src/app/shared/
  form/           button, textbox, textarea, checkbox, dropdown, dropdown-async,
                  dropdown-async-scrollable, password-group, radio-group,
                  multi-select, tag-input, date-picker, date-range-picker,
                  base-value-accessor.ts
  feedback/       status-badge, pill, tooltip, inline-alert, banner, empty-state, confirm-dialog
  data/           data-table, pagination, filter-bar, search-toolbar, export-button
  workflow/       stepper, wizard, approval-actions, timeline, activity-feed, case-thread
  media/          image-preview, document-list, viewer
  layout/         tabs
  icon/           (existing)
  toast/          (existing)
  modal/          (existing)
  avatar-upload/  (existing)
  breadcrumb/     (existing)
```

---

## 4. Dependency graph

Build order matters — several of these are explicitly built *on top of* others, and a few pairs share enough behavior that one should be implemented as a thin variant of the other rather than a separate build.

```
Tier 1 — Primitives (no dependencies)
  Button · Textbox · Textarea · Checkbox · Radio-group · Password-group*

Tier 2 — Selection controls (*Password-group wraps Textbox)
  Dropdown → DropdownAsync → DropdownAsyncScrollable
  Dropdown → MultiSelect
  Textbox  → TagInput
  DatePicker → DateRangePicker

Tier 3 — Feedback & layout primitives
  Pill → StatusBadge
  Tooltip · InlineAlert · Banner · EmptyState · Tabs
  ConfirmDialog (built on existing ModalComponent)

Tier 4 — Data/list composites
  Pagination
  SearchToolbar → FilterBar
  Pill + EmptyState + Pagination → DataTable
  Button → ExportButton

Tier 5 — Workflow composites
  Stepper → Wizard
  Button + ConfirmDialog → ApprovalActions
  Timeline → ActivityFeed
  Textarea + ActivityFeed → CaseThread

Tier 6 — Document/media (most specialized, built last)
  Image-preview
  Image-preview + StatusBadge → DocumentList
  Modal pattern → Viewer
```

---

## 5. Per-component design notes

### Tier 1 — Primitives

| Component | CVA? | Key API | Notes |
|---|---|---|---|
| **Button** | No | `variant` (primary/ghost/danger), `loading`, `disabled` | **Decided: directive** (`appButton` on native `<button>`) — built, see §13. |
| **Textbox** | Yes | `label`, `placeholder`, `type`, `error` (or read from injected `NgControl`), `prefixIcon`/`suffixIcon` slots | Replaces the `.field input` pattern duplicated in `person-form`, `login`, `register` today. |
| **Textarea** | Yes | `label`, `rows`, `maxLength` (+ char counter) | Shares the Textbox shell — implement as the same wrapper component with an `multiline` input, or a thin sibling reusing shared SCSS. |
| **Checkbox** | Yes | `label`, `indeterminate` | `indeterminate` matters later for DataTable "select all" — design it in from the start even if unused initially. |
| **Radio-group** | Yes | `options: {label, value}[]`, `layout` (row/column) | |
| **Password-group** | Yes | same as Textbox + `showToggle` | Thin wrapper around Textbox internally; adds the eye-icon visibility toggle. |

### Tier 2 — Selection controls

| Component | CVA? | Key API | Notes |
|---|---|---|---|
| **Dropdown** | Yes | `options`, `label`, `placeholder` | **Decide now**: styled wrapper over native `<select>` (simple, accessible for free, no virtualization needed) vs. custom CDK-Overlay panel (needed anyway for DropdownAsyncScrollable). Recommendation: build the CDK-Overlay version once, since Async/AsyncScrollable need it — a native `<select>` can't lazy-load options on scroll. |
| **DropdownAsync** | Yes | `loadOptions: (query?: string) => Observable<Option[]>` | Adds debounced search-as-you-type against an Observable source. This is a real RxJS use case (debounceTime + switchMap) worth doing properly. |
| **DropdownAsyncScrollable** | Yes | + `loadPage: (page, query) => Observable<Page<Option>>` | Extends DropdownAsync with `cdk-virtual-scroll-viewport` or a scroll-position listener that requests the next page near the bottom. The most complex control on this list — budget accordingly. |
| **MultiSelect** | Yes | `options`, chips for selected values | Reuses Dropdown's CDK-Overlay panel; selection becomes an array instead of a single value, with removable chips in the trigger. |
| **TagInput** | Yes | free-text entry, `onCreate`, optional `suggestions` | Different from MultiSelect: user *types* new values rather than only picking from a fixed list (e.g. tagging a case). Share the "chip" sub-component with MultiSelect. |
| **DatePicker** | Yes | `min`, `max`, `format` | CDK Overlay + a calendar grid built from scratch (no Material) — this is a non-trivial build (month grid, keyboard nav, locale-aware). |
| **DateRangePicker** | Yes | `min`, `max` | Built on DatePicker's calendar, dual-selection mode (start/end) rather than a fully separate component. |

### Tier 3 — Feedback & layout

| Component | Key API | Notes |
|---|---|---|
| **Pill** | `label`, `color` (arbitrary token) | The generic building block. |
| **StatusBadge** | `status: 'pending' \| 'approved' \| 'risk' \| ...` | A *preset* of Pill — maps status strings to the semantic tokens (`--amber`, `--success`, `--red`) already defined. Replaces the ad hoc `.pill.pending/.approved/.risk` currently duplicated in `dashboard` and `people-list`. |
| **Tooltip** | `text`, `position` | CDK Overlay + `cdk-a11y` for keyboard-focus triggering, not just hover. |
| **InlineAlert** | `severity`, compact, sits inside a form/section | e.g. "This email is already registered" above a form. |
| **Banner** | `severity`, `dismissible`, spans page width | e.g. "3 KYC reviews expiring this week" at the top of a list page. Distinct from InlineAlert by scope/placement, not just styling. |
| **EmptyState** | `icon`, `title`, `message`, optional action button | Replaces the one-off empty-table markup in `people-list`. |
| **Tabs** | `tabs: {label, content}[]` or content-projected tab panels | Needed once entity detail pages exist (Profile / KYC / Documents / Accounts). |
| **ConfirmDialog** | `title`, `message`, `confirmLabel`, `danger` | Thin wrapper over the *existing* `ModalComponent` — replaces the hand-built confirm modal currently inlined in `people-list.component.html`. |

### Tier 4 — Data/list composites

| Component | Key API | Notes |
|---|---|---|
| **Pagination** | `page`, `pageSize`, `total`, `(pageChange)` | Standalone, but designed to be driven by DataTable. |
| **SearchToolbar** | `searchType` options + query input | Generalizes the pattern already built into the header's global search. |
| **FilterBar** | composes SearchToolbar + arbitrary filter controls (Dropdown, DateRangePicker, StatusBadge toggle chips) | A row of filters above a DataTable. |
| **DataTable** | `columns` (with `ng-template` cell projection), `data`/`dataSource`, `sort`, row-click, row-actions slot, `loading`, uses EmptyState + Pagination internally | **Scoped to tabular CRUD data** (search/list/register screens) — the highest-leverage component on this list, also the highest-risk to overreach on. No virtual scrolling, tree nesting, pivoting, or inline editing; those needs go to the advanced-grid family (§14), not into DataTable itself. |
| **ExportButton** | `format: 'csv' \| 'pdf'`, `rows: T[]` (or an `Observable<T[]>`), injected export strategy | **Decoupled by design**: takes plain data, not a `DataTableComponent` reference — works with any tabular data source. The actual PDF-writing implementation is injected (`EXPORT_PDF_STRATEGY` token), so swapping the PDF library later touches one provider, not this component. |

### Tier 5 — Workflow composites

| Component | Key API | Notes |
|---|---|---|
| **Stepper** | `steps`, `activeIndex`, linear or free navigation | |
| **Wizard** | composes Stepper + per-step form validation gating "Next" | Needed for Loan Application, Customer Onboarding, Account Opening. |
| **ApprovalActions** | `onApprove`, `onReject`, `onEscalate`, reason prompt via ConfirmDialog | Reused across every `*Approval` leaf in the nav tree (Loan Approval, KYC Approval, Bulk Approval...). |
| **Timeline** | `events: {label, timestamp, actor?}[]` | |
| **ActivityFeed** | Timeline + actor avatar/attribution | A specialized Timeline variant, not a separate build from scratch. |
| **CaseThread** | ActivityFeed + a Textarea-based reply composer | For Dispute Management, Service Request, Case Management leaves. |

### Tier 6 — Document/media

| Component | Key API | Notes |
|---|---|---|
| **Image-preview** | `src`, `multi` (gallery mode) | **Not** the same as the existing `AvatarUploadComponent` (circular, initials fallback, single photo) — this is rectangular, possibly multi-file, no fallback. Build against a real screen (KYC Document Upload) rather than speculatively. |
| **DocumentList** | list of `{name, status, thumbnail}` + Image-preview thumbnails + StatusBadge | For Document Upload/Checklist/Verification/Expiry leaves. |
| **Viewer** | full-screen/modal document viewer, PDF + image, injected render strategy | **Decoupled by design**: takes a generic `{url, mimeType}` source, not a `DocumentList`/`Person` reference — usable anywhere a file needs previewing. Rendering engine is injected (`VIEWER_RENDER_STRATEGY` token per source type), same pattern as ExportButton, so the PDF library decision is one provider swap, not a rewrite of this component. |

---

## 6. Suggested build order (phases)

Each phase produces genuinely usable components, and each phase after the first should include **retrofitting one existing screen** to use the new components — paying down the duplication in `person-form`/`login`/`register`/`people-list` incrementally rather than leaving it until the end.

1. **Foundation** — CVA base, Button, Textbox, Textarea, Checkbox, Password-group, Radio-group. *Retrofit: `login`, `register`, `person-form`.*
2. **Selection controls** — Dropdown, DropdownAsync, DropdownAsyncScrollable, MultiSelect, TagInput, DatePicker, DateRangePicker. *Retrofit: `person-form`'s Gender/Education selects.*
3. **Feedback & layout** — Pill, StatusBadge, Tooltip, InlineAlert, Banner, EmptyState, Tabs, ConfirmDialog. *Retrofit: `dashboard` cards' status pills, `people-list`'s delete confirmation.*
4. **Data composites** — Pagination, SearchToolbar, FilterBar, DataTable, ExportButton. *Retrofit: `people-list`'s hand-rolled table.*
5. **Workflow** — Stepper, Wizard, ApprovalActions, Timeline, ActivityFeed, CaseThread. *No existing screen to retrofit yet — first real usage will be whichever Compliance/Banking screen gets built next.*
6. **Document/media** — Image-preview, DocumentList, Viewer. *Built last and against a real screen (e.g. KYC Document Upload) rather than speculatively, per the earlier "rule of three" discussion.*

---

## 7. Open decisions before starting

1. ~~**Button**: component or directive?~~ **Resolved: directive** (`appButton` on native `<button>`).
2. ~~**Dropdown**: native `<select>` wrapper or custom CDK-Overlay panel?~~ **Resolved: CDK-Overlay panel** — built, see §13.
3. ~~**PDF handling** for Viewer/ExportButton~~ **Resolved: decoupled via DI, not a library choice yet.** Neither component should import a PDF library directly, nor depend on each other or on DataTable's internals — see §14.1.
4. ~~**DataTable v1 scope**~~ **Resolved: DataTable is for tabular CRUD data only** — search/list/register screens with row actions. No virtual scrolling, tree nesting, pivoting, or inline cell editing in DataTable itself; those live in the separate advanced-grid family (§14), which DataTable does **not** grow into.

---

## 8. Accessibility requirements per component

These aren't optional polish — several of these components are unusable via keyboard or a screen reader if the ARIA pattern isn't designed in from the start, and retrofitting accessibility after the fact usually means reworking the DOM structure, not just adding attributes.

| Component | Required pattern |
|---|---|
| Dropdown / DropdownAsync / DropdownAsyncScrollable / MultiSelect | ARIA combobox pattern — `role="combobox"` on the trigger, `role="listbox"`/`role="option"` in the panel, arrow-key navigation, `aria-activedescendant` |
| DatePicker / DateRangePicker | `role="grid"` calendar with arrow-key day navigation, `aria-label` announcing the focused date |
| Tabs | ARIA tabs pattern — `role="tablist"/"tab"/"tabpanel"`, arrow-key switching, only the active tab in the tab order |
| ConfirmDialog (+ existing Modal) | Focus trap on open (CDK's `FocusTrap` via `@angular/cdk/a11y`), focus returns to the trigger on close, `Escape` closes (Modal already does this) |
| Tooltip | Must trigger on keyboard focus, not just mouse hover — `cdk-a11y`'s `FocusMonitor`, not a bare `(mouseenter)` |
| Checkbox / Radio-group | Real `<input type="checkbox">`/`role="radiogroup"` under the hood — don't build these as styled `<div>`s with click handlers, or they lose native keyboard/screen-reader behavior for free |
| DataTable | `role="table"/"row"/"columnheader"/"cell"`, sortable headers get `aria-sort`, row actions reachable via keyboard (Tab into the row, not just mouse-hover-revealed buttons) |
| Stepper / Wizard | Current step announced on change (`aria-live` region), disabled future steps are `aria-disabled`, not just visually greyed out |
| Toast (existing) | Already uses `role="status"` — same pattern should extend to Banner/InlineAlert |

---

## 9. Concrete API sketches — Tier 1 & 2 (Phases 1–2, build these first)

Sketching real interfaces now so Phase 1 has a defined target instead of starting from a blank file.

```ts
// shared/form/base-value-accessor.ts
export abstract class BaseValueAccessor<T> implements ControlValueAccessor {
  protected readonly value = signal<T | null>(null);
  protected readonly disabled = signal(false);
  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: T | null): void { this.value.set(value); }
  registerOnChange(fn: (value: T | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  protected emitValue(value: T | null): void {
    this.value.set(value);
    this.onChange(value);
  }
  protected markTouched(): void { this.onTouched(); }
}
```

```ts
// shared/form/textbox/textbox.component.ts (shape, not full implementation)
@Component({
  selector: 'app-textbox',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: TextboxComponent, multi: true }]
})
export class TextboxComponent extends BaseValueAccessor<string> {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<'text' | 'email' | 'tel' | 'number'>('text');
  readonly errorMessage = input<string | null>(null);
  readonly prefixIcon = input<string | null>(null);
  readonly suffixIcon = input<string | null>(null);
}
```

```ts
// shared/data/data-table/data-table.component.ts (shape)
export interface ColumnDef<T> {
  key: keyof T & string;
  header: string;
  sortable?: boolean;
  /** When omitted, renders the raw cell value; set this to project a custom cell (badges, actions, links). */
  cellTemplate?: TemplateRef<{ $implicit: T }>;
}

@Component({ selector: 'app-data-table' })
export class DataTableComponent<T> {
  readonly columns = input.required<ColumnDef<T>[]>();
  readonly data = input.required<T[]>();
  readonly loading = input(false);
  readonly trackBy = input<(item: T) => string | number>();
  readonly rowClick = output<T>();
  readonly sortChange = output<{ key: string; direction: 'asc' | 'desc' }>();
}
```

```html
<!-- Example consumer usage — custom cell via content projection -->
<app-data-table [columns]="columns" [data]="people()">
  <ng-template #statusCell let-row>
    <app-status-badge [status]="row.status" />
  </ng-template>
</app-data-table>
```

```ts
// shared/feedback/status-badge/status-badge.component.ts
export type StatusTone = 'pending' | 'approved' | 'risk' | 'active' | 'suspended' | 'draft';

@Component({ selector: 'app-status-badge' })
export class StatusBadgeComponent {
  readonly status = input.required<StatusTone>();
  readonly label = input<string | null>(null); // overrides the default display text for `status`
}
```

---

## 10. Standard component scaffold

Every component in this plan should follow the same file shape already established (`ts` / `html` / `scss` triplet, `OnPush`, standalone):

```
shared/<group>/<component-name>/
  <component-name>.component.ts
  <component-name>.component.html
  <component-name>.component.scss
  <component-name>.component.spec.ts   (required for anything with logic — see §11)
```

Boilerplate checklist for each new component:
- [ ] `standalone: true`, `changeDetection: ChangeDetectionStrategy.OnPush`
- [ ] Signal-based `input()`/`output()`, no `@Input()`/`@Output()` decorators
- [ ] Form controls: `providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: ..., multi: true }]`, extends `BaseValueAccessor`
- [ ] Overlay-based components (Dropdown, Tooltip, DatePicker): CDK `Overlay` + `ConnectedPositionStrategy`, matching the precedent already set by `ModalComponent`/`MegaPanelComponent` in this project
- [ ] Uses existing design tokens (`var(--accent)`, `var(--border)`, etc.) — no new hardcoded colors
- [ ] Labels/messages passed as `input()` strings (not hardcoded English) so Transloco can drive them from the consumer

---

## 11. Effort sizing & testing matrix

| Component | Size | Unit test focus |
|---|---|---|
| Button | S | — (pure presentation; skip unless built as a directive with real logic) |
| Textbox / Textarea / Checkbox / Radio-group | S each | CVA: `writeValue`/`registerOnChange` round-trip, disabled state |
| Password-group | S | Visibility toggle state |
| Dropdown | M | Option selection emits correct value, keyboard nav (Home/End/Arrow) |
| DropdownAsync | M | debounce + switchMap cancels stale requests (RxJS marble test candidate) |
| DropdownAsyncScrollable | L | Pagination trigger fires once per scroll threshold, no duplicate page loads |
| MultiSelect / TagInput | M each | Add/remove chip updates emitted array correctly |
| DatePicker | L | Month navigation, min/max boundary enforcement, keyboard grid nav |
| DateRangePicker | M (on top of DatePicker) | Start-before-end enforcement |
| Pill / StatusBadge | S | Status-to-token mapping is exhaustive (fails if a new status is added without a mapping) |
| Tooltip / InlineAlert / Banner / EmptyState | S each | — mostly presentational |
| Tabs | M | Keyboard arrow switching, only active tab focusable |
| ConfirmDialog | S | Confirm/cancel emit correctly, wraps existing Modal |
| Pagination | S | Page boundary math (first/last page disabled states) |
| SearchToolbar / FilterBar | M each | Emits combined filter state correctly |
| DataTable | L | Sort toggling (asc→desc→none), empty state renders when `data` is empty, loading state |
| ExportButton | S | — |
| Stepper | M | Step navigation respects `linear` mode gating |
| Wizard | M (on top of Stepper) | "Next" blocked when the active step's form is invalid |
| ApprovalActions | S | Reason prompt required before reject/escalate emit |
| Timeline / ActivityFeed | S each | — mostly presentational |
| CaseThread | M | New entry appends and clears the composer |
| Image-preview | S | — |
| DocumentList | M | Status-per-document rendering |
| Viewer | L | Rendering strategy is injected per §14.1, so this can be built and tested against a stub strategy before any PDF library is chosen — sizing no longer blocked on that decision. |

**Total rough sizing**: ~14 S, ~14 M, ~4-5 L. The L components (DropdownAsyncScrollable, DatePicker, DataTable, Viewer) are where the real time goes — budget them accordingly rather than assuming a flat per-component estimate.

---

## 12. Next steps

This document is now detailed enough to start Phase 1. In order:
1. Resolve the three open decisions in §7 (Button: component vs directive; Dropdown: native vs CDK-Overlay; confirm DataTable v1 scope).
2. Build `BaseValueAccessor` (§2) — nothing in Phase 1 should start before this exists.
3. Build Phase 1 components against the sketches in §9.
4. Retrofit `login`/`register`/`person-form` to use them (§6), which also serves as Phase 1's integration test.

---

## 13. Build status

| Component | Status | Location |
|---|---|---|
| `BaseValueAccessor` | ✅ Built | `shared/form/base-value-accessor.ts` |
| Button (directive) | ✅ Built, retrofitted into login/register/person-form/people-list | `shared/form/button/button.directive.ts` |
| Textbox | ✅ Built, retrofitted into login/register/person-form | `shared/form/textbox/textbox.component.ts` |
| Textarea | ✅ Built (no existing screen to retrofit yet) | `shared/form/textarea/textarea.component.ts` |
| Checkbox | ✅ Built (no existing screen to retrofit yet) | `shared/form/checkbox/checkbox.component.ts` |
| Radio-group | ✅ Built (no existing screen to retrofit yet) | `shared/form/radio-group/radio-group.component.ts` |
| Password-group | ✅ Built, retrofitted into login/register | `shared/form/password-group/password-group.component.ts` |
| Dropdown | ✅ Built, retrofitted into person-form's Gender/Education | `shared/form/dropdown/dropdown.component.ts` |
| **Tier 1: complete.** | | |
| DropdownAsync | ✅ Built (no existing screen to retrofit yet) | `shared/form/dropdown-async/dropdown-async.component.ts` |
| DropdownAsyncScrollable | ✅ Built (no existing screen to retrofit yet) | `shared/form/dropdown-async-scrollable/dropdown-async-scrollable.component.ts` |
| MultiSelect | ✅ Built (no existing screen to retrofit yet) | `shared/form/multi-select/multi-select.component.ts` |
| TagInput | ✅ Built (no existing screen to retrofit yet) | `shared/form/tag-input/tag-input.component.ts` |
| DatePicker | ✅ Built (no existing screen to retrofit yet) | `shared/form/date-picker/date-picker.component.ts` |
| DateRangePicker | ✅ Built (no existing screen to retrofit yet) | `shared/form/date-range-picker/date-range-picker.component.ts` |
| **Tier 2: complete.** | | |
| Pill | ✅ Built | `shared/feedback/pill/pill.component.ts` |
| StatusBadge | ✅ Built, retrofitted into dashboard's Recent Records status column | `shared/feedback/status-badge/status-badge.component.ts` |
| Tooltip | ✅ Built (no existing screen to retrofit yet) | `shared/feedback/tooltip/tooltip.directive.ts` |
| InlineAlert | ✅ Built (no existing screen to retrofit yet) | `shared/feedback/inline-alert/inline-alert.component.ts` |
| Banner | ✅ Built (no existing screen to retrofit yet) | `shared/feedback/banner/banner.component.ts` |
| EmptyState | ✅ Built, retrofitted into people-list's empty-table row | `shared/feedback/empty-state/empty-state.component.ts` |
| Tabs | ✅ Built (no existing screen to retrofit yet) | `shared/layout/tabs/tabs.component.ts` |
| ConfirmDialog | ✅ Built, retrofitted into people-list's delete confirmation | `shared/feedback/confirm-dialog/confirm-dialog.component.ts` |
| **Tier 3: complete.** | | |
| Pagination | ✅ Built, retrofitted into people-list | `shared/data/pagination/pagination.component.ts` |
| SearchToolbar | ✅ Built, retrofitted into people-list (via FilterBar) | `shared/data/search-toolbar/search-toolbar.component.ts` |
| FilterBar | ✅ Built, retrofitted into people-list | `shared/data/filter-bar/filter-bar.component.ts` |
| DataTable | ✅ Built, retrofitted into people-list (replaced its hand-rolled `<table>`) | `shared/data/data-table/data-table.component.ts` |
| ExportButton | ✅ Built (CSV strategy only — no `EXPORT_PDF_STRATEGY` provided yet), retrofitted into people-list | `shared/data/export-button/export-button.component.ts` |
| **Tier 4: complete.** | | |
| Stepper | ✅ Built (no existing screen to retrofit yet) | `shared/workflow/stepper/stepper.component.ts` |
| Wizard | ✅ Built (no existing screen to retrofit yet) | `shared/workflow/wizard/wizard.component.ts` + `wizard-step.component.ts` |
| ApprovalActions | ✅ Built (no existing screen to retrofit yet) | `shared/workflow/approval-actions/approval-actions.component.ts` |
| Timeline | ✅ Built (no existing screen to retrofit yet) | `shared/workflow/timeline/timeline.component.ts` |
| ActivityFeed | ✅ Built (no existing screen to retrofit yet) | `shared/workflow/activity-feed/activity-feed.component.ts` |
| CaseThread | ✅ Built (no existing screen to retrofit yet) | `shared/workflow/case-thread/case-thread.component.ts` |
| **Tier 5: complete.** | | |
| Everything else in this document | 📋 Planned, not yet built | — |

Tier 5 notes:
- **No retrofit this tier** — same "no speculative UI" principle applied throughout this plan (§6 says as much explicitly: "first real usage will be whichever Compliance/Banking screen gets built next"). No Loan Application/Wizard, `*Approval` leaf, or Case Management screen exists yet to retrofit into, so these were built and tested standalone against the §5/§8/§11 specs rather than against real usage.
- **Stepper is presentational/controlled, not self-contained like Tabs.** `activeIndex` always reflects the true current step and `stepChange` is only a *request* — the same "value in, change event out" shape Tier 4's notes established for DataTable/Pagination, chosen deliberately over Tabs' "controlled only at mount, then internal" shape, because Stepper almost always wraps real per-step content with external validity requirements (Wizard) rather than being a self-contained widget the way Tabs typically is. Linear-mode gating reads an explicit `completed` flag per step (set by whoever owns the steps), not an implicitly-tracked "furthest visited" index — more predictable and directly testable.
- **Wizard layers form-validity gating on top of Stepper, it doesn't teach Stepper about forms.** `WizardStepComponent` (mirrors `TabComponent`'s shape — visibility via `setActive()`, real projected content, not a `{label, content}[]` array) takes an optional `AbstractControl` `form` input and bridges its `statusChanges` into a signal via `toObservable`/`toSignal`, so "Next" (and clicking ahead on the Stepper indicator) both block while the active step's form is invalid — verified with a real `FormControl` + `Validators.required` in the spec, not a stub.
- **ApprovalActions' reason requirement is enforced with an inline field error, not a disabled ConfirmDialog button** — `ConfirmDialogComponent` has no `confirmDisabled` input, and adding one to already-shipped Tier 3 code for this one caller wasn't worth it. `confirmReason()` just re-checks on every submit attempt and sets `reasonError`, the same `errorMessage` pattern every Tier 1 form control already uses.
- **ActivityFeed is a genuine Timeline variant, not a rebuild** — both share `shared/workflow/_timeline-shell.scss`'s mixins (the vertical line/dot/body/label/meta layout), an SCSS mixin file mirroring Tier 1's `_field-shell.scss` convention. ActivityFeed only swaps Timeline's icon marker for actor initials and makes `actor` required instead of optional.
- **CaseThread doesn't own the entries list** — same reasoning as DataTable: `entries` stays the consumer's real (likely backend-persisted) data, `reply` is just the composed text. CaseThread doesn't optimistically append its own copy, which could drift from whatever the consumer's create-request actually persists; submitting always clears the composer immediately regardless of when/whether `entries` catches up.
- **No output name collides with a native DOM event this time** (`stepChange`, `stepIndexChange`, `finished`, `decided`, `reply` were all checked against `@angular-eslint/no-output-native` up front) — see Tier 4's notes for the `search`/`searched` case that caught this the hard way.

Tier 4 notes:
- **DataTable never sorts or paginates `data` itself** — `sort`/`page`/`total` are inputs the consumer owns (its own signal), `sortChange`/`pageChange` are just change *requests*. Same "value in, change event out" shape as every CVA-based form control in this app, rather than a second state-management pattern. `page`/`total` are both optional and nullable — omit them to skip rendering the internal Pagination control entirely (a small in-memory list has no need for it).
- **Row actions reuse the `cellTemplate` mechanism, not a separate content-projection slot.** `<ng-content>` only inserts once per component instance, not once per row, so it can't represent "one action cell per row" — a column with `header: ''` and a `cellTemplate` rendering Edit/Delete buttons does. `ColumnDef.key` was widened from the original `keyof T & string` sketch to `(keyof T & string) | string` for exactly this reason: a purely presentational column (a photo thumbnail, row actions) has no backing field on `T` to key against.
- **`toggleSort()` cycles asc → desc → none** (not just asc ↔ desc) per §11's stated test focus — clicking a third time returns to unsorted. `SortState.direction` is `'asc' | 'desc' | 'none'`, a genuine third state (not just an absent `sort` input), so `aria-sort="none"` can be reported correctly per §8's DataTable a11y requirement.
- **FilterBar composes SearchToolbar, it doesn't reimplement it** — its own `search-toolbar.component.ts` output had to be named `searched`, not `search` (the literal name in the §5 API description), since `@angular-eslint/no-output-native` flags any output colliding with a real DOM event name.
- **ExportButton's CSV path has no dependency** — `csv-export.ts` is pure functions (`buildCsv`/`csvEscape`/`formatCell`), unit-tested without TestBed, same reasoning as DatePicker's `date-utils.ts`. The PDF path is fully decoupled per §7/§14.1: `EXPORT_PDF_STRATEGY` is an `InjectionToken`; with no provider, `format="pdf"` shows a toast instead of silently failing. No PDF provider exists yet in this app — first real PDF export screen will drive which library gets wired in.
- **Retrofitted `people-list`** (§6 phase 4's target): its hand-rolled `<table>` became `<app-data-table>`, the delete-confirmation's inline empty-table markup was already `<app-empty-state>` (Tier 3), search/sort/pagination are now real (client-side, since `PeopleService` still returns its full in-memory array) instead of absent, and CSV export was net-new (there was nothing to replace).

Tier 3 notes:
- **Pill is the generic building block; StatusBadge is a thin preset on top of it**, mapping a closed `StatusTone` union to `{tone, label}` via a `Record<StatusTone, …>` — exhaustive by construction, since adding a new `StatusTone` member without a matching entry is a TypeScript compile error, not a silent runtime fallback (per §11's stated test focus for this component).
- **Tooltip is a directive (`appTooltip`), not a component** — same reasoning as Button (§7/§13): it decorates an *existing* element rather than wrapping it in new markup. First use of `@angular/cdk/a11y`'s `FocusMonitor` in this codebase, so it shows on keyboard focus as well as `mouseenter`/hover per the §8 accessibility requirement, and is exposed via `aria-describedby` rather than by moving DOM focus into the bubble. The bubble itself is styled from `var(--text)`/`var(--paper)` (an inverted swap of the two most theme-sensitive tokens) instead of a new tooltip-specific color, so it stays correct across all 7 themes.
- **Tabs is a component pair (`TabComponent` + `TabsComponent`), not a `{label, content}[]` input array** — tab bodies stay real projected content (arbitrary templates/forms) rather than being restricted to a plain data shape. `TabsComponent` reads each `TabComponent` via `contentChildren()` and drives its visibility/ARIA wiring directly (`setActive()`/`setTabButtonId()`) — no shared service needed since the parent already holds direct references to its children. `activeIndex` only sets the tab that's active *initially*; after mount, `select()`/keyboard navigation is the sole source of truth (the same "controlled by events after mount" shape as a native `<details>` element, not a two-way-bound input). Full ARIA tabs pattern per §8: arrow-key switching with automatic activation, Home/End jump to the first/last enabled tab, roving `tabindex` so only the active tab sits in the natural Tab order, and disabled tabs are skipped by every navigation path, not just visually greyed out.
- **ConfirmDialog is a genuinely thin wrapper** — it owns no dialog chrome of its own, delegating entirely to the existing `ModalComponent` for the focus trap/Escape/backdrop-click behavior already built there, and exposes `confirmed`/`cancelled` outputs plus a content-projection slot that falls back to plain `message()` text when nothing is projected — so people-list's bolded person name (`Delete <b>Jane Doe</b>?`) still renders without needing an `innerHTML` escape hatch.
- **Banner and InlineAlert intentionally share only their severity→icon mapping, not their visual treatment.** Banner reuses the existing card-with-left-accent idiom already established by Toast and the dashboard's summary cards (persistent, page-level, sits in the page flow); InlineAlert is a small tinted-background strip sized to sit directly above/below a form field. Both, along with Toast's existing `type`, reuse the same three icons already in the icon registry (`check-circle`/`info-circle`/`alert-circle`) — `warning` and `error` share `alert-circle`, differentiated only by color, rather than adding new SVG paths for a shape difference nobody asked for.
- **Retrofitted 2 existing screens**: dashboard's hand-rolled `.pill.pending/.approved/.risk` CSS (removed entirely, ~35 lines) became `<app-status-badge>`; people-list's inlined delete-confirmation modal markup became `<app-confirm-dialog>`, and its hand-built empty-table message became `<app-empty-state>`.
- Tooltip, InlineAlert, Banner, and Tabs have no existing screen to retrofit into yet — same "no speculative UI" principle applied throughout this plan; first real usage will drive whether the APIs sketched here need adjustment.

Tier 2 notes:
- **Shared `date-utils.ts`** (pure functions: `buildMonthGrid`, `addDays`, `addMonths`, `isSameDay`, `isWithinRange`, `formatDate`) backs both DatePicker and DateRangePicker — no external date library, consistent with §7's still-open library decision not blocking anything that doesn't strictly need one. 16 unit tests on the date math alone, since a bug here silently breaks both calendars.
- **DateRangePicker built as a sibling to DatePicker, not a subclass** — same reasoning as Password-group/Textbox in Tier 1: the value shape is fundamentally different (`DateRange` vs `Date`), so composition/shared-utils beat inheritance here. It reuses the grid-rendering approach but is its own CVA<DateRange>.
- **DropdownAsync/DropdownAsyncScrollable both defensively wrap the consumer-provided loader in `try/catch`**, not just `catchError()` on the returned Observable — a loader that throws *synchronously* (e.g. a bug before an HTTP call is even made) would otherwise bypass `catchError` entirely and crash the debounce pipeline permanently. Both are covered by a dedicated test.
- **DropdownAsyncScrollable's pagination** resets to page 0 and replaces the list on a new search, but appends on scroll — verified by test, since these are easy to accidentally invert.
- **TagInput deliberately skips CDK Overlay** — its suggestion panel sits directly under the input with no viewport-flipping need, so a plain absolutely-positioned div is simpler and was preferred over reaching for Overlay by default everywhere.
- **MultiSelect's panel stays open across selections** (doesn't close on pick, unlike single-select Dropdown) — this is deliberate, not an oversight; closes only on backdrop click or Escape.
- All six extend `BaseValueAccessor`, same as Tier 1 — no new CVA patterns introduced.
- None of Tier 2 has an existing screen to retrofit into yet (no Compliance/Banking screen needing search-by-customer, tags, or date ranges has been built) — same "no speculative UI" principle applied throughout this plan. First real usage will drive whether the APIs sketched here needed adjustment.



Tier 1 notes:
- All five CVA-based controls extend `BaseValueAccessor` — no hand-rolled `writeValue`/`registerOnChange` anywhere.
- Checkbox and Radio-group use **real native `<input type="checkbox"/radio">`** elements (visually hidden, functionally present) rather than styled `<div>`s, per the §8 accessibility requirement — keyboard and screen-reader behavior comes from the browser for free.
- Textbox, Textarea, and Password-group share visual styling via `shared/form/_field-shell.scss` **mixins** (not a shared global class) — each component's compiled CSS stays properly encapsulated per Angular's ViewEncapsulation, at the cost of small duplication in the compiled output. This is the same reasoning as the Button directive's global stylesheet, applied the other way: directives can't own scoped styles at all, so Button's styling *has* to be global; these three *can* be scoped, so they are, via mixins instead of a shared class.
- Password-group is intentionally **not** built by nesting `<app-textbox>` inside it — bridging two `ControlValueAccessor`s for a component this small wasn't worth the complexity; it shares Textbox's visual mixins instead of its markup.
- Retrofitted 4 existing screens; **13 raw native form elements removed** across `login`, `register`, and `person-form`, along with 3 more duplicated `.field`/`.label`/`input` CSS blocks (on top of the `.btn` duplication removed in the Button phase).
- Checkbox/Textarea/Radio-group have no existing screen to retrofit into yet — first real usage will be whichever Compliance/Banking screen gets built next (matching the "no speculative UI" principle used throughout this plan).



Dropdown notes:
- Static options only (`DropdownOption<T>[]` — `{label, value, disabled?}`); `DropdownAsync`/`DropdownAsyncScrollable` build on top of this once needed.
- Full ARIA combobox pattern per §8: `role="combobox"` trigger, `role="listbox"/"option"` panel, arrow/Home/End/Enter/Escape keyboard nav, `aria-activedescendant` (no DOM focus movement into the panel).
- `compareWith` input for non-primitive value types, defaulting to `===` — same escape hatch Angular's own `<select>`/Material use.
- Connected CDK Overlay (not the imperative `Overlay` service `Modal`/`MegaPanel` use) — appropriate here since this anchors to a trigger element rather than centering globally; two fallback positions (below, then above) so it flips when there's no room below.

---

## 14. Advanced grid family (future — not part of the current 33, kept deliberately separate from DataTable)

DataTable is scoped to tabular CRUD data (§7 decision 4). The components below cover genuinely different problems — hierarchy, aggregation, and cell-level editing — and are listed here so the roadmap exists, without pressure to fold them into DataTable and turn it into an unmaintainable do-everything grid. **Nothing in this section gets built until a real screen needs it.**

### 14.1 Decoupling principle for Viewer/ExportButton (applies now, not just to this section)

Both take **plain data/generic sources**, never a reference to `DataTableComponent`, `DocumentList`, or any other component:

```ts
// shared/data/export-button/export.tokens.ts
export interface ExportStrategy<T> {
  export(rows: T[], columns: { key: string; header: string }[]): void | Promise<void>;
}
export const CSV_EXPORT_STRATEGY = new InjectionToken<ExportStrategy<unknown>>('CSV_EXPORT_STRATEGY');
export const PDF_EXPORT_STRATEGY = new InjectionToken<ExportStrategy<unknown>>('PDF_EXPORT_STRATEGY');
```

```ts
// shared/media/viewer/viewer.tokens.ts
export interface ViewerSource {
  url: string;
  mimeType: 'application/pdf' | 'image/png' | 'image/jpeg';
}
export interface ViewerRenderStrategy {
  supports(mimeType: string): boolean;
  render(container: ElementRef, source: ViewerSource): void;
}
export const VIEWER_RENDER_STRATEGIES = new InjectionToken<ViewerRenderStrategy[]>('VIEWER_RENDER_STRATEGIES');
```

`ExportButtonComponent`/`ViewerComponent` inject these tokens rather than importing a PDF library directly. The CSV strategy can be built today with zero new dependencies; a PDF strategy (whichever library gets picked later) is a new provider, not a change to either component's public API. This also means both are independently unit-testable now against a fake strategy, without waiting on a library decision.

### 14.2 New CDK modules this tier needs

Only `@angular/cdk/overlay` is in use today. This tier brings in:

| CDK module | Used by |
|---|---|
| `@angular/cdk/tree` (`CdkTree`, `CdkTreeNode`) | TreeTable — headless tree data source, same relationship to TreeTable as `CdkTable`-style patterns have to DataTable |
| `@angular/cdk/scrolling` (`cdk-virtual-scroll-viewport`) | TreeTable and Spreadsheet, once row counts are large enough to need it — also the eventual home for `DropdownAsyncScrollable`'s pagination-on-scroll (§9) |
| `@angular/cdk/drag-drop` (`CdkDrag`, `CdkDropList`) | Column reordering in Spreadsheet/PivotTable, and row-reordering if a CRUD screen ever needs manual ordering |

### 14.3 Custom directives (shared behavior, not baked into any one component)

These are built as **directives**, not component features, specifically so DataTable can optionally opt into one (e.g. sticky columns on a wide CRUD table) without inheriting the rest of the advanced-grid complexity:

| Directive | Purpose | Consumers |
|---|---|---|
| `ColumnResizeDirective` | Drag-to-resize a `<th>`, persists width via a signal the host table reads | Spreadsheet, PivotTable; optionally DataTable |
| `StickyColumnDirective` (frozen columns) | Pins a column via `position: sticky` + computed offset from preceding sticky columns | TreeTable, Spreadsheet; optionally DataTable for an id/name column |
| `ExpandableRowDirective` | Toggle + ARIA (`aria-expanded`, `role="row"` group semantics) for a row that reveals nested content | TreeTable primarily; also usable by DataTable for a "show details" expand row without needing full tree data |

### 14.4 Standalone components

| Component | Built on | Notes |
|---|---|---|
| **EditableCell** | `BaseValueAccessor` (reuses the same CVA pattern as every Tier 1/2 form control) | The primitive: a cell that's read-only text until focused/double-clicked, then swaps to an inline control (Textbox/Dropdown/DatePicker, reused directly). Built first in this tier — Spreadsheet is largely EditableCell + layout. |
| **TreeTable** | DataTable's column/row rendering + `CdkTree` for the hierarchy + `ExpandableRowDirective` | For genuinely hierarchical CRUD data (e.g. a Role → Permission tree, or Branch → Sub-branch). Not the same problem as the nav rail's tree (that's navigation, this is data) — no code sharing expected with `NavTreeStateService`. |
| **Spreadsheet** | EditableCell + `ColumnResizeDirective` + `StickyColumnDirective` + virtual scroll | The largest build in this tier by far — full grid editing, not a v1 candidate under any circumstance. |
| **PivotTable** | TreeTable's rendering (row grouping is structurally a tree) + a separate aggregation/data-shaping layer | The aggregation logic (group-by, sum/avg/count) is the hard part and is data logic, not UI — likely deserves its own service, not just a component. |

### 14.5 Suggested order, whenever this tier actually starts

1. `ExportButton`/`Viewer` (from the current 33) built against the §14.1 token contracts, with a CSV strategy and a stub/no-op render strategy — this validates the decoupling actually works before anything advanced is built on top.
2. `EditableCell` (needed by everything else here).
3. `ExpandableRowDirective` → `TreeTable`.
4. `ColumnResizeDirective` + `StickyColumnDirective` → `Spreadsheet`.
5. `PivotTable` last — it's the one most likely to need real requirements from an actual reporting screen rather than being designed speculatively (same "rule of three" reasoning as Image-preview in §6).
