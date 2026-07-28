import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DocumentListComponent, DocumentListItem } from './document-list.component';

const DOCS: DocumentListItem[] = [
  { id: 1, name: 'national-id.jpg', status: 'approved', thumbnail: 'data:image/png;base64,abc' },
  { id: 2, name: 'address-proof.pdf', status: 'pending' }
];

function create(removable = false) {
  const fixture = TestBed.createComponent(DocumentListComponent);
  fixture.componentRef.setInput('documents', DOCS);
  fixture.componentRef.setInput('removable', removable);
  fixture.detectChanges();
  return fixture;
}

describe('DocumentListComponent', () => {
  it('renders one row per document', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelectorAll('.document-item').length).toBe(2);
  });

  it('emits itemClick with the clicked document when its row is clicked', () => {
    const fixture = create();
    const emitted: DocumentListItem[] = [];
    fixture.componentInstance.itemClick.subscribe((d) => emitted.push(d));

    fixture.nativeElement.querySelector('.doc-row').click();
    expect(emitted).toEqual([DOCS[0]]);
  });

  it('does not render a remove button when removable is false', () => {
    const fixture = create(false);
    expect(fixture.nativeElement.querySelector('.remove-btn')).toBeFalsy();
  });

  it('renders a remove button per row and emits itemRemove when removable is true', () => {
    const fixture = create(true);
    const buttons = fixture.nativeElement.querySelectorAll('.remove-btn');
    expect(buttons.length).toBe(2);

    const emitted: DocumentListItem[] = [];
    fixture.componentInstance.itemRemove.subscribe((d) => emitted.push(d));
    buttons[1].click();

    expect(emitted).toEqual([DOCS[1]]);
  });
});
