import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ButtonDirective } from '../../form/button/button.directive';
import { IconComponent } from '../../icon/icon.component';
import { ToastService } from '../../toast/toast.service';
import { EXPORT_PDF_STRATEGY, ExportColumn } from './export-strategy';
import { buildCsv } from './csv-export';

export type ExportFormat = 'csv' | 'pdf';

/**
 * Decoupled by design: takes plain `rows`/`columns`, not a DataTableComponent
 * reference — works with any tabular data source, not just DataTable.
 */
@Component({
  selector: 'app-export-button',
  standalone: true,
  imports: [ButtonDirective, IconComponent],
  templateUrl: './export-button.component.html',
  styleUrl: './export-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportButtonComponent<T> {
  private readonly pdfStrategy = inject(EXPORT_PDF_STRATEGY, { optional: true });
  private readonly toast = inject(ToastService);

  readonly rows = input.required<T[]>();
  readonly columns = input.required<ExportColumn<T>[]>();
  readonly format = input<ExportFormat>('csv');
  readonly filename = input('export');
  readonly label = input('Export');

  runExport(): void {
    const rows = this.rows();
    if (!rows.length) {
      return;
    }
    if (this.format() === 'csv') {
      this.downloadCsv(rows);
      return;
    }
    if (!this.pdfStrategy) {
      this.toast.error('PDF export is not available for this screen yet.');
      return;
    }
    this.pdfStrategy.export(rows, this.columns(), this.filename());
  }

  private downloadCsv(rows: T[]): void {
    const csv = buildCsv(rows, this.columns());
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.filename()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
