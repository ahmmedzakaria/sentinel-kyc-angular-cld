import { ChangeDetectionStrategy, Component, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PillComponent, PillTone } from '../../../shared/feedback/pill/pill.component';
import { StatusBadgeComponent, StatusTone } from '../../../shared/feedback/status-badge/status-badge.component';
import { ButtonDirective } from '../../../shared/form/button/button.directive';
import { formatDate } from '../../../shared/form/date-utils';
import { ColumnDef, DataTableComponent, SortState } from '../../../shared/data/data-table/data-table.component';
import { FilterBarComponent } from '../../../shared/data/filter-bar/filter-bar.component';
import { SearchToolbarEvent, SearchTypeOption } from '../../../shared/data/search-toolbar/search-toolbar.component';
import { ExportButtonComponent } from '../../../shared/data/export-button/export-button.component';
import { ExportColumn } from '../../../shared/data/export-button/export-strategy';
import { KycCaseService } from '../kyc-case.service';
import { KycCase, RiskLevel, displayName } from '../kyc-case.model';

const SEARCH_TYPES: SearchTypeOption[] = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' }
];

const RISK_TONE: Record<RiskLevel, PillTone> = {
  low: 'success',
  medium: 'amber',
  high: 'red'
};

const STATUS_TONE: Record<KycCase['status'], StatusTone> = {
  draft: 'draft',
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  escalated: 'escalated'
};

const PAGE_SIZE = 10;

@Component({
  selector: 'app-kyc-list',
  standalone: true,
  imports: [ButtonDirective, DataTableComponent, FilterBarComponent, ExportButtonComponent, PillComponent, StatusBadgeComponent],
  templateUrl: './kyc-list.component.html',
  styleUrl: './kyc-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KycListComponent {
  private readonly kycCaseService = inject(KycCaseService);
  private readonly router = inject(Router);

  protected readonly searchTypes = SEARCH_TYPES;
  protected readonly pageSize = PAGE_SIZE;
  protected readonly displayName = displayName;

  protected riskTone(risk: RiskLevel): PillTone {
    return RISK_TONE[risk];
  }

  protected statusTone(status: KycCase['status']): StatusTone {
    return STATUS_TONE[status];
  }

  protected formatCreated(kycCase: KycCase): string {
    return formatDate(new Date(kycCase.createdAt));
  }

  private readonly nameCellTpl = viewChild<TemplateRef<{ $implicit: KycCase }>>('nameCell');
  private readonly entityCellTpl = viewChild<TemplateRef<{ $implicit: KycCase }>>('entityCell');
  private readonly riskCellTpl = viewChild<TemplateRef<{ $implicit: KycCase }>>('riskCell');
  private readonly statusCellTpl = viewChild<TemplateRef<{ $implicit: KycCase }>>('statusCell');
  private readonly createdCellTpl = viewChild<TemplateRef<{ $implicit: KycCase }>>('createdCell');
  private readonly actionsCellTpl = viewChild<TemplateRef<{ $implicit: KycCase }>>('actionsCell');

  protected readonly columns = computed<ColumnDef<KycCase>[]>(() => [
    { key: 'name', header: 'Name', cellTemplate: this.nameCellTpl() },
    { key: 'entityType', header: 'Entity Type', cellTemplate: this.entityCellTpl() },
    { key: 'riskLevel', header: 'Risk', cellTemplate: this.riskCellTpl() },
    { key: 'status', header: 'Status', cellTemplate: this.statusCellTpl() },
    { key: 'createdAt', header: 'Created', sortable: true, cellTemplate: this.createdCellTpl() },
    { key: 'actions', header: '', align: 'end', cellTemplate: this.actionsCellTpl() }
  ]);

  protected readonly exportColumns: ExportColumn<KycCase>[] = [
    { key: 'entityType', header: 'Entity Type' },
    { key: 'id', header: 'Name', format: (_value, row) => displayName(row) },
    { key: 'email', header: 'Email' },
    { key: 'mobile', header: 'Mobile' },
    { key: 'riskLevel', header: 'Risk' },
    { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Created', format: (value) => formatDate(new Date(value as string)) }
  ];

  private readonly searchType = signal<string | null>(null);
  private readonly searchQuery = signal('');
  protected readonly sort = signal<SortState | null>(null);
  protected readonly page = signal(1);

  private readonly filtered = computed(() => {
    const type = this.searchType();
    const query = this.searchQuery().trim().toLowerCase();
    const all = this.kycCaseService.list();
    if (!query) {
      return all;
    }
    return all.filter((c) => {
      if (type === 'email') {
        return c.email.toLowerCase().includes(query);
      }
      return displayName(c).toLowerCase().includes(query);
    });
  });

  private readonly sorted = computed(() => {
    const sort = this.sort();
    if (!sort || sort.direction === 'none') {
      return this.filtered();
    }
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...this.filtered()].sort((a, b) => {
      const av = String(a[sort.key as keyof KycCase] ?? '');
      const bv = String(b[sort.key as keyof KycCase] ?? '');
      return av.localeCompare(bv) * dir;
    });
  });

  protected readonly total = computed(() => this.sorted().length);

  protected readonly pageRows = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.sorted().slice(start, start + this.pageSize);
  });

  onSearch(event: SearchToolbarEvent): void {
    this.searchType.set(event.type);
    this.searchQuery.set(event.query);
    this.page.set(1);
  }

  onSortChange(sort: SortState): void {
    this.sort.set(sort);
  }

  onPageChange(page: number): void {
    this.page.set(page);
  }

  openCreate(): void {
    this.router.navigateByUrl('/kyc/new');
  }

  openDetail(kycCase: KycCase): void {
    this.router.navigateByUrl(`/kyc/${kycCase.id}`);
  }

  openEdit(kycCase: KycCase, event: Event): void {
    event.stopPropagation();
    this.router.navigateByUrl(`/kyc/${kycCase.id}/edit`);
  }
}
