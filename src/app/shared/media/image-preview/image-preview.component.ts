import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';

/**
 * Rectangular image display — deliberately **not** `AvatarUploadComponent`
 * (circular, initials fallback, single photo only). This is for document/
 * media previews: possibly multiple images (gallery mode), no fallback
 * beyond a generic placeholder when there's nothing to show.
 */
@Component({
  selector: 'app-image-preview',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './image-preview.component.html',
  styleUrl: './image-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImagePreviewComponent {
  readonly src = input.required<string | string[]>();
  readonly alt = input('');

  protected readonly images = computed(() => {
    const s = this.src();
    return Array.isArray(s) ? s : [s];
  });
  protected readonly activeIndex = signal(0);
  protected readonly isGallery = computed(() => this.images().length > 1);
  protected readonly activeSrc = computed(() => this.images()[this.activeIndex()] ?? null);

  next(): void {
    const count = this.images().length;
    this.activeIndex.update((i) => (i + 1) % count);
  }

  prev(): void {
    const count = this.images().length;
    this.activeIndex.update((i) => (i - 1 + count) % count);
  }

  selectImage(index: number): void {
    this.activeIndex.set(index);
  }
}
