import { Component, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesService } from '../../core/services/notes.service';
import { Note, NoteColor, NoteType } from '../../core/models/note.model';

export interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  notes: Note[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 transition-colors">
      <!-- Encabezado de Navegacion del Calendario -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-lg">
            <i class="fa-solid fa-calendar-days"></i>
          </div>
          <div>
            <h2 class="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">
              {{ currentMonthName() }}
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Planificacion interactiva basada en fechas objetivo</p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button
            type="button"
            (click)="previousMonth()"
            class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 transition-colors text-xs"
            title="Mes anterior"
          >
            <i class="fa-solid fa-chevron-left"></i>
          </button>

          <button
            type="button"
            (click)="goToToday()"
            class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-600/30 hover:border-indigo-300 dark:hover:border-indigo-500/40 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors text-xs font-medium flex items-center"
          >
            <i class="fa-solid fa-calendar-day mr-1.5"></i>
            Hoy
          </button>

          <button
            type="button"
            (click)="nextMonth()"
            class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 transition-colors text-xs"
            title="Mes siguiente"
          >
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Cuadricula del Calendario -->
      <div class="overflow-x-auto">
        <div class="min-w-[680px]">
          <!-- Encabezado de Dias de la Semana -->
          <div class="grid grid-cols-7 gap-px mb-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <div class="py-2">Lun</div>
            <div class="py-2">Mar</div>
            <div class="py-2">Mie</div>
            <div class="py-2">Jue</div>
            <div class="py-2">Vie</div>
            <div class="py-2">Sab</div>
            <div class="py-2">Dom</div>
          </div>

          <!-- Matriz de Dias del Mes -->
          <div class="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800/80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            @for (day of calendarDays(); track day.dateString) {
              <div
                (click)="onCellClick(day)"
                [ngClass]="getDayCellClasses(day)"
                class="min-h-[110px] sm:min-h-[125px] p-2 flex flex-col justify-between transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer group relative"
              >
                <!-- Cabecera del Dia -->
                <div class="flex items-center justify-between mb-1">
                  <span
                    [class.bg-indigo-600]="day.isToday"
                    [class.text-white]="day.isToday"
                    [class.text-slate-700]="!day.isToday"
                    [class.dark:text-slate-300]="!day.isToday"
                    class="text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    {{ day.dayNumber }}
                  </span>

                  <!-- Accion Rapida de Agregar -->
                  <button
                    type="button"
                    (click)="onAddClick(day, $event)"
                    class="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all text-[11px]"
                    title="Agregar nota a este dia"
                  >
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>

                <!-- Lista de Notas del Dia -->
                <div class="space-y-1.5 flex-1 overflow-y-auto max-h-[80px]">
                  @for (note of day.notes; track note.id) {
                    <div
                      (click)="onNoteClick(note, $event)"
                      [class]="getNoteBadgeClass(note.color)"
                      class="px-2 py-1 rounded-md text-[11px] truncate flex items-center justify-between border cursor-pointer hover:brightness-95 dark:hover:brightness-110 transition-all shadow-sm"
                      [title]="note.title + ' (' + note.type + ')'"
                    >
                      <div class="flex items-center space-x-1.5 truncate">
                        <i [class]="getNoteIconClass(note.type) + ' text-[10px] shrink-0'"></i>
                        <span class="truncate font-medium">{{ note.title }}</span>
                      </div>
                    </div>
                  }
                </div>

                <!-- Footer del Dia: Contador si hay notas -->
                @if (day.notes.length > 0) {
                  <div class="mt-1 text-[10px] text-right text-slate-400 dark:text-slate-500 font-mono">
                    {{ day.notes.length }} {{ day.notes.length === 1 ? 'item' : 'items' }}
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class CalendarComponent {
  readonly notesService = inject(NotesService);

  @Output() dateSelected = new EventEmitter<string>();
  @Output() editNoteSelected = new EventEmitter<Note>();

  readonly currentDate = signal<Date>(new Date());

  readonly currentMonthName = computed(() => {
    const d = this.currentDate();
    return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  });

  readonly calendarDays = computed<CalendarDay[]>(() => {
    const current = this.currentDate();
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Dia de la semana del primer dia (0: Domingo, 1: Lunes... normalizamos a Lunes=0, Domingo=6)
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const todayStr = this.formatDateString(new Date());
    const allNotes = this.notesService.notes();

    // Mapa de notas por fecha (YYYY-MM-DD)
    const notesByDate = new Map<string, Note[]>();
    for (const note of allNotes) {
      if (note.targetDateUtc) {
        const dateKey = note.targetDateUtc.substring(0, 10);
        if (!notesByDate.has(dateKey)) {
          notesByDate.set(dateKey, []);
        }
        notesByDate.get(dateKey)!.push(note);
      }
    }

    const days: CalendarDay[] = [];

    // Dias previos (del mes anterior)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const d = new Date(year, month - 1, dayNum);
      const dateStr = this.formatDateString(d);
      days.push({
        date: d,
        dateString: dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        notes: notesByDate.get(dateStr) || []
      });
    }

    // Dias del mes actual
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = this.formatDateString(d);
      days.push({
        date: d,
        dateString: dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        notes: notesByDate.get(dateStr) || []
      });
    }

    // Dias posteriores para completar la cuadricula (multiplo de 7)
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      const dateStr = this.formatDateString(d);
      days.push({
        date: d,
        dateString: dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        notes: notesByDate.get(dateStr) || []
      });
    }

    return days;
  });

  previousMonth(): void {
    const cur = this.currentDate();
    this.currentDate.set(new Date(cur.getFullYear(), cur.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const cur = this.currentDate();
    this.currentDate.set(new Date(cur.getFullYear(), cur.getMonth() + 1, 1));
  }

  goToToday(): void {
    this.currentDate.set(new Date());
  }

  onCellClick(day: CalendarDay): void {
    this.dateSelected.emit(day.dateString);
  }

  onAddClick(day: CalendarDay, event: MouseEvent): void {
    event.stopPropagation();
    this.dateSelected.emit(day.dateString);
  }

  onNoteClick(note: Note, event: MouseEvent): void {
    event.stopPropagation();
    this.editNoteSelected.emit(note);
  }

  getDayCellClasses(day: CalendarDay): string {
    if (!day.isCurrentMonth) {
      return 'opacity-40 bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-600';
    }
    if (day.isToday) {
      return 'bg-indigo-50/70 dark:bg-indigo-950/25 ring-1 ring-inset ring-indigo-500';
    }
    return 'bg-white dark:bg-slate-900';
  }

  private formatDateString(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getNoteBadgeClass(color: NoteColor): string {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-300';
      case 'purple':
        return 'bg-purple-50 dark:bg-purple-950/70 border-purple-200 dark:border-purple-500/40 text-purple-800 dark:text-purple-300';
      case 'rose':
        return 'bg-rose-50 dark:bg-rose-950/70 border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300';
      case 'slate':
        return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300';
      default:
        return 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-500/40 text-indigo-800 dark:text-indigo-300';
    }
  }

  getNoteIconClass(type: NoteType): string {
    switch (type) {
      case 'Idea': return 'fa-solid fa-lightbulb text-amber-500 dark:text-amber-400';
      case 'Meta': return 'fa-solid fa-bullseye text-emerald-500 dark:text-emerald-400';
      case 'Aprendizaje': return 'fa-solid fa-graduation-cap text-purple-500 dark:text-purple-400';
    }
  }
}
