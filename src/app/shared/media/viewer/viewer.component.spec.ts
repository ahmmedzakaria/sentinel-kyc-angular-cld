import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ViewerComponent } from './viewer.component';
import { VIEWER_PDF_STRATEGY, ViewerSource } from './viewer-strategy';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="stub-pdf-viewer">{{ source()?.name }}</div>`
})
class StubPdfStrategyComponent {
  readonly source = input<ViewerSource>();
}

const IMAGE_SOURCE: ViewerSource = { url: 'a.jpg', mimeType: 'image/jpeg', name: 'national-id.jpg' };
const PDF_SOURCE: ViewerSource = { url: 'b.pdf', mimeType: 'application/pdf', name: 'trade-license.pdf' };

describe('ViewerComponent', () => {
  // ModalComponent portals its content via CDK Overlay's GlobalPositionStrategy
  // to a global `.cdk-overlay-container` on <body> — not a DOM descendant of
  // fixture.nativeElement, same gotcha as AGENTS.md documents for dropdowns.
  it('renders ImagePreview for an image source', () => {
    const fixture = TestBed.createComponent(ViewerComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('source', IMAGE_SOURCE);
    fixture.detectChanges();

    expect(document.querySelector('app-image-preview')).toBeTruthy();
  });

  it('shows a fallback message + download link for a PDF with no strategy provided', () => {
    const fixture = TestBed.createComponent(ViewerComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('source', PDF_SOURCE);
    fixture.detectChanges();

    expect(document.querySelector('app-inline-alert')).toBeTruthy();
    const link: HTMLAnchorElement | null = document.querySelector('.download-link');
    expect(link?.getAttribute('href')).toBe('b.pdf');
    expect(document.querySelector('app-image-preview')).toBeFalsy();
  });

  it('renders the injected strategy component for a PDF when one is provided', () => {
    TestBed.overrideProvider(VIEWER_PDF_STRATEGY, { useValue: StubPdfStrategyComponent });

    const fixture = TestBed.createComponent(ViewerComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('source', PDF_SOURCE);
    fixture.detectChanges();

    const stub = document.querySelector('.stub-pdf-viewer');
    expect(stub).toBeTruthy();
    expect(stub?.textContent?.trim()).toBe('trade-license.pdf');
    expect(document.querySelector('app-inline-alert')).toBeFalsy();
  });
});
