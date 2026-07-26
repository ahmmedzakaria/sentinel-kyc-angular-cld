import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StatusBadgeComponent } from '../../shared/feedback/status-badge/status-badge.component';

interface CustomerRecord {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'risk';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatusBadgeComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  protected readonly records: CustomerRecord[] = [
    { id: 'K-10441', name: 'John Ferreira', status: 'pending' },
    { id: 'K-10439', name: 'Maria Chen', status: 'approved' },
    { id: 'K-10432', name: 'Ahsan Karim', status: 'risk' }
  ];
}
