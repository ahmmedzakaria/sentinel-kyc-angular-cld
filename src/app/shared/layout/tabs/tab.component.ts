import { ChangeDetectionStrategy, Component, HostBinding, input, signal } from '@angular/core';

let nextUid = 0;

/**
 * A single tab panel, projected as content inside <app-tabs>. TabsComponent
 * reads `label()`/`disabled()` to render its tablist header, and drives this
 * instance's visibility/ARIA wiring directly via setActive()/setTabButtonId()
 * rather than through a shared service — the parent already holds a
 * contentChildren() query over every TabComponent instance.
 */
@Component({
  selector: 'app-tab',
  standalone: true,
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabComponent {
  readonly label = input.required<string>();
  readonly disabled = input(false);

  /** Public: TabsComponent's tablist buttons reference this for `aria-controls`. */
  readonly panelId = signal(`tabpanel-${nextUid++}`);

  protected readonly active = signal(false);
  private readonly labelledBy = signal('');

  @HostBinding('attr.role') readonly role = 'tabpanel';
  @HostBinding('attr.id') get hostId(): string {
    return this.panelId();
  }
  @HostBinding('attr.aria-labelledby') get hostLabelledBy(): string {
    return this.labelledBy();
  }
  @HostBinding('style.display') get display(): string {
    return this.active() ? '' : 'none';
  }

  setActive(active: boolean): void {
    this.active.set(active);
  }

  setTabButtonId(tabButtonId: string): void {
    this.labelledBy.set(tabButtonId);
  }
}
