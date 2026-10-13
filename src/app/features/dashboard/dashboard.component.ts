import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotesService } from '../../core/services/notes.service';
import { ThemeService } from '../../core/services/theme.service';
import { Note, NoteColor, NoteType } from '../../core/models/note.model';
import { CalendarComponent } from '../calendar/calendar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CalendarComponent],
  template: `
    <div class="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      
      <!-- Navbar Superior -->
      <header class="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-40 transition-colors">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <i class="fa-solid fa-layer-group text-base"></i>
            </div>
            <div>
              <span class="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Notes & Goals</span>
              <span class="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80 font-medium">
                SDD Enterprise
              </span>
            </div>
          </div>

          <div class="flex items-center space-x-2 sm:space-x-3">
            <!-- Boton de Alternancia de Tema (Modo Claro / Modo Oscuro) -->
            <button
              type="button"
              (click)="themeService.toggleTheme()"
              class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-amber-400 transition-all flex items-center justify-center shadow-sm"
              [title]="themeService.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            >
              <i class="fa-solid text-sm" [class.fa-sun]="themeService.isDark()" [class.fa-moon]="!themeService.isDark()"></i>
            </button>

            <!-- Usuario Autenticado -->
            <div class="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <i class="fa-solid fa-circle-user text-slate-400 dark:text-slate-500"></i>
              <span class="font-medium max-w-[130px] sm:max-w-none truncate">{{ authService.currentUser()?.email }}</span>
            </div>

            <!-- Boton de Cerrar Sesion -->
            <button
              (click)="onLogout()"
              class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700/80 hover:border-rose-300 dark:hover:border-rose-500/30 text-slate-700 dark:text-slate-300 transition-all text-xs sm:text-sm font-medium flex items-center"
              title="Cerrar sesion"
            >
              <i class="fa-solid fa-right-from-bracket mr-1.5"></i>
              <span class="hidden sm:inline">Cerrar Sesion</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Contenido Principal -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <!-- Barra de Herramientas y Conmutador de Vistas -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
              <span>Espacio Personal</span>
              <span class="ml-3 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                {{ notesService.totalCount() }} registros
              </span>
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Organiza tus apuntes, metas y aprendizajes con privacidad absoluta</p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <!-- Conmutador de Vista (Tablero vs Calendario) -->
            <div class="p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center shadow-sm">
              <button
                type="button"
                (click)="setViewMode('board')"
                [class]="viewMode() === 'board' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center"
              >
                <i class="fa-solid fa-table-cells-large mr-1.5"></i>
                Tablero
              </button>
              <button
                type="button"
                (click)="setViewMode('calendar')"
                [class]="viewMode() === 'calendar' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center"
              >
                <i class="fa-solid fa-calendar-days mr-1.5"></i>
                Calendario
              </button>
            </div>

            <!-- Boton de Nuevo Registro -->
            <button
              (click)="openCreateModal()"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center text-xs sm:text-sm"
            >
              <i class="fa-solid fa-plus mr-2"></i>
              <span>Nuevo Registro</span>
            </button>
          </div>
        </div>

        @if (viewMode() === 'board') {
          <!-- Filtros y Buscador del Tablero -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
            <!-- Tabs de Tipo -->
            <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                (click)="onFilterChange(null)"
                [class]="notesService.activeFilter() === null ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'"
                class="px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center shrink-0"
              >
                <i class="fa-solid fa-layer-group mr-1.5"></i>
                <span>Todas</span>
                <span class="ml-1.5 opacity-80 font-mono text-[11px]">({{ notesService.totalCount() }})</span>
              </button>

              <button
                (click)="onFilterChange('Idea')"
                [class]="notesService.activeFilter() === 'Idea' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'"
                class="px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center shrink-0"
              >
                <i class="fa-solid fa-lightbulb mr-1.5 text-amber-500 dark:text-amber-400"></i>
                <span>Ideas</span>
                <span class="ml-1.5 opacity-80 font-mono text-[11px]">({{ notesService.ideasCount() }})</span>
              </button>

              <button
                (click)="onFilterChange('Meta')"
                [class]="notesService.activeFilter() === 'Meta' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'"
                class="px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center shrink-0"
              >
                <i class="fa-solid fa-bullseye mr-1.5 text-emerald-500 dark:text-emerald-400"></i>
                <span>Metas</span>
                <span class="ml-1.5 opacity-80 font-mono text-[11px]">({{ notesService.metasCount() }})</span>
              </button>

              <button
                (click)="onFilterChange('Aprendizaje')"
                [class]="notesService.activeFilter() === 'Aprendizaje' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'"
                class="px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center shrink-0"
              >
                <i class="fa-solid fa-graduation-cap mr-1.5 text-purple-500 dark:text-purple-400"></i>
                <span>Aprendizajes</span>
                <span class="ml-1.5 opacity-80 font-mono text-[11px]">({{ notesService.aprendizajesCount() }})</span>
              </button>
            </div>

            <!-- Input de Busqueda -->
            <div class="relative w-full sm:w-64">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
                <i class="fa-solid fa-magnifying-glass text-xs"></i>
              </span>
              <input
                type="text"
                [value]="notesService.searchQuery()"
                (input)="onSearchInput($event)"
                placeholder="Buscar por titulo o texto..."
                class="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <!-- Grilla de Tarjetas -->
          @if (notesService.isLoading() && notesService.notes().length === 0) {
            <div class="py-20 text-center">
              <i class="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-500 mb-3"></i>
              <p class="text-sm text-slate-500 dark:text-slate-400">Cargando tus registros...</p>
            </div>
          } @else if (notesService.filteredNotes().length === 0) {
            <div class="p-12 text-center rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 my-8 shadow-sm">
              <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-4 text-2xl">
                <i class="fa-solid fa-folder-open"></i>
              </div>
              <h3 class="text-base font-semibold text-slate-900 dark:text-white">No se encontraron notas o metas</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                Empieza creando tu primer apunte o meta para visualizarlo en este panel interactivo.
              </p>
              <button
                (click)="openCreateModal()"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition-all inline-flex items-center shadow-sm"
              >
                <i class="fa-solid fa-plus mr-2"></i>
                Crear Registro Ahora
              </button>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              @for (note of notesService.filteredNotes(); track note.id) {
                <div
                  class="rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
                  [ngClass]="getCardColorClasses(note.color)"
                >
                  <div>
                    <!-- Encabezado de la Tarjeta -->
                    <div class="flex items-center justify-between mb-3">
                      <span
                        class="px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center"
                        [ngClass]="getTypeBadgeClasses(note.type)"
                      >
                        <i [class]="getTypeIconClass(note.type) + ' mr-1.5'"></i>
                        {{ note.type }}
                      </span>

                      <div class="flex items-center space-x-1">
                        <button
                          (click)="openEditModal(note)"
                          class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
                          title="Editar nota"
                        >
                          <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          (click)="confirmDeleteNote(note)"
                          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
                          title="Eliminar nota"
                        >
                          <i class="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Titulo y Contenido -->
                    <h3 class="text-base font-semibold text-slate-900 dark:text-white tracking-tight mb-2 line-clamp-2">
                      {{ note.title }}
                    </h3>
                    <p class="text-sm text-slate-600 dark:text-slate-300/90 whitespace-pre-line leading-relaxed mb-4 line-clamp-5">
                      {{ note.content }}
                    </p>
                  </div>

                  <!-- Pie de la Tarjeta -->
                  <div class="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span class="inline-flex items-center" title="Fecha de creacion">
                      <i class="fa-regular fa-clock mr-1 text-[11px]"></i>
                      {{ note.createdAtUtc | date:'shortDate' }}
                    </span>

                    @if (note.targetDateUtc) {
                      <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-medium" title="Fecha objetivo">
                        <i class="fa-regular fa-calendar-days mr-1 text-[11px]"></i>
                        {{ note.targetDateUtc | date:'shortDate' }}
                      </span>
                    }
                  </div>
                </div>
              }
            </div>
          }
        } @else {
          <!-- Vista de Calendario Interactivo -->
          <app-calendar
            (dateSelected)="openCreateModalWithDate($event)"
            (editNoteSelected)="openEditModal($event)"
          ></app-calendar>
        }
      </main>

      <!-- Modal de Creacion / Edicion -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade">
          <div class="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-y-auto max-h-[90vh] transition-colors">
            
            <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <i [class]="editingNote() ? 'fa-solid fa-pen-to-square text-indigo-600 dark:text-indigo-400 mr-2.5' : 'fa-solid fa-plus text-indigo-600 dark:text-indigo-400 mr-2.5'"></i>
                {{ editingNote() ? 'Editar Registro' : 'Nuevo Registro' }}
              </h2>
              <button
                (click)="closeModal()"
                class="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <i class="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form [formGroup]="noteForm" (ngSubmit)="onSaveNote()" class="space-y-4">
              <!-- Titulo -->
              <div>
                <label for="modal-title" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Titulo
                </label>
                <input
                  id="modal-title"
                  type="text"
                  formControlName="title"
                  placeholder="Ej: Aprender PostgreSQL y Docker"
                  class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                @if (noteForm.get('title')?.touched && noteForm.get('title')?.errors) {
                  <p class="text-xs text-rose-600 dark:text-rose-400 mt-1">El titulo es obligatorio (max 200 caracteres).</p>
                }
              </div>

              <!-- Tipo (Pills) -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Tipo de Registro
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    (click)="setType('Idea')"
                    [class]="noteForm.get('type')?.value === 'Idea' ? 'bg-amber-100 dark:bg-amber-600/30 border-amber-300 dark:border-amber-500 text-amber-800 dark:text-amber-300 font-semibold' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
                    class="py-2 px-3 border rounded-xl text-xs font-medium flex items-center justify-center transition-all"
                  >
                    <i class="fa-solid fa-lightbulb mr-1.5"></i>
                    Idea
                  </button>

                  <button
                    type="button"
                    (click)="setType('Meta')"
                    [class]="noteForm.get('type')?.value === 'Meta' ? 'bg-emerald-100 dark:bg-emerald-600/30 border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 font-semibold' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
                    class="py-2 px-3 border rounded-xl text-xs font-medium flex items-center justify-center transition-all"
                  >
                    <i class="fa-solid fa-bullseye mr-1.5"></i>
                    Meta
                  </button>

                  <button
                    type="button"
                    (click)="setType('Aprendizaje')"
                    [class]="noteForm.get('type')?.value === 'Aprendizaje' ? 'bg-purple-100 dark:bg-purple-600/30 border-purple-300 dark:border-purple-500 text-purple-800 dark:text-purple-300 font-semibold' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
                    class="py-2 px-3 border rounded-xl text-xs font-medium flex items-center justify-center transition-all"
                  >
                    <i class="fa-solid fa-graduation-cap mr-1.5"></i>
                    Aprendizaje
                  </button>
                </div>
              </div>

              <!-- Color Palette -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Color Tematico
                </label>
                <div class="flex items-center space-x-2.5">
                  @for (c of availableColors; track c) {
                    <button
                      type="button"
                      (click)="setColor(c)"
                      [class]="getColorBadgeClass(c)"
                      class="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none border-2"
                      [style.border-color]="noteForm.get('color')?.value === c ? (themeService.isDark() ? '#ffffff' : '#0f172a') : 'transparent'"
                    >
                      @if (noteForm.get('color')?.value === c) {
                        <i class="fa-solid fa-check text-xs text-white"></i>
                      }
                    </button>
                  }
                </div>
              </div>

              <!-- Contenido -->
              <div>
                <label for="modal-content" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Contenido
                </label>
                <textarea
                  id="modal-content"
                  rows="4"
                  formControlName="content"
                  placeholder="Detalla tus apuntes, notas o criterios de la meta..."
                  class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
                @if (noteForm.get('content')?.touched && noteForm.get('content')?.errors) {
                  <p class="text-xs text-rose-600 dark:text-rose-400 mt-1">El contenido es obligatorio.</p>
                }
              </div>

              <!-- Fecha Objetivo (Opcional) -->
              <div>
                <label for="modal-target-date" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Fecha Objetivo (Planificacion en Calendario)
                </label>
                <div class="relative">
                  <input
                    id="modal-target-date"
                    type="date"
                    formControlName="targetDate"
                    class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <!-- Botones Modal -->
              <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="noteForm.invalid || notesService.isLoading()"
                  class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-xl shadow-md transition-all flex items-center"
                >
                  @if (notesService.isLoading()) {
                    <i class="fa-solid fa-circle-notch fa-spin mr-1.5"></i>
                    <span>Guardando...</span>
                  } @else {
                    <i class="fa-solid fa-check mr-1.5"></i>
                    <span>{{ editingNote() ? 'Actualizar' : 'Guardar' }}</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Modal de Confirmacion de Eliminacion -->
      @if (deletingNote()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div class="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-2xl text-center transition-colors">
            <div class="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-xl">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">Confirmar Eliminacion</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Esta accion eliminara definitivamente la nota "<span class="text-slate-800 dark:text-slate-200 font-medium">{{ deletingNote()?.title }}</span>".
            </p>
            <div class="flex items-center justify-center space-x-3">
              <button
                (click)="cancelDelete()"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                (click)="executeDelete()"
                [disabled]="notesService.isLoading()"
                class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors shadow-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class DashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  readonly notesService = inject(NotesService);
  readonly themeService = inject(ThemeService);

  readonly viewMode = signal<'board' | 'calendar'>('board');
  readonly isModalOpen = signal<boolean>(false);
  readonly editingNote = signal<Note | null>(null);
  readonly deletingNote = signal<Note | null>(null);

  readonly availableColors: NoteColor[] = ['indigo', 'emerald', 'amber', 'purple', 'rose', 'slate'];

  readonly noteForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    content: ['', [Validators.required]],
    type: ['Idea' as NoteType, [Validators.required]],
    color: ['indigo' as NoteColor, [Validators.required]],
    targetDate: ['']
  });

  ngOnInit(): void {
    this.notesService.loadNotes().subscribe();
  }

  setViewMode(mode: 'board' | 'calendar'): void {
    this.viewMode.set(mode);
  }

  onFilterChange(type: string | null): void {
    this.notesService.setFilter(type);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.notesService.setSearchQuery(input.value);
  }

  openCreateModal(): void {
    this.editingNote.set(null);
    this.noteForm.reset({
      title: '',
      content: '',
      type: 'Idea',
      color: 'indigo',
      targetDate: ''
    });
    this.isModalOpen.set(true);
  }

  openCreateModalWithDate(dateString: string): void {
    this.editingNote.set(null);
    this.noteForm.reset({
      title: '',
      content: '',
      type: 'Meta',
      color: 'indigo',
      targetDate: dateString
    });
    this.isModalOpen.set(true);
  }

  openEditModal(note: Note): void {
    this.editingNote.set(note);
    const formattedDate = note.targetDateUtc ? note.targetDateUtc.substring(0, 10) : '';
    this.noteForm.patchValue({
      title: note.title,
      content: note.content,
      type: note.type,
      color: note.color,
      targetDate: formattedDate
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingNote.set(null);
  }

  setType(type: NoteType): void {
    this.noteForm.patchValue({ type });
  }

  setColor(color: NoteColor): void {
    this.noteForm.patchValue({ color });
  }

  onSaveNote(): void {
    if (this.noteForm.invalid) {
      this.noteForm.markAllAsTouched();
      return;
    }

    const formValues = this.noteForm.value;
    const targetDateUtc = formValues.targetDate ? new Date(formValues.targetDate + 'T00:00:00Z').toISOString() : null;

    const payload = {
      title: formValues.title,
      content: formValues.content,
      type: formValues.type,
      color: formValues.color,
      targetDateUtc
    };

    const currentEditing = this.editingNote();
    if (currentEditing) {
      this.notesService.updateNote(currentEditing.id, payload).subscribe({
        next: () => this.closeModal()
      });
    } else {
      this.notesService.createNote(payload).subscribe({
        next: () => this.closeModal()
      });
    }
  }

  confirmDeleteNote(note: Note): void {
    this.deletingNote.set(note);
  }

  cancelDelete(): void {
    this.deletingNote.set(null);
  }

  executeDelete(): void {
    const note = this.deletingNote();
    if (note) {
      this.notesService.deleteNote(note.id).subscribe({
        next: () => this.deletingNote.set(null)
      });
    }
  }

  onLogout(): void {
    this.authService.logout().subscribe();
  }

  getCardColorClasses(color: NoteColor): string {
    switch (color) {
      case 'emerald':
        return 'border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-300 dark:hover:border-emerald-500/60 bg-gradient-to-b from-white to-emerald-50/40 dark:from-slate-900 dark:to-emerald-950/20';
      case 'amber':
        return 'border-amber-200 dark:border-amber-500/30 hover:border-amber-300 dark:hover:border-amber-500/60 bg-gradient-to-b from-white to-amber-50/40 dark:from-slate-900 dark:to-amber-950/20';
      case 'purple':
        return 'border-purple-200 dark:border-purple-500/30 hover:border-purple-300 dark:hover:border-purple-500/60 bg-gradient-to-b from-white to-purple-50/40 dark:from-slate-900 dark:to-purple-950/20';
      case 'rose':
        return 'border-rose-200 dark:border-rose-500/30 hover:border-rose-300 dark:hover:border-rose-500/60 bg-gradient-to-b from-white to-rose-50/40 dark:from-slate-900 dark:to-rose-950/20';
      case 'slate':
        return 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500/60 bg-gradient-to-b from-white to-slate-100/40 dark:from-slate-900 dark:to-slate-900/60';
      default:
        return 'border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-300 dark:hover:border-indigo-500/60 bg-gradient-to-b from-white to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/20';
    }
  }

  getTypeBadgeClasses(type: NoteType): string {
    switch (type) {
      case 'Idea':
        return 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30';
      case 'Meta':
        return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30';
      case 'Aprendizaje':
        return 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30';
    }
  }

  getTypeIconClass(type: NoteType): string {
    switch (type) {
      case 'Idea':
        return 'fa-solid fa-lightbulb';
      case 'Meta':
        return 'fa-solid fa-bullseye';
      case 'Aprendizaje':
        return 'fa-solid fa-graduation-cap';
    }
  }

  getColorBadgeClass(color: NoteColor): string {
    switch (color) {
      case 'emerald': return 'bg-emerald-500';
      case 'amber': return 'bg-amber-500';
      case 'purple': return 'bg-purple-500';
      case 'rose': return 'bg-rose-500';
      case 'slate': return 'bg-slate-500';
      default: return 'bg-indigo-500';
    }
  }
}
