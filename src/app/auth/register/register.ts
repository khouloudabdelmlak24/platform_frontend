import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  phone = '';
  role: 'DOCTOR' | 'PATIENT' = 'PATIENT';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.errorMessage = '';

    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    this.isLoading = true;

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      phone: this.phone,
      role: this.role
    }).subscribe({
      next: () => {
        // On supprime tout token éventuellement enregistré :
        // après l'inscription, l'utilisateur doit se connecter lui-même.
        this.authService.logout();
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erreur inscription :', err);
        this.isLoading = false;
        this.errorMessage = 'Erreur ' + err.status + ' : ' + (err.error?.message ?? err.statusText ?? 'inconnue');
        this.cdr.detectChanges();
      }
    });
  }
}