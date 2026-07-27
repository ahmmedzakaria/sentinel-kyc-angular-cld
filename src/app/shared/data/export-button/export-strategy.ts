import { InjectionToken } from '@angular/core';

export interface ExportColumn<T> {
  key: keyof T & string;
  header: string;
  /** Formats a cell's raw value for export — defaults to `String(value)` (empty string for null/undefined). */
  format?: (value: T[keyof T], row: T) => string;
}

/**
 * Decoupled by design (COMPONENT_LIBRARY_PLAN.md §7/§14.1): ExportButton
 * never imports a PDF library directly. Swapping the PDF implementation
 * later means providing a new `EXPORT_PDF_STRATEGY`, not touching this
 * component. CSV export has no such dependency, so it's built in.
 */
export interface PdfExportStrategy {
  export<T>(rows: T[], columns: ExportColumn<T>[], filename: string): void;
}

export const EXPORT_PDF_STRATEGY = new InjectionToken<PdfExportStrategy>('EXPORT_PDF_STRATEGY');
