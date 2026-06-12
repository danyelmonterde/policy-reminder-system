import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../navbar/navbar';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName: string;
  phoneNumber: string;
  enabled: boolean;
}

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

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar],
  template: `
    <div class="main-wrapper">
      <app-navbar></app-navbar>

      <main class="content-container">
        <!-- Stats Summary row -->
        <div class="stats-row">
          <div class="stat-card glass-panel">
            <span class="material-icons stat-icon">people</span>
            <div class="stat-info">
              <span class="stat-val">{{ users.length }}</span>
              <span class="stat-label">Total Accounts</span>
            </div>
          </div>
          <div class="stat-card glass-panel">
            <span class="material-icons stat-icon">security</span>
            <div class="stat-info">
              <span class="stat-val">{{ policies.length }}</span>
              <span class="stat-label">Registered Policies</span>
            </div>
          </div>
          <div class="stat-card glass-panel">
            <span class="material-icons stat-icon">history</span>
            <div class="stat-info">
              <span class="stat-val">{{ logs.length }}</span>
              <span class="stat-label">Alerts Sent</span>
            </div>
          </div>
          <div class="stat-card glass-panel trigger-card" (click)="triggerReminders()">
            <span class="material-icons stat-icon trigger-icon" [class.spinning]="isTriggering">sync</span>
            <div class="stat-info">
              <span class="stat-val action-text">{{ isTriggering ? 'Running...' : 'Run Engine' }}</span>
              <span class="stat-label">Trigger Manual Check</span>
            </div>
          </div>
        </div>

        <!-- Layout Tabs -->
        <div class="tab-header glass-panel">
          <button class="tab-btn" [class.active]="activeTab === 'policies'" (click)="activeTab = 'policies'">
            <span class="material-icons">policy</span> Manage Policies
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">
            <span class="material-icons">people</span> Manage Accounts
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'logs'" (click)="activeTab = 'logs'">
            <span class="material-icons">history</span> System Logs
          </button>
        </div>

        <!-- Notification messages -->
        <div class="alert-success" *ngIf="successMsg">
          <span class="material-icons">check_circle</span>
          <span>{{ successMsg }}</span>
        </div>
        <div class="alert-error" *ngIf="errorMsg">
          <span class="material-icons">error</span>
          <span>{{ errorMsg }}</span>
        </div>

        <!-- Modals for CRUD Actions -->
        <!-- User Modal -->
        <div class="modal-overlay" *ngIf="showUserModal">
          <div class="modal-content glass-panel animate-zoom">
            <div class="modal-header">
              <h3>{{ editUserId ? 'Edit Account' : 'Create New Account' }}</h3>
              <button class="close-btn" (click)="showUserModal = false">
                <span class="material-icons">close</span>
              </button>
            </div>
            <form [formGroup]="userForm" (ngSubmit)="saveUser()">
              <div class="glass-input-group">
                <label for="usrname">Username</label>
                <input id="usrname" type="text" class="glass-input" formControlName="username" [attr.disabled]="editUserId ? true : null">
              </div>
              <div class="glass-input-group" *ngIf="!editUserId">
                <label for="usrpass">Password</label>
                <input id="usrpass" type="password" class="glass-input" formControlName="password">
              </div>
              <div class="glass-input-group">
                <label for="usrname_full">Full Name</label>
                <input id="usrname_full" type="text" class="glass-input" formControlName="fullName">
              </div>
              <div class="glass-input-group">
                <label for="usrmail">Email Address</label>
                <input id="usrmail" type="email" class="glass-input" formControlName="email">
              </div>
              <div class="glass-input-group">
                <label for="usrphone">Phone Number</label>
                <input id="usrphone" type="text" class="glass-input" formControlName="phoneNumber">
              </div>
              <div class="glass-input-group">
                <label for="usrrole">Account Role</label>
                <select id="usrrole" class="glass-input glass-select" formControlName="role">
                  <option value="ROLE_USER">Client (USER)</option>
                  <option value="ROLE_ADMIN">System Admin (ADMIN)</option>
                </select>
              </div>
              <div class="modal-actions">
                <button type="button" class="glass-btn glass-btn-secondary" (click)="showUserModal = false">Cancel</button>
                <button type="submit" class="glass-btn glass-btn-primary" [disabled]="userForm.invalid">Save</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Policy Modal -->
        <div class="modal-overlay" *ngIf="showPolicyModal">
          <div class="modal-content glass-panel animate-zoom">
            <div class="modal-header">
              <h3>{{ editPolicyId ? 'Edit Policy' : 'Register New Policy' }}</h3>
              <button class="close-btn" (click)="showPolicyModal = false">
                <span class="material-icons">close</span>
              </button>
            </div>
            <form [formGroup]="policyForm" (ngSubmit)="savePolicy()">
              <div class="glass-input-group">
                <label for="polnum">Policy Number</label>
                <input id="polnum" type="text" class="glass-input" formControlName="policyNumber" [attr.disabled]="editPolicyId ? true : null">
              </div>
              <div class="glass-input-group">
                <label for="polname">Policy Description</label>
                <input id="polname" type="text" class="glass-input" formControlName="policyName">
              </div>
              <div class="glass-input-group">
                <label for="polclient">Assign to Client (Username)</label>
                <select id="polclient" class="glass-input glass-select" formControlName="clientUsername">
                  <option value="">-- Choose Client --</option>
                  <option *ngFor="let client of clients" [value]="client.username">
                    {{ client.fullName }} ({{ client.username }})
                  </option>
                </select>
              </div>
              <div class="grid-cols-2">
                <div class="glass-input-group">
                  <label for="polpremium">Premium ($)</label>
                  <input id="polpremium" type="number" step="0.01" class="glass-input" formControlName="premiumAmount">
                </div>
                <div class="glass-input-group">
                  <label for="polcoverage">Coverage Limit ($)</label>
                  <input id="polcoverage" type="number" step="0.01" class="glass-input" formControlName="coverageAmount">
                </div>
              </div>
              <div class="grid-cols-2">
                <div class="glass-input-group">
                  <label for="polstart">Start Date</label>
                  <input id="polstart" type="date" class="glass-input" formControlName="startDate">
                </div>
                <div class="glass-input-group">
                  <label for="poldue">Due Date</label>
                  <input id="poldue" type="date" class="glass-input" formControlName="dueDate">
                </div>
              </div>
              <div class="glass-input-group" *ngIf="editPolicyId">
                <label for="polstatus">Coverage Status</label>
                <select id="polstatus" class="glass-input glass-select" formControlName="status">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="RENEWED">RENEWED</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>
              <div class="modal-actions">
                <button type="button" class="glass-btn glass-btn-secondary" (click)="showPolicyModal = false">Cancel</button>
                <button type="submit" class="glass-btn glass-btn-primary" [disabled]="policyForm.invalid">Save</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Main Tab Contents -->
        <!-- Tab: Policies -->
        <div class="tab-content" *ngIf="activeTab === 'policies'">
          <div class="section-title-row">
            <h2>System Insurance Policies</h2>
            <button class="glass-btn glass-btn-primary add-btn" (click)="openCreatePolicy()">
              <span class="material-icons">add</span> New Policy
            </button>
          </div>

          <div class="table-card glass-panel">
            <div class="custom-table-container">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Policy #</th>
                    <th>Coverage Name</th>
                    <th>Client (Email)</th>
                    <th>Premium</th>
                    <th>Coverage</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let pol of policies">
                    <td class="font-title font-semibold">{{ pol.policyNumber }}</td>
                    <td>{{ pol.policyName }}</td>
                    <td>
                      <div class="cell-client">
                        <span class="client-name">{{ pol.clientUsername }}</span>
                        <span class="client-mail">{{ pol.clientEmail }}</span>
                      </div>
                    </td>
                    <td>\${{ pol.premiumAmount | number:'1.2-2' }}</td>
                    <td>\${{ pol.coverageAmount | number:'1.2-2' }}</td>
                    <td class="font-semibold">{{ pol.dueDate | date }}</td>
                    <td>
                      <span class="status-badge" [ngClass]="'status-badge-' + pol.status.toLowerCase()">
                        {{ pol.status }}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="action-icon-btn edit" (click)="openEditPolicy(pol)">
                          <span class="material-icons">edit</span>
                        </button>
                        <button class="action-icon-btn delete" (click)="deletePolicy(pol.id)">
                          <span class="material-icons">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="policies.length === 0">
                    <td colspan="8" class="text-center font-semibold text-muted">No policies registered.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Tab: Users -->
        <div class="tab-content" *ngIf="activeTab === 'users'">
          <div class="section-title-row">
            <h2>User Account Directory</h2>
            <button class="glass-btn glass-btn-primary add-btn" (click)="openCreateUser()">
              <span class="material-icons">person_add</span> New Account
            </button>
          </div>

          <div class="table-card glass-panel">
            <div class="custom-table-container">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let usr of users">
                    <td class="font-title font-semibold">{{ usr.fullName }}</td>
                    <td>{{ usr.username }}</td>
                    <td>{{ usr.email }}</td>
                    <td>{{ usr.phoneNumber || '-' }}</td>
                    <td>
                      <span class="role-pill" [class.role-admin]="usr.role === 'ROLE_ADMIN'">
                        {{ usr.role === 'ROLE_ADMIN' ? 'Admin' : 'Client' }}
                      </span>
                    </td>
                    <td>
                      <span class="status-badge" [class.status-badge-active]="usr.enabled" [class.status-badge-expired]="!usr.enabled">
                        {{ usr.enabled ? 'Active' : 'Disabled' }}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="action-icon-btn edit" (click)="openEditUser(usr)">
                          <span class="material-icons">edit</span>
                        </button>
                        <button class="action-icon-btn status-toggle" [class.deactivate]="usr.enabled" (click)="toggleUserStatus(usr)">
                          <span class="material-icons">{{ usr.enabled ? 'block' : 'check_circle' }}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Tab: Logs -->
        <div class="tab-content" *ngIf="activeTab === 'logs'">
          <div class="section-title-row">
            <h2>Alert Transmission Logs</h2>
          </div>

          <div class="table-card glass-panel">
            <div class="custom-table-container">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Policy Info</th>
                    <th>Recipient</th>
                    <th>Message Details</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let log of logs">
                    <td class="log-time">{{ log.sentAt | date:'medium' }}</td>
                    <td>
                      <div class="cell-client">
                        <span class="font-semibold">{{ log.policyName }}</span>
                        <span class="client-mail">{{ log.policyNumber }}</span>
                      </div>
                    </td>
                    <td>{{ log.clientEmail }}</td>
                    <td class="log-message">{{ log.message }}</td>
                    <td>
                      <span class="status-badge status-badge-active" *ngIf="log.status === 'SUCCESS'">{{ log.status }}</span>
                      <span class="status-badge status-badge-expired" *ngIf="log.status !== 'SUCCESS'">{{ log.status }}</span>
                    </td>
                  </tr>
                  <tr *ngIf="logs.length === 0">
                    <td colspan="5" class="text-center font-semibold text-muted">No logs recorded in the system database.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    
    @media (max-width: 1024px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 600px) {
      .stats-row {
        grid-template-columns: 1fr;
      }
    }
    
    .stat-card {
      display: flex;
      align-items: center;
      padding: 24px;
      gap: 16px;
    }
    
    .stat-icon {
      font-size: 36px;
      color: var(--primary-color);
      background: rgba(99, 102, 241, 0.1);
      padding: 12px;
      border-radius: 12px;
    }
    
    .trigger-card {
      cursor: pointer;
      border: 1px dashed rgba(99, 102, 241, 0.3);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%), var(--card-bg-glass);
    }
    
    .trigger-card:hover {
      border-color: var(--primary-color);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%), var(--card-bg-glass);
    }
    
    .trigger-icon {
      color: var(--secondary-color);
      background: rgba(168, 85, 247, 0.1);
    }
    
    .spinning {
      animation: spin 1.2s linear infinite;
    }
    
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
    
    .action-text {
      color: var(--secondary-color);
    }
    
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    
    .stat-val {
      font-family: var(--font-family-title);
      font-size: 22px;
      font-weight: 700;
    }
    
    .stat-label {
      font-size: 12px;
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
    }
    
    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .section-title-row h2 {
      font-family: var(--font-family-title);
      font-size: 22px;
      font-weight: 700;
    }
    
    .add-btn {
      padding: 8px 16px;
      font-size: 14px;
    }
    
    .table-card {
      overflow: hidden;
      border-radius: var(--border-radius);
    }
    
    .cell-client {
      display: flex;
      flex-direction: column;
    }
    
    .client-name {
      font-weight: 600;
    }
    
    .client-mail {
      font-size: 11px;
      color: var(--text-muted);
    }
    
    .font-semibold {
      font-weight: 600;
    }
    
    .role-pill {
      font-size: 11px;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 2px 8px;
      border-radius: 4px;
      color: var(--text-secondary);
    }
    
    .role-pill.role-admin {
      background: rgba(168, 85, 247, 0.15);
      color: var(--secondary-color);
      border-color: rgba(168, 85, 247, 0.3);
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
    }
    
    .action-icon-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: var(--text-secondary);
      padding: 6px;
      border-radius: 6px;
      cursor: pointer;
      transition: var(--transition-smooth);
      display: inline-flex;
    }
    
    .action-icon-btn span {
      font-size: 18px;
    }
    
    .action-icon-btn.edit:hover {
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      border-color: rgba(99, 102, 241, 0.3);
    }
    
    .action-icon-btn.delete:hover {
      background: rgba(239, 68, 68, 0.15);
      color: #fca5a5;
      border-color: rgba(239, 68, 68, 0.3);
    }
    
    .action-icon-btn.status-toggle:hover {
      background: rgba(16, 185, 129, 0.15);
      color: #a7f3d0;
      border-color: rgba(16, 185, 129, 0.3);
    }
    
    .action-icon-btn.status-toggle.deactivate:hover {
      background: rgba(245, 158, 11, 0.15);
      color: #fde68a;
      border-color: rgba(245, 158, 11, 0.3);
    }
    
    .log-time {
      font-family: monospace;
      color: var(--text-secondary);
      font-size: 13px;
    }
    
    .log-message {
      font-size: 13px;
      color: var(--text-secondary);
      max-width: 400px;
    }
    
    .text-center {
      text-align: center;
    }
    
    /* Modals styling */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    
    .modal-content {
      width: 100%;
      max-width: 500px;
      padding: 30px;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .modal-header h3 {
      font-family: var(--font-family-title);
      font-size: 20px;
      font-weight: 700;
    }
    
    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      transition: var(--transition-smooth);
    }
    
    .close-btn:hover {
      color: var(--text-primary);
    }
    
    .glass-select {
      appearance: none;
      background-image: url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 40px;
    }
    
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 30px;
    }
    
    .alert-success {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 20px;
      color: #d1fae5;
    }
    
    .alert-error {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 20px;
      color: #fee2e2;
    }
    
    .animate-zoom {
      animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    @keyframes zoomIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class AdminDashboard implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private apiUrl = window.location.hostname === 'localhost' && window.location.port === '4200'
    ? 'http://localhost:8080/api/admin'
    : '/api/admin';

  activeTab = 'policies';
  users: User[] = [];
  clients: User[] = [];
  policies: Policy[] = [];
  logs: ReminderLog[] = [];

  // Modals status
  showUserModal = false;
  showPolicyModal = false;
  
  editUserId: number | null = null;
  editPolicyId: number | null = null;
  isTriggering = false;

  successMsg: string | null = null;
  errorMsg: string | null = null;

  userForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: [''],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    role: ['ROLE_USER', Validators.required]
  });

  policyForm: FormGroup = this.fb.group({
    policyNumber: ['', Validators.required],
    policyName: ['', Validators.required],
    clientUsername: ['', Validators.required],
    premiumAmount: [0, [Validators.required, Validators.min(0)]],
    coverageAmount: [0, [Validators.required, Validators.min(0)]],
    startDate: ['', Validators.required],
    dueDate: ['', Validators.required],
    status: ['ACTIVE']
  });

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loadUsers();
    this.loadPolicies();
    this.loadLogs();
  }

  loadUsers(): void {
    this.http.get<User[]>(`${this.apiUrl}/users`).subscribe({
      next: (list) => {
        this.users = list;
        this.clients = list.filter(u => u.role === 'ROLE_USER');
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

  // User Actions
  openCreateUser(): void {
    this.editUserId = null;
    this.userForm.reset({ role: 'ROLE_USER' });
    this.userForm.get('username')?.enable();
    this.userForm.get('password')?.setValidators([Validators.required]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showUserModal = true;
  }

  openEditUser(usr: User): void {
    this.editUserId = usr.id;
    this.userForm.patchValue({
      username: usr.username,
      fullName: usr.fullName,
      email: usr.email,
      phoneNumber: usr.phoneNumber,
      role: usr.role
    });
    this.userForm.get('username')?.disable();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showUserModal = true;
  }

  saveUser(): void {
    if (this.userForm.invalid) return;
    this.clearAlerts();

    const payload = this.userForm.getRawValue();

    if (this.editUserId) {
      if (!payload.password) delete payload.password;
      this.http.put<User>(`${this.apiUrl}/users/${this.editUserId}`, payload).subscribe({
        next: () => {
          this.showAlert('User account updated successfully.', true);
          this.showUserModal = false;
          this.loadUsers();
        },
        error: (err) => this.showAlert(err.error?.message || 'Error updating user.', false)
      });
    } else {
      this.http.post<User>(`${this.apiUrl}/users`, payload).subscribe({
        next: () => {
          this.showAlert('User account created successfully.', true);
          this.showUserModal = false;
          this.loadUsers();
        },
        error: (err) => this.showAlert(err.error?.message || 'Error creating user.', false)
      });
    }
  }

  toggleUserStatus(usr: User): void {
    this.clearAlerts();
    const targetStatus = !usr.enabled;
    this.http.patch<void>(`${this.apiUrl}/users/${usr.id}/status`, { enabled: targetStatus }).subscribe({
      next: () => {
        this.showAlert(`User ${usr.username} status set to ${targetStatus ? 'Active' : 'Disabled'}.`, true);
        this.loadUsers();
      },
      error: (err) => this.showAlert(err.error?.message || 'Error updating status.', false)
    });
  }

  // Policy Actions
  openCreatePolicy(): void {
    this.editPolicyId = null;
    this.policyForm.reset({ status: 'ACTIVE', premiumAmount: 0, coverageAmount: 0 });
    this.policyForm.get('policyNumber')?.enable();
    this.showPolicyModal = true;
  }

  openEditPolicy(pol: Policy): void {
    this.editPolicyId = pol.id;
    this.policyForm.patchValue({
      policyNumber: pol.policyNumber,
      policyName: pol.policyName,
      clientUsername: pol.clientUsername,
      premiumAmount: pol.premiumAmount,
      coverageAmount: pol.coverageAmount,
      startDate: pol.startDate,
      dueDate: pol.dueDate,
      status: pol.status
    });
    this.policyForm.get('policyNumber')?.disable();
    this.showPolicyModal = true;
  }

  savePolicy(): void {
    if (this.policyForm.invalid) return;
    this.clearAlerts();

    const payload = this.policyForm.getRawValue();

    if (this.editPolicyId) {
      this.http.put<Policy>(`${this.apiUrl}/policies/${this.editPolicyId}`, payload).subscribe({
        next: () => {
          this.showAlert('Policy configuration updated.', true);
          this.showPolicyModal = false;
          this.loadPolicies();
        },
        error: (err) => this.showAlert(err.error?.message || 'Error updating policy.', false)
      });
    } else {
      this.http.post<Policy>(`${this.apiUrl}/policies`, payload).subscribe({
        next: () => {
          this.showAlert('Policy registered successfully.', true);
          this.showPolicyModal = false;
          this.loadPolicies();
        },
        error: (err) => this.showAlert(err.error?.message || 'Error creating policy.', false)
      });
    }
  }

  deletePolicy(id: number): void {
    if (!confirm('Are you sure you want to delete this policy configuration?')) return;
    this.clearAlerts();

    this.http.delete<void>(`${this.apiUrl}/policies/${id}`).subscribe({
      next: () => {
        this.showAlert('Policy deleted successfully.', true);
        this.loadPolicies();
      },
      error: (err) => this.showAlert(err.error?.message || 'Error deleting policy.', false)
    });
  }

  // Manual Trigger
  triggerReminders(): void {
    if (this.isTriggering) return;
    this.isTriggering = true;
    this.clearAlerts();

    this.http.post<ReminderLog[]>(`${this.apiUrl}/reminders/trigger`, {}).subscribe({
      next: (sent) => {
        this.isTriggering = false;
        this.showAlert(`Reminder Engine executed successfully. Sent ${sent.length} alert notifications.`, true);
        this.loadLogs();
      },
      error: (err) => {
        this.isTriggering = false;
        this.showAlert(err.error?.message || 'Error triggering reminder engine.', false);
      }
    });
  }

  private showAlert(msg: string, success: boolean): void {
    if (success) {
      this.successMsg = msg;
    } else {
      this.errorMsg = msg;
    }
    setTimeout(() => this.clearAlerts(), 6000);
  }

  private clearAlerts(): void {
    this.successMsg = null;
    this.errorMsg = null;
  }
}
