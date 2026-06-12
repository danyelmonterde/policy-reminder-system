import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../navbar/navbar';
import { AuthService } from '../../core/services/auth.service';

interface Policy {
  id: number;
  policyNumber: string;
  policyName: string;
  clientUsername: string;
  clientEmail: string;
  premiumAmount: number;
  coverageAmount: number;
  startDate: string;
  dueDate: string;
  status: string;
}

interface ReminderLog {
  id: number;
  policyNumber: string;
  policyName: string;
  clientEmail: string;
  sentAt: string;
  status: string;
  message: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName: string;
  phoneNumber: string;
  enabled: boolean;
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar],
  template: `
    <div class="main-wrapper">
      <app-navbar></app-navbar>
      
      <main class="content-container">
        <!-- Welcome Card -->
        <div class="welcome-card glass-panel">
          <div class="welcome-text">
            <h1>Welcome Back, {{ profile?.fullName || 'Client' }}</h1>
            <p>Track your active coverages and renewal deadlines below.</p>
          </div>
          <div class="contact-info-pill">
            <span class="material-icons">contact_mail</span>
            <span>{{ profile?.email }}</span>
          </div>
        </div>

        <!-- Dashboard Layout Tabs -->
        <div class="tab-header glass-panel">
          <button class="tab-btn" [class.active]="activeTab === 'policies'" (click)="activeTab = 'policies'">
            <span class="material-icons">policy</span> Active Policies
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'history'" (click)="activeTab = 'history'">
            <span class="material-icons">history</span> Reminder History
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'profile'" (click)="activeTab = 'profile'">
            <span class="material-icons">person</span> Profile Settings
          </button>
        </div>

        <!-- Tab Content: Policies -->
        <div class="tab-content" *ngIf="activeTab === 'policies'">
          <div class="section-title-row">
            <h2>Your Coverages</h2>
            <span class="badge-count">{{ policies.length }} Active</span>
          </div>

          <div class="policies-grid" *ngIf="policies.length > 0; else noPolicies">
            <div class="policy-card glass-panel" *ngFor="let policy of policies" [class.due-urgent]="getDaysUntilDue(policy.dueDate) <= 7" [class.due-upcoming]="getDaysUntilDue(policy.dueDate) <= 30 && getDaysUntilDue(policy.dueDate) > 7">
              <div class="policy-card-header">
                <div>
                  <h3>{{ policy.policyName }}</h3>
                  <span class="policy-num">{{ policy.policyNumber }}</span>
                </div>
                <span class="status-badge" [ngClass]="'status-badge-' + policy.status.toLowerCase()">
                  {{ policy.status }}
                </span>
              </div>

              <div class="policy-metrics">
                <div class="metric">
                  <span class="metric-label">Premium</span>
                  <span class="metric-value font-title">\${{ policy.premiumAmount | number:'1.2-2' }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Coverage Limit</span>
                  <span class="metric-value font-title">\${{ policy.coverageAmount | number:'1.2-2' }}</span>
                </div>
              </div>

              <div class="policy-dates">
                <div class="date-row">
                  <span class="material-icons date-icon">event_note</span>
                  <span>Starts: {{ policy.startDate | date }}</span>
                </div>
                <div class="date-row">
                  <span class="material-icons date-icon">alarm</span>
                  <span>Due Date: <strong class="due-date-text">{{ policy.dueDate | date }}</strong></span>
                </div>
              </div>

              <!-- Alerts countdown -->
              <div class="due-alert-banner" *ngIf="getDaysUntilDue(policy.dueDate) <= 30">
                <span class="material-icons">warning_amber</span>
                <span>
                  {{ getDaysUntilDue(policy.dueDate) === 0 ? 'Expires TODAY' : 
                     getDaysUntilDue(policy.dueDate) < 0 ? 'Overdue by ' + Math.abs(getDaysUntilDue(policy.dueDate)) + ' days' :
                     'Renewal due in ' + getDaysUntilDue(policy.dueDate) + ' days' }}
                </span>
              </div>
            </div>
          </div>
          <ng-template #noPolicies>
            <div class="empty-state glass-panel">
              <span class="material-icons empty-icon">folder_open</span>
              <p>You do not have any registered policies active at the moment.</p>
            </div>
          </ng-template>
        </div>

        <!-- Tab Content: History -->
        <div class="tab-content" *ngIf="activeTab === 'history'">
          <div class="section-title-row">
            <h2>Renewal Alerts Sent</h2>
          </div>

          <div class="history-list glass-panel" *ngIf="logs.length > 0; else noLogs">
            <div class="history-item" *ngFor="let log of logs">
              <div class="history-meta">
                <span class="material-icons sent-icon">notifications_active</span>
                <div class="history-info">
                  <h4>{{ log.policyName }}</h4>
                  <span class="history-time">{{ log.sentAt | date:'medium' }}</span>
                </div>
              </div>
              <p class="history-msg">{{ log.message }}</p>
              <span class="status-badge status-badge-renewed">{{ log.status }}</span>
            </div>
          </div>
          <ng-template #noLogs>
            <div class="empty-state glass-panel">
              <span class="material-icons empty-icon">history_toggle_off</span>
              <p>No historical reminder logs found for your policies.</p>
            </div>
          </ng-template>
        </div>

        <!-- Tab Content: Profile -->
        <div class="tab-content" *ngIf="activeTab === 'profile'">
          <div class="section-title-row">
            <h2>Update Profile Details</h2>
          </div>

          <div class="profile-card glass-panel">
            <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
              <div class="grid-cols-2">
                <div class="glass-input-group">
                  <label for="fullName">Full Name</label>
                  <input id="fullName" type="text" class="glass-input" formControlName="fullName">
                  <div class="error-msg" *ngIf="profileForm.get('fullName')?.invalid && profileForm.get('fullName')?.touched">
                    Full Name is required
                  </div>
                </div>

                <div class="glass-input-group">
                  <label for="phoneNumber">Phone Number</label>
                  <input id="phoneNumber" type="text" class="glass-input" formControlName="phoneNumber">
                </div>
              </div>

              <div class="grid-cols-2">
                <div class="glass-input-group">
                  <label for="email">Email Address</label>
                  <input id="email" type="email" class="glass-input" formControlName="email">
                  <div class="error-msg" *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched">
                    Valid email address is required
                  </div>
                </div>

                <div class="glass-input-group">
                  <label for="newPassword">New Password (leave blank to keep current)</label>
                  <input id="newPassword" type="password" class="glass-input" formControlName="password" placeholder="Enter new password">
                </div>
              </div>

              <div class="form-actions-row">
                <button type="submit" class="glass-btn glass-btn-primary" [disabled]="profileForm.invalid || isSaving">
                  <span class="material-icons">save</span>
                  {{ isSaving ? 'Saving Changes...' : 'Save Profile' }}
                </button>
              </div>

              <div class="alert-success" *ngIf="profileSuccess">
                <span class="material-icons">check_circle</span>
                <span>Profile updated successfully!</span>
              </div>
              <div class="alert-error" *ngIf="profileError">
                <span class="material-icons">error</span>
                <span>{{ profileError }}</span>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .welcome-card {
      padding: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%), var(--card-bg-glass);
    }
    
    .welcome-text h1 {
      font-family: var(--font-family-title);
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    
    .welcome-text p {
      color: var(--text-secondary);
      font-size: 14px;
    }
    
    .contact-info-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: 13px;
      color: var(--text-secondary);
    }
    
    .tab-header {
      display: flex;
      gap: 8px;
      padding: 8px;
      margin-bottom: 30px;
    }
    
    .tab-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      padding: 12px;
      font-family: var(--font-family-title);
      font-weight: 600;
      font-size: 14px;
      border-radius: 8px;
      cursor: pointer;
      transition: var(--transition-smooth);
    }
    
    .tab-btn:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.02);
    }
    
    .tab-btn.active {
      color: var(--text-primary);
      background: rgba(99, 102, 241, 0.2);
      box-shadow: inset 0 0 10px rgba(99, 102, 241, 0.1);
    }
    
    .section-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .section-title-row h2 {
      font-family: var(--font-family-title);
      font-size: 20px;
      font-weight: 700;
    }
    
    .badge-count {
      font-size: 11px;
      background: rgba(16, 185, 129, 0.15);
      color: var(--color-success);
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 600;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    
    .policies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }
    
    .policy-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .policy-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .policy-card-header h3 {
      font-family: var(--font-family-title);
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 2px;
    }
    
    .policy-num {
      color: var(--text-muted);
      font-size: 12px;
      font-family: monospace;
    }
    
    .policy-metrics {
      display: flex;
      gap: 20px;
      padding: 12px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .metric {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .metric-label {
      font-size: 11px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    
    .metric-value {
      font-size: 18px;
      font-weight: 700;
    }
    
    .font-title {
      font-family: var(--font-family-title);
    }
    
    .policy-dates {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 13px;
      color: var(--text-secondary);
    }
    
    .date-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .date-icon {
      font-size: 16px;
      color: var(--text-muted);
    }
    
    .due-date-text {
      color: var(--text-primary);
    }
    
    /* Due warning decorations */
    .policy-card.due-upcoming {
      border-left: 4px solid var(--color-warning);
    }
    .policy-card.due-urgent {
      border-left: 4px solid var(--color-danger);
    }
    
    .due-alert-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
    }
    
    .policy-card.due-upcoming .due-alert-banner {
      background: var(--color-warning-bg);
      color: var(--color-warning);
    }
    .policy-card.due-urgent .due-alert-banner {
      background: var(--color-danger-bg);
      color: var(--color-danger);
    }
    
    .empty-state {
      padding: 60px;
      text-align: center;
      color: var(--text-secondary);
    }
    
    .empty-icon {
      font-size: 48px;
      color: var(--text-muted);
      margin-bottom: 12px;
    }
    
    .history-list {
      display: flex;
      flex-direction: column;
    }
    
    .history-item {
      padding: 16px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    
    .history-item:last-child {
      border-bottom: none;
    }
    
    .history-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }
    
    .sent-icon {
      color: var(--primary-color);
      font-size: 24px;
    }
    
    .history-info h4 {
      font-family: var(--font-family-title);
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 2px;
    }
    
    .history-time {
      font-size: 11px;
      color: var(--text-muted);
    }
    
    .history-msg {
      flex: 3;
      font-size: 13px;
      color: var(--text-secondary);
    }
    
    .profile-card {
      padding: 30px;
    }
    
    .form-actions-row {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
    }
    
    .error-msg {
      color: #fca5a5;
      font-size: 12px;
      margin-top: 4px;
    }
    
    .alert-success {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 8px;
      padding: 12px;
      margin-top: 16px;
      color: #d1fae5;
      font-size: 14px;
      font-weight: 500;
    }
    
    .alert-error {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      padding: 12px;
      margin-top: 16px;
      color: #fee2e2;
      font-size: 14px;
      font-weight: 500;
    }
  `]
})
export class ClientDashboard implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = window.location.hostname === 'localhost' && window.location.port === '4200'
    ? 'http://localhost:8080/api/client'
    : '/api/client';

  activeTab = 'policies';
  policies: Policy[] = [];
  logs: ReminderLog[] = [];
  profile: UserProfile | null = null;

  profileForm: FormGroup = this.fb.group({
    fullName: ['', Validators.required],
    phoneNumber: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['']
  });

  isSaving = false;
  profileSuccess = false;
  profileError: string | null = null;
  Math = Math;

  ngOnInit(): void {
    this.loadProfile();
    this.loadPolicies();
    this.loadLogs();
  }

  loadProfile(): void {
    this.http.get<UserProfile>(`${this.apiUrl}/profile`).subscribe({
      next: (prof) => {
        this.profile = prof;
        this.profileForm.patchValue({
          fullName: prof.fullName,
          phoneNumber: prof.phoneNumber,
          email: prof.email
        });
      }
    });
  }

  loadPolicies(): void {
    this.http.get<Policy[]>(`${this.apiUrl}/policies`).subscribe({
      next: (list) => {
        this.policies = list;
      }
    });
  }

  loadLogs(): void {
    this.http.get<ReminderLog[]>(`${this.apiUrl}/logs`).subscribe({
      next: (list) => {
        this.logs = list.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
      }
    });
  }

  getDaysUntilDue(dueDateStr: string): number {
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) return;

    this.isSaving = true;
    this.profileSuccess = false;
    this.profileError = null;

    const payload = { ...this.profileForm.value };
    if (!payload.password) {
      delete payload.password;
    }

    this.http.put<UserProfile>(`${this.apiUrl}/profile`, payload).subscribe({
      next: (updated) => {
        this.isSaving = false;
        this.profile = updated;
        this.profileSuccess = true;
        this.profileForm.patchValue({ password: '' });
      },
      error: (err) => {
        this.isSaving = false;
        this.profileError = err.error?.message || 'Error updating profile details.';
      }
    });
  }
}
