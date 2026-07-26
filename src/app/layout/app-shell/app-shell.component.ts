import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from '../header/header.component';
import { RailNavComponent } from '../rail-nav/rail-nav.component';
import { StatusBarComponent } from '../status-bar/status-bar.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';

/**
 * The full console chrome — only mounted for authenticated routes (see
 * app.routes.ts, where this wraps everything behind `authGuard`). Login and
 * registration render standalone, without any of this.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, RailNavComponent, StatusBarComponent, BreadcrumbComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellComponent {}
