import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExportButtonComponent } from './export-button.component';
import { EXPORT_PDF_STRATEGY, ExportColumn, PdfExportStrategy } from './export-strategy';
import { ToastService } from '../../toast/toast.service';

interface Row {
  name: string;
}

const COLUMNS: ExportColumn<Row>[] = [{ key: 'name', header: 'Name' }];

describe('ExportButtonComponent', () => {
  beforeEach(() => {
    // jsdom doesn't implement the Blob URL API — stub it so downloadCsv() doesn't throw.
    window.URL.createObjectURL = vi.fn(() => 'blob:mock');
    window.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('disables the button when rows is empty', () => {
    const fixture = TestBed.createComponent<ExportButtonComponent<Row>>(ExportButtonComponent);
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('enables the button when rows has data', () => {
    const fixture = TestBed.createComponent<ExportButtonComponent<Row>>(ExportButtonComponent);
    fixture.componentRef.setInput('rows', [{ name: 'Amina' }]);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it('triggers a CSV blob download when format is csv (the default)', () => {
    const fixture = TestBed.createComponent<ExportButtonComponent<Row>>(ExportButtonComponent);
    fixture.componentRef.setInput('rows', [{ name: 'Amina' }]);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.detectChanges();

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    fixture.componentInstance.runExport();

    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('does nothing when runExport() is called with no rows', () => {
    const fixture = TestBed.createComponent<ExportButtonComponent<Row>>(ExportButtonComponent);
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.detectChanges();

    fixture.componentInstance.runExport();
    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('shows an error toast for PDF format when no EXPORT_PDF_STRATEGY is provided', () => {
    const fixture = TestBed.createComponent<ExportButtonComponent<Row>>(ExportButtonComponent);
    fixture.componentRef.setInput('rows', [{ name: 'Amina' }]);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('format', 'pdf');
    fixture.detectChanges();

    const toast = TestBed.inject(ToastService);
    const errorSpy = vi.spyOn(toast, 'error');
    fixture.componentInstance.runExport();

    expect(errorSpy).toHaveBeenCalledWith('PDF export is not available for this screen yet.');
  });

  it('delegates to the injected EXPORT_PDF_STRATEGY when one is provided', () => {
    const strategy: PdfExportStrategy = { export: vi.fn() };
    TestBed.overrideProvider(EXPORT_PDF_STRATEGY, { useValue: strategy });

    const fixture = TestBed.createComponent<ExportButtonComponent<Row>>(ExportButtonComponent);
    fixture.componentRef.setInput('rows', [{ name: 'Amina' }]);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('format', 'pdf');
    fixture.componentRef.setInput('filename', 'people');
    fixture.detectChanges();

    fixture.componentInstance.runExport();
    expect(strategy.export).toHaveBeenCalledWith([{ name: 'Amina' }], COLUMNS, 'people');
  });
});
