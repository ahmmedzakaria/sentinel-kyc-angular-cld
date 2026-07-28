import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';
import { ImagePreviewComponent } from '../image-preview/image-preview.component';
import { StatusBadgeComponent, StatusTone } from '../../feedback/status-badge/status-badge.component';

export interface DocumentListItem {
  id: number | string;
  name: string;
  /** Reuses Tier 3's StatusBadge union — no separate status vocabulary for documents. */
  status: StatusTone;
  /** Image data/blob URL for the thumbnail; omit for a generic document-icon fallback (e.g. a PDF with no rendered preview yet). */
  thumbnail?: string;
  mimeType?: string;
}

/**
 * A list of uploaded documents — ImagePreview thumbnails + StatusBadge per
 * row. `removable` toggles between the intake wizard's editable use (can
 * remove a document before submitting) and the case detail screen's
 * read-only use of the same component.
 */
@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [IconComponent, ImagePreviewComponent, StatusBadgeComponent],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentListComponent {
  readonly documents = input.required<DocumentListItem[]>();
  readonly removable = input(false);

  readonly itemClick = output<DocumentListItem>();
  readonly itemRemove = output<DocumentListItem>();
}
