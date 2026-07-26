import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastComponent } from './shared/toast/toast.component';
import { DirectionService } from './core/services/direction.service';

/**
 * Thin root — just the router outlet and the two truly global concerns
 * (toasts, RTL direction). The actual console chrome lives in AppShellComponent
 * and is only mounted for authenticated routes; login/register render here
 * directly with no header/rail/status-bar around them.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `
    <router-outlet />
    <app-toast-stack />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly direction = inject(DirectionService);
}
