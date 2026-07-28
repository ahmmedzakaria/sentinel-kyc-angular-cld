import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ImagePreviewComponent } from './image-preview.component';

describe('ImagePreviewComponent', () => {
  it('a single-image src is not treated as a gallery', () => {
    const fixture = TestBed.createComponent(ImagePreviewComponent);
    fixture.componentRef.setInput('src', 'a.jpg');
    fixture.detectChanges();

    expect(fixture.componentInstance['isGallery']()).toBe(false);
    expect(fixture.nativeElement.querySelector('.thumbs')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.nav-btn')).toBeFalsy();
  });

  it('a multi-image src renders gallery chrome starting at the first image', () => {
    const fixture = TestBed.createComponent(ImagePreviewComponent);
    fixture.componentRef.setInput('src', ['a.jpg', 'b.jpg', 'c.jpg']);
    fixture.detectChanges();

    expect(fixture.componentInstance['isGallery']()).toBe(true);
    expect(fixture.componentInstance['activeSrc']()).toBe('a.jpg');
    expect(fixture.nativeElement.querySelectorAll('.thumb').length).toBe(3);
  });

  it('next()/prev() wrap around at the ends', () => {
    const fixture = TestBed.createComponent(ImagePreviewComponent);
    fixture.componentRef.setInput('src', ['a.jpg', 'b.jpg', 'c.jpg']);
    fixture.detectChanges();

    fixture.componentInstance.prev(); // wraps from 0 to the last image
    expect(fixture.componentInstance['activeSrc']()).toBe('c.jpg');

    fixture.componentInstance.next();
    fixture.componentInstance.next();
    expect(fixture.componentInstance['activeSrc']()).toBe('b.jpg');
  });

  it('selectImage() jumps directly to the given index', () => {
    const fixture = TestBed.createComponent(ImagePreviewComponent);
    fixture.componentRef.setInput('src', ['a.jpg', 'b.jpg', 'c.jpg']);
    fixture.detectChanges();

    fixture.componentInstance.selectImage(2);
    expect(fixture.componentInstance['activeSrc']()).toBe('c.jpg');
  });
});
