import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { TagInputComponent } from './tag-input.component';

describe('TagInputComponent', () => {
  it('Enter commits the draft as a new tag and clears the draft', () => {
    const fixture = TestBed.createComponent(TagInputComponent);
    fixture.detectChanges();
    let emitted: string[] | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.draft.set('urgent');
    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(emitted).toEqual(['urgent']);
    expect(fixture.componentInstance.draft()).toBe('');
  });

  it('comma also commits the draft', () => {
    const fixture = TestBed.createComponent(TagInputComponent);
    fixture.detectChanges();
    let emitted: string[] | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.draft.set('vip');
    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: ',' }));

    expect(emitted).toEqual(['vip']);
  });

  it('does not add a duplicate tag', () => {
    const fixture = TestBed.createComponent(TagInputComponent);
    fixture.componentInstance.writeValue(['urgent']);
    fixture.detectChanges();
    let emitted: string[] | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.draft.set('urgent');
    fixture.componentInstance.commitDraft();

    expect(emitted).toBeNull();
  });

  it('does not commit an empty/whitespace draft', () => {
    const fixture = TestBed.createComponent(TagInputComponent);
    fixture.detectChanges();
    let emitted: string[] | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.draft.set('   ');
    fixture.componentInstance.commitDraft();

    expect(emitted).toBeNull();
  });

  it('Backspace on an empty draft removes the last tag', () => {
    const fixture = TestBed.createComponent(TagInputComponent);
    fixture.componentInstance.writeValue(['one', 'two']);
    fixture.detectChanges();
    let emitted: string[] | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Backspace' }));

    expect(emitted).toEqual(['one']);
  });

  it('filteredSuggestions excludes already-added tags and caps at 8', () => {
    const fixture = TestBed.createComponent(TagInputComponent);
    fixture.componentRef.setInput(
      'suggestions',
      Array.from({ length: 12 }, (_, i) => `tag-${i}`)
    );
    fixture.componentInstance.writeValue(['tag-0']);
    fixture.detectChanges();

    fixture.componentInstance.draft.set('tag');
    expect(fixture.componentInstance.filteredSuggestions().length).toBe(8);
    expect(fixture.componentInstance.filteredSuggestions()).not.toContain('tag-0');
  });

  it('addSuggestion() adds the tag and clears the draft', () => {
    const fixture = TestBed.createComponent(TagInputComponent);
    fixture.detectChanges();
    let emitted: string[] | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));
    fixture.componentInstance.draft.set('u');

    fixture.componentInstance.addSuggestion('urgent');

    expect(emitted).toEqual(['urgent']);
    expect(fixture.componentInstance.draft()).toBe('');
  });
});
