import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { BannerComponent } from './banner.component';

describe('BannerComponent', () => {
  it('does not render a close button by default', () => {
    const fixture = TestBed.createComponent(BannerComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.close')).toBeNull();
  });

  it('renders a close button and emits dismissed when dismissible', () => {
    const fixture = TestBed.createComponent(BannerComponent);
    fixture.componentRef.setInput('dismissible', true);
    fixture.detectChanges();

    let dismissed = false;
    fixture.componentInstance.dismissed.subscribe(() => (dismissed = true));

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.close');
    expect(button).not.toBeNull();
    button.click();

    expect(dismissed).toBe(true);
  });
});
