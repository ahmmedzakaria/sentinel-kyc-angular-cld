import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonDirective } from '../../../shared/form/button/button.directive';
import { PillComponent, PillTone } from '../../../shared/feedback/pill/pill.component';
import { StatusBadgeComponent, StatusTone } from '../../../shared/feedback/status-badge/status-badge.component';
import { DocumentListComponent, DocumentListItem } from '../../../shared/media/document-list/document-list.component';
import { ViewerComponent, ViewerSource } from '../../../shared/media/viewer/viewer.component';
import { ActivityEntry, ActivityFeedComponent } from '../../../shared/workflow/activity-feed/activity-feed.component';
import { ApprovalActionsComponent, ApprovalDecision } from '../../../shared/workflow/approval-actions/approval-actions.component';
import { ToastService } from '../../../shared/toast/toast.service';
import { formatDate } from '../../../shared/form/date-utils';
import { KycCaseService } from '../kyc-case.service';
import { KycCase, RiskLevel, displayName } from '../kyc-case.model';

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

@Component({
  selector: 'app-kyc-detail',
  standalone: true,
  imports: [
    ButtonDirective,
    PillComponent,
    StatusBadgeComponent,
    DocumentListComponent,
    ViewerComponent,
    ActivityFeedComponent,
    ApprovalActionsComponent
  ],
  templateUrl: './kyc-detail.component.html',
  styleUrl: './kyc-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KycDetailComponent {
  private readonly kycCaseService = inject(KycCaseService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  /** Bound via `withComponentInputBinding()` from the `:id` route param. */
  readonly id = input.required<string>();

  protected readonly riskTone = RISK_TONE;
  protected readonly statusTone = STATUS_TONE;
  protected readonly displayName = displayName;
  protected readonly formatDate = formatDate;

  protected asDate(iso: string): Date {
    return new Date(iso);
  }

  /** Reads through the service's own signal via computed() so a decision or document upload updates this view immediately, not a route-resolved snapshot. */
  protected readonly kycCase = computed<KycCase | undefined>(() =>
    this.kycCaseService.list().find((c) => c.id === Number(this.id()))
  );

  protected readonly documentItems = computed<DocumentListItem[]>(() =>
    (this.kycCase()?.documents ?? []).map((doc) => ({
      id: doc.id,
      name: `${doc.type} — ${doc.fileName}`,
      status: 'approved',
      thumbnail: doc.mimeType.startsWith('image/') ? doc.url : undefined,
      mimeType: doc.mimeType
    }))
  );

  protected readonly activityEntries = computed<ActivityEntry[]>(() =>
    (this.kycCase()?.activity ?? []).map((entry) => ({ label: entry.label, actor: entry.actor, timestamp: entry.timestamp }))
  );

  protected readonly deciding = signal(false);
  protected readonly viewerOpen = signal(false);
  protected readonly viewerSource = signal<ViewerSource | null>(null);

  editCase(): void {
    this.router.navigateByUrl(`/kyc/${this.id()}/edit`);
  }

  openDocument(item: DocumentListItem): void {
    const doc = this.kycCase()?.documents.find((d) => d.id === item.id);
    if (!doc) {
      return;
    }
    this.viewerSource.set({ url: doc.url, mimeType: doc.mimeType, name: doc.fileName } satisfies ViewerSource);
    this.viewerOpen.set(true);
  }

  closeViewer(): void {
    this.viewerOpen.set(false);
  }

  decide(decision: ApprovalDecision): void {
    const current = this.kycCase();
    if (!current) {
      return;
    }
    this.deciding.set(true);
    this.kycCaseService.decide(current.id, decision).subscribe({
      next: (record) => {
        this.deciding.set(false);
        this.kycCaseService.commitDecide(record);
        this.toast.success(`Case ${decision.action === 'approve' ? 'approved' : decision.action + 'd'}.`);
      },
      error: () => {
        this.deciding.set(false);
        this.toast.error('Could not record the decision. Please try again.');
      }
    });
  }
}
