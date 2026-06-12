import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card glass-panel animate-fade-in">
        <div class="login-header">
          <div class="brand">
            <span class="material-icons brand-icon">verified_user</span>
            <h2>MyPolicyReminder</h2>
          </div>
          <p class="subtitle">Prudential Life UK Policy Portal</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="glass-input-group">
            <label for="username">Username</label>
            <input 
              id="username" 
              type="text" 
              class="glass-input" 
              formControlName="username" 
              placeholder="Enter your username"
              autocomplete="username">
            <div class="error-msg" *ngIf="loginForm.get('username')?.touched && loginForm.get('username')?.invalid">
              Username is required
            </div>
          </div>

          <div class="glass-input-group">
            <label for="password">Password</label>
            <input 
              id="password" 
              type="password" 
              class="glass-input" 
              formControlName="password" 
              placeholder="Enter your password"
              autocomplete="current-password">
            <div class="error-msg" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid">
              Password is required
            </div>
          </div>

          <div class="error-alert" *ngIf="errorMessage">
            <span class="material-icons error-icon">error_outline</span>
            <span class="error-text">{{ errorMessage }}</span>
          </div>

          <button type="submit" class="glass-btn glass-btn-primary login-btn" [disabled]="loginForm.invalid || isLoading">
            <span class="material-icons button-icon" *ngIf="!isLoading">login</span>
            <span class="spinner" *ngIf="isLoading"></span>
            {{ isLoading ? 'Authenticating...' : 'Sign In' }}
          </button>
        </form>

        <div class="demo-creds">
          <p class="demo-title">Demo Access Credentials</p>
          <div class="creds-grid">
            <div class="cred-item">
              <span class="cred-role">Admin:</span>
              <span class="cred-val">admin / adminpass</span>
            </div>
            <div class="cred-item">
              <span class="cred-role">Client:</span>
              <span class="cred-val">client / clientpass</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: radial-gradient(circle at 50% 50%, #2a1010 0%, #0e1118 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 40px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .brand h2 {
      font-family: var(--font-family-title);
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #ffffff 0%, #ff8a80 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-icon {
      color: var(--primary-color);
      font-size: 36px;
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: 14px;
    }

    .login-btn {
      width: 100%;
      margin-top: 10px;
    }

    .error-msg {
      color: #fca5a5;
      font-size: 12px;
      margin-top: 4px;
      font-weight: 500;
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 20px;
    }

    .error-icon {
      color: var(--color-danger);
      font-size: 20px;
    }

    .error-text {
      color: #fca5a5;
      font-size: 13px;
      font-weight: 500;
    }

    .demo-creds {
      margin-top: 30px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .demo-title {
      font-family: var(--font-family-title);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
      text-align: center;
    }

    .creds-grid {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .cred-item {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      background: rgba(255, 255, 255, 0.02);
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.02);
    }

    .cred-role {
      color: var(--text-secondary);
      font-weight: 600;
    }

    .cred-val {
      color: var(--text-primary);
      font-family: monospace;
    }

    .spinner {
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-top: 2px solid #ffffff;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .animate-fade-in {
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMessage: string | null = null;

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (session) => {
        this.isLoading = false;
        if (session.role === 'ROLE_ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/client-dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Invalid username or password.';
        } else {
          this.errorMessage = 'Authentication server connection error.';
        }
      }
    });
  }
}
