import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { TabsComponent } from './tabs.component';
import { TabComponent } from './tab.component';

@Component({
  standalone: true,
  imports: [TabsComponent, TabComponent],
  template: `
    <app-tabs (activeIndexChange)="onChange($event)">
      <app-tab label="Profile">Profile content</app-tab>
      <app-tab label="KYC" [disabled]="true">KYC content</app-tab>
      <app-tab label="Documents">Documents content</app-tab>
    </app-tabs>
  `
})
class HostComponent {
  lastActive: number | null = null;
  onChange(i: number): void {
    this.lastActive = i;
  }
}

describe('TabsComponent', () => {
  it('activates the first tab by default and hides the rest', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const panels: HTMLElement[] = fixture.nativeElement.querySelectorAll('[role="tabpanel"]');
    expect(panels[0].style.display).not.toBe('none');
    expect(panels[1].style.display).toBe('none');
    expect(panels[2].style.display).toBe('none');
  });

  it('clicking a tab activates it and emits activeIndexChange', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll('[role="tab"]');
    buttons[2].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.lastActive).toBe(2);
    const panels: HTMLElement[] = fixture.nativeElement.querySelectorAll('[role="tabpanel"]');
    expect(panels[2].style.display).not.toBe('none');
  });

  it('clicking a disabled tab does nothing', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll('[role="tab"]');
    buttons[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.lastActive).toBeNull();
  });

  it('ArrowRight from the first tab skips the disabled tab and selects the third', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll('[role="tab"]');
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.lastActive).toBe(2);
  });

  it('End activates the last enabled tab', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll('[role="tab"]');
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.lastActive).toBe(2);
  });
});
