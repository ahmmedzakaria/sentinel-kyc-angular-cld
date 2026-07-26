import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-avatar-upload',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './avatar-upload.component.html',
  styleUrl: './avatar-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarUploadComponent {
  /** Data URL of the current photo, or null for the initials fallback. */
  readonly photoUrl = input<string | null>(null);
  /** Used to render initials when there's no photo yet. */
  readonly fallbackName = input<string>('');
  readonly photoUrlChange = output<string | null>();

  protected readonly initials = computed(() => {
    const parts = this.fallbackName().trim().split(/\s+/).filter(Boolean);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  });

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => this.photoUrlChange.emit(reader.result as string);
    reader.readAsDataURL(file);
  }

  remove(): void {
    this.photoUrlChange.emit(null);
  }
}
