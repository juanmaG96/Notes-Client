import { Injectable, computed, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'app_theme';
  private readonly themeSignal = signal<ThemeMode>(this.getInitialTheme());

  public readonly currentTheme = this.themeSignal.asReadonly();
  public readonly isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    this.applyToDom(this.themeSignal());
  }

  public setTheme(theme: ThemeMode): void {
    this.themeSignal.set(theme);
    this.persistTheme(theme);
    this.applyToDom(theme);
  }

  public toggleTheme(): void {
    const nextTheme: ThemeMode = this.themeSignal() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  private getInitialTheme(): ThemeMode {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(this.storageKey);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark';
  }

  private persistTheme(theme: ThemeMode): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(this.storageKey, theme);
      } catch {
        // Ignorar excepciones de cuota o navegacion privada
      }
    }
  }

  private applyToDom(theme: ThemeMode): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }
}
