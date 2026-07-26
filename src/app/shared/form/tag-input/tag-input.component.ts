import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../../icon/icon.component';
import { BaseValueAccessor } from '../base-value-accessor';

const MAX_SUGGESTIONS = 8;

/**
 * Unlike Dropdown/MultiSelect, this doesn't use CDK Overlay — its suggestion
 * list is a small panel directly under the input with no need for
 * viewport-aware flipping, so a plain absolutely-positioned div is simpler
 * and sufficient (see COMPONENT_LIBRARY_PLAN.md notes on this component).
 */
@Component({
  selector: 'app-tag-input',
  standalone: true,
  imports: [IconComponent],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: TagInputComponent, multi: true }],
  templateUrl: './tag-input.component.html',
  styleUrl: './tag-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagInputComponent extends BaseValueAccessor<string[]> {
  readonly label = input<string>('');
  readonly placeholder = input<string>('Add a tag…');
  readonly suggestions = input<string[]>([]);
  readonly errorMessage = input<string | null>(null);

  protected readonly draft = signal('');
  protected readonly tags = computed(() => this.value() ?? []);

  protected readonly filteredSuggestions = computed(() => {
    const q = this.draft().trim().toLowerCase();
    if (!q) {
      return [];
    }
    const current = this.tags();
    return this.suggestions()
      .filter((s) => s.toLowerCase().includes(q) && !current.includes(s))
      .slice(0, MAX_SUGGESTIONS);
  });

  onDraftInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.commitDraft();
      return;
    }
    if (event.key === 'Backspace' && !this.draft() && this.tags().length) {
      this.removeTag(this.tags().length - 1);
    }
  }

  commitDraft(): void {
    const tag = this.draft().trim().replace(/,$/, '');
    this.draft.set('');
    if (!tag || this.tags().includes(tag)) {
      return;
    }
    this.emitValue([...this.tags(), tag]);
  }

  addSuggestion(suggestion: string): void {
    this.draft.set('');
    if (this.tags().includes(suggestion)) {
      return;
    }
    this.emitValue([...this.tags(), suggestion]);
  }

  removeTag(index: number): void {
    const next = [...this.tags()];
    next.splice(index, 1);
    this.emitValue(next);
  }
}
