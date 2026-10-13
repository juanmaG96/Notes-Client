import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 relative transition-colors duration-200">
      
      <!-- Boton de Tema en Pantalla de Autenticacion -->
      <div class="absolute top-4 right-4">
        <button
          type="button"
          (click)="themeService.toggleTheme()"
          class="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-amber-400 transition-all flex items-center justify-center shadow-sm"
          [title]="themeService.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
        >
          <i class="fa-solid text-base" [class.fa-sun]="themeService.isDark()" [class.fa-moon]="!themeService.isDark()"></i>
        </button>
      </div>

      <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-2xl p-8 backdrop-blur transition-colors">
        
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 mb-4">
            <i class="fa-solid fa-lock text-2xl"></i>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Iniciar Sesion</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Accede a tus notas, metas y planificacion personal</p>
        </div>

        @if (errorMessage()) {
          <div class="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm flex items-start">
            <i class="fa-solid fa-circle-exclamation text-base mt-0.5 mr-3 shrink-0"></i>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
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
                class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            @if (loginForm.get('email')?.touched && loginForm.get('email')?.errors) {
              <p class="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center">
                <i class="fa-solid fa-triangle-exclamation mr-1.5"></i>
                Ingrese un correo electronico valido.
              </p>
            }
          </div>

          <div>
            <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Contrasena
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
                class="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility()"
                class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none"
              >
                <i class="fa-solid" [class.fa-eye]="!showPassword()" [class.fa-eye-slash]="showPassword()"></i>
              </button>
            </div>
            @if (loginForm.get('password')?.touched && loginForm.get('password')?.errors) {
              <p class="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center">
                <i class="fa-solid fa-triangle-exclamation mr-1.5"></i>
                La contrasena es obligatoria.
              </p>
            }
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || authService.isLoading()"
            class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          >
            @if (authService.isLoading()) {
              <i class="fa-solid fa-circle-notch fa-spin mr-2"></i>
              <span>Autenticando...</span>
            } @else {
              <i class="fa-solid fa-arrow-right-to-bracket mr-2"></i>
              <span>Ingresar al Sistema</span>
            }
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            No tienes una cuenta?
            <a routerLink="/register" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium ml-1 transition-colors">
              Registrate aqui
            </a>
          </p>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly showPassword = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        const message = error.error?.message || 'Error al autenticar. Verifique sus credenciales.';
        this.errorMessage.set(message);
      }
    });
  }
}
