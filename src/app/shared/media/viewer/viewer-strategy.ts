import { InjectionToken, Type } from '@angular/core';

export interface ViewerSource {
  url: string;
  mimeType: string;
  name?: string;
}

/**
 * Decoupled by design, same pattern as ExportButton's `EXPORT_PDF_STRATEGY`
 * (COMPONENT_LIBRARY_PLAN.md §7/§14.1): Viewer never imports a PDF library
 * itself. A provided strategy is a component `Type`, rendered via
 * `NgComponentOutlet` with `source: ViewerSource` bound as its input —
 * swapping the PDF library later means providing a new component here, not
 * touching ViewerComponent. No provider exists yet in this app (same as
 * ExportButton's PDF path); Viewer falls back to an inline message + a plain
 * download link instead of a silently-broken preview.
 */
export const VIEWER_PDF_STRATEGY = new InjectionToken<Type<unknown>>('VIEWER_PDF_STRATEGY');
