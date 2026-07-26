import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { IconComponent } from '../../shared/icon/icon.component';
import { HeaderDropdownComponent } from './header-dropdown.component';
import { HeaderMenuService } from '../../core/services/header-menu.service';
import { RailStateService } from '../../core/services/rail-state.service';
import { ThemeService } from '../../core/services/theme.service';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';
import { AuthService } from '../../core/services/auth.service';
import { NavTreeStateService } from '../../core/services/nav-tree-state.service';
import { QuickNavItem, QuickNavService } from '../../core/services/quick-nav.service';
import { FavoriteNavService } from '../../core/services/favorite-nav.service';
import { ThemeId } from '../../core/models/theme.model';
import { ToastService } from '../../shared/toast/toast.service';

interface AppTile {
  name: string;
  icon: string;
}

const SSO_APPS: AppTile[] = [
  { name: 'Case Management', icon: 'folder' },
  { name: 'Document Vault', icon: 'document' },
  { name: 'Risk Analytics', icon: 'bar-chart' },
  { name: 'HR Portal', icon: 'users' },
  { name: 'Loan Origination', icon: 'percent' },
  { name: 'Audit Console', icon: 'search' },
  { name: 'Reporting Suite', icon: 'trend' },
  { name: 'Admin Portal', icon: 'gear' },
  { name: 'Helpdesk', icon: 'help' }
];

const SEARCH_TYPES = ['Customer Name', 'National ID', 'Passport', 'Phone', 'Case Number', 'T Code'] as const;
const TCODE_SEARCH_TYPE: (typeof SEARCH_TYPES)[number] = 'T Code';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, TranslocoModule, UpperCasePipe, IconComponent, HeaderDropdownComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  protected readonly rail = inject(RailStateService);
  protected readonly menu = inject(HeaderMenuService);
  protected readonly theme = inject(ThemeService);
  protected readonly auth = inject(AuthService);
  protected readonly quickNav = inject(QuickNavService);
  protected readonly favoriteNav = inject(FavoriteNavService);
  private readonly tree = inject(NavTreeStateService);
  private readonly breadcrumb = inject(BreadcrumbService);
  private readonly transloco = inject(TranslocoService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly initials = computed(() => {
    const name = this.auth.currentUser()?.name ?? '';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  });

  protected readonly searchTypes = SEARCH_TYPES;
  protected readonly searchType = signal<(typeof SEARCH_TYPES)[number]>('Customer Name');
  protected readonly searchQuery = signal('');

  protected readonly isTCodeSearch = computed(() => this.searchType() === TCODE_SEARCH_TYPE);
  /** T-code datalist matches — mirrors the source POC's renderTCodeList(). */
  protected readonly tcodeOptions = computed<QuickNavItem[]>(() =>
    this.isTCodeSearch() ? this.quickNav.search(this.searchQuery()) : []
  );

  protected readonly apps = SSO_APPS;
  protected readonly tenants = ['Prime Bank Ltd.', 'Northgate Finance', 'Meridian Trust Co.'];
  protected readonly activeTenant = signal(this.tenants[0]);

  protected readonly languages: { code: string; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'ar', label: 'العربية' }
  ];

  runSearch(): void {
    if (!this.rail.expanded()) {
      this.rail.toggle();
      return;
    }
    if (this.isTCodeSearch()) {
      this.runTCodeSearch();
      return;
    }
    const query = this.searchQuery().trim();
    if (!query) {
      return;
    }
    this.breadcrumb.set(['Search'], `Results for "${query}" — ${this.searchType()}`);
    // Wire to a real search service/route here — the POC only simulated this.
    console.info('Searching', this.searchType(), query);
  }

  private runTCodeSearch(): void {
    const code = this.searchQuery().trim();
    const item = this.quickNav.findByCode(code);
    if (!item) {
      this.toast.error('Invalid T-code.');
      return;
    }
    this.goToQuickNavItem(item);
  }

  /** Jumps straight to a feature leaf — shared by T-code search and the Favorites dropdown. */
  goToQuickNavItem(item: QuickNavItem): void {
    this.tree.setActivePath(item.path);
    this.breadcrumb.set(item.labels.slice(0, -1), item.label);
    this.searchQuery.set(item.code);
    this.menu.close();

    const feature = this.tree.getNode(item.path);
    if (feature?.route) {
      this.router.navigateByUrl('/' + feature.route);
    }
  }

  selectTenant(name: string): void {
    this.activeTenant.set(name);
    this.menu.close();
  }

  selectLanguage(code: string): void {
    this.transloco.setActiveLang(code);
    this.menu.close();
  }

  selectTheme(id: ThemeId): void {
    this.theme.select(id);
    this.menu.close();
  }

  launchApp(name: string): void {
    this.menu.close();
    this.breadcrumb.set(['Apps'], `Redirecting to ${name} via SSO…`);
    // Real implementation redirects through the SSO broker with a signed token.
    console.info('Redirecting to', name, 'via SSO');
  }

  logout(): void {
    if (confirm('Log out of Sentinel KYC?')) {
      const name = this.auth.currentUser()?.name;
      this.auth.logout();
      this.breadcrumb.reset('Signed out');
      this.toast.info(name ? `Signed out — see you soon, ${name}.` : 'Signed out.');
      this.router.navigateByUrl('/login');
    }
  }
}
