import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ModalComponent } from '../../modal/modal.component';
import { ImagePreviewComponent } from '../image-preview/image-preview.component';
import { InlineAlertComponent } from '../../feedback/inline-alert/inline-alert.component';
import { VIEWER_PDF_STRATEGY, ViewerSource } from './viewer-strategy';

export type { ViewerSource } from './viewer-strategy';

/**
 * Full-preview modal for a generic `{url, mimeType}` source — usable
 * anywhere a file needs previewing, not tied to DocumentList/a specific
 * feature. Built on the existing ModalComponent rather than a new overlay
 * mechanism (same reuse as ConfirmDialogComponent).
 */
@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [ModalComponent, ImagePreviewComponent, InlineAlertComponent, NgComponentOutlet],
  templateUrl: './viewer.component.html',
  styleUrl: './viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewerComponent {
  protected readonly pdfStrategy = inject(VIEWER_PDF_STRATEGY, { optional: true });

  readonly open = input.required<boolean>();
  readonly source = input<ViewerSource | null>(null);
  readonly closed = output<void>();

  protected readonly isImage = computed(() => this.source()?.mimeType.startsWith('image/') ?? false);
  protected readonly isPdf = computed(() => this.source()?.mimeType === 'application/pdf');
}
