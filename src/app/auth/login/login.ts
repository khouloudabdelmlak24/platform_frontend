import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        const role = this.authService.getRole();
        console.log('Rôle lu dans le token :', role);
        this.redirectByRole(role);
      },
      error: (err) => {
        console.error('Erreur login :', err);
        this.isLoading = false;
        this.errorMessage = 'Erreur ' + err.status + ' : ' + (err.error?.message ?? err.statusText ?? 'inconnue');
        this.cdr.detectChanges();
      }
    });
  }

  private redirectByRole(role: string | null): void {
    switch (role) {
      case 'ROLE_ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'ROLE_DOCTOR':
        this.router.navigate(['/doctor/dashboard']);
        break;
      case 'ROLE_PATIENT':
        this.router.navigate(['/patient/dashboard']);
        break;
      default:
        this.errorMessage = 'Rôle non reconnu';
    }
  }
}