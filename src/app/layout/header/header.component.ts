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
import { LayoutConfigService } from '../../core/services/layout-config.service';
import { HeaderAppTile, HeaderLanguage } from '../../core/models/layout-config.model';
import { ThemeId } from '../../core/models/theme.model';
import { ToastService } from '../../shared/toast/toast.service';

/**
 * Fallback header content used before LayoutConfigService's config has
 * loaded — kept in sync with (and a 1:1 copy of) layout-config.json's
 * `header` section, same reasoning as theme.model.ts's DEFAULT_THEMES.
 */
const DEFAULT_SEARCH_TYPES = ['Customer Name', 'National ID', 'Passport', 'Phone', 'Case Number', 'T Code'];
const TCODE_SEARCH_TYPE = 'T Code';

const DEFAULT_APPS: HeaderAppTile[] = [
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

const DEFAULT_TENANTS = ['Prime Bank Ltd.', 'Northgate Finance', 'Meridian Trust Co.'];

const DEFAULT_LANGUAGES: HeaderLanguage[] = [
  { code: 'en', label: 'English' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ar', label: 'العربية' }
];

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
  private readonly layoutConfig = inject(LayoutConfigService);
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

  protected readonly searchTypes = computed(() => this.layoutConfig.header()?.searchTypes ?? DEFAULT_SEARCH_TYPES);
  protected readonly searchType = signal('Customer Name');
  protected readonly searchQuery = signal('');

  protected readonly isTCodeSearch = computed(() => this.searchType() === TCODE_SEARCH_TYPE);
  /** T-code datalist matches — mirrors the source POC's renderTCodeList(). */
  protected readonly tcodeOptions = computed<QuickNavItem[]>(() =>
    this.isTCodeSearch() ? this.quickNav.search(this.searchQuery()) : []
  );

  /** Below tablet, the global search is hidden behind a toggle instead of always inline — there's no room for it next to the hdr-pills. */
  protected readonly mobileSearchOpen = signal(false);

  toggleMobileSearch(): void {
    this.mobileSearchOpen.update((v) => !v);
  }

  protected readonly apps = computed(() => this.layoutConfig.header()?.apps ?? DEFAULT_APPS);
  protected readonly tenants = computed(() => this.layoutConfig.header()?.tenants ?? DEFAULT_TENANTS);
  protected readonly activeTenant = signal(this.tenants()[0]);

  protected readonly languages = computed<HeaderLanguage[]>(() => this.layoutConfig.header()?.languages ?? DEFAULT_LANGUAGES);

  runSearch(): void {
    // Desktop-only affordance: clicking search in the collapsed icon rail
    // just expands it to reveal the search field first. Skip this when the
    // mobile search overlay is what's actually open, or a phone with the
    // drawer closed would silently open the drawer instead of searching.
    if (!this.mobileSearchOpen() && !this.rail.expanded()) {
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
    this.mobileSearchOpen.set(false);
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
    this.mobileSearchOpen.set(false);

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
    const name = this.auth.currentUser()?.name;
    this.menu.close();
    this.auth.logout();
    this.breadcrumb.reset('Signed out');
    this.toast.info(name ? `Signed out — see you soon, ${name}.` : 'Signed out.');
    this.router.navigateByUrl('/login');
  }
}
