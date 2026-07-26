import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ToastService } from './toast.service';
import { ToastType } from './toast.model';

const ICON_BY_TYPE: Record<ToastType, string> = {
  success: 'check-circle',
  error: 'alert-circle',
  info: 'info-circle'
};

@Component({
  selector: 'app-toast-stack',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
  protected readonly iconByType = ICON_BY_TYPE;
}
