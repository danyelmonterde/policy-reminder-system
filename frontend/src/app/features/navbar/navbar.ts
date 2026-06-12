import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar glass-panel">
      <div class="nav-brand" (click)="goToHome()">
        <span class="material-icons brand-icon">security</span>
        <span class="brand-text">PolicyGuard</span>
      </div>
      
      <div class="nav-actions" *ngIf="authService.currentSession$ | async as session">
        <div class="user-info">
          <span class="material-icons user-icon">account_circle</span>
          <div class="user-details">
            <span class="username">{{ session.username }}</span>
            <span class="role">{{ session.role === 'ROLE_ADMIN' ? 'Administrator' : 'Client' }}</span>
          </div>
        </div>

        <button class="glass-btn logout-btn" (click)="logout()">
          <span class="material-icons">logout</span>
          Logout
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 32px;
      margin-bottom: 30px;
      border-radius: 0 0 16px 16px !important;
      border-top: none !important;
    }
    
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }
    
    .brand-icon {
      color: var(--primary-color);
      font-size: 28px;
    }
    
    .brand-text {
      font-family: var(--font-family-title);
      font-size: 22px;
      font-weight: 800;
      background: linear-gradient(135deg, #ffffff 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .user-icon {
      color: var(--text-secondary);
      font-size: 32px;
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
    }
    
    .username {
      font-family: var(--font-family-title);
      font-weight: 600;
      font-size: 14px;
      color: var(--text-primary);
    }
    
    .role {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .logout-btn {
      padding: 8px 16px;
      font-size: 13px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #fca5a5;
    }
    
    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.3);
      border-color: rgba(239, 68, 68, 0.5);
      color: #ffffff;
    }
  `]
})
export class Navbar {
  protected authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToHome(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/client-dashboard']);
    }
  }
}
