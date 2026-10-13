import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 relative transition-colors duration-200">
      
      <!-- Boton de Tema en Pantalla de Registro -->
      <div class="absolute top-4 right-4">
        <button
          type="button"
          (click)="themeService.toggleTheme()"
          class="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-amber-400 transition-all flex items-center justify-center shadow-sm"
          [title]="themeService.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
        >
          <i class="fa-solid text-base" [class.fa-sun]="themeService.isDark()" [class.fa-moon]="!themeService.isDark()"></i>
        </button>
      </div>

      <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-2xl p-8 backdrop-blur transition-colors">
        
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-teal-50 dark:bg-teal-600/20 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30 mb-4">
            <i class="fa-solid fa-user-plus text-2xl"></i>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Crear Cuenta</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Registrate para comenzar a gestionar tus metas y notas</p>
        </div>

        @if (errorMessage()) {
          <div class="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm flex items-start">
            <i class="fa-solid fa-circle-exclamation text-base mt-0.5 mr-3 shrink-0"></i>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Correo Electronico
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                <i class="fa-solid fa-envelope"></i>
              </span>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="ejemplo@dominio.com"
                class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            @if (registerForm.get('email')?.touched && registerForm.get('email')?.errors) {
              <p class="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center">
                <i class="fa-solid fa-triangle-exclamation mr-1.5"></i>
                Ingrese un correo electronico valido.
              </p>
            }
          </div>

          <div>
            <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Contrasena (Minimo 8 caracteres)
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                <i class="fa-solid fa-key"></i>
              </span>
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="••••••••"
                class="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility()"
                class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none"
              >
                <i class="fa-solid" [class.fa-eye]="!showPassword()" [class.fa-eye-slash]="showPassword()"></i>
              </button>
            </div>
            @if (registerForm.get('password')?.touched && registerForm.get('password')?.errors) {
              <p class="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center">
                <i class="fa-solid fa-triangle-exclamation mr-1.5"></i>
                La contrasena debe tener al menos 8 caracteres.
              </p>
            }
          </div>

          <div>
            <label for="confirmPassword" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Confirmar Contrasena
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                <i class="fa-solid fa-lock"></i>
              </span>
              <input
                id="confirmPassword"
                [type]="showConfirmPassword() ? 'text' : 'password'"
                formControlName="confirmPassword"
                placeholder="••••••••"
                class="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
              />
              <button
                type="button"
                (click)="toggleConfirmPasswordVisibility()"
                class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none"
              >
                <i class="fa-solid" [class.fa-eye]="!showConfirmPassword()" [class.fa-eye-slash]="showConfirmPassword()"></i>
              </button>
            </div>
            @if (registerForm.touched && registerForm.hasError('passwordMismatch')) {
              <p class="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center">
                <i class="fa-solid fa-triangle-exclamation mr-1.5"></i>
                Las contrasenas no coinciden.
              </p>
            }
          </div>

          <button
            type="submit"
            [disabled]="registerForm.invalid || authService.isLoading()"
            class="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          >
            @if (authService.isLoading()) {
              <i class="fa-solid fa-circle-notch fa-spin mr-2"></i>
              <span>Procesando registro...</span>
            } @else {
              <i class="fa-solid fa-user-check mr-2"></i>
              <span>Crear Cuenta</span>
            }
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Ya tienes una cuenta?
            <a routerLink="/login" class="text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 font-medium ml-1 transition-colors">
              Inicia sesion
            </a>
          </p>
        </div>

      </div>
    </div>
  `
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(value => !value);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    const { email, password } = this.registerForm.value;

    this.authService.register({ email, password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        const message = error.error?.message || 'Error al registrar el usuario. Intente nuevamente.';
        this.errorMessage.set(message);
      }
    });
  }
}
