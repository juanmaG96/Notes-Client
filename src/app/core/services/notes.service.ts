import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateNoteRequest, Note, UpdateNoteRequest } from '../models/note.model';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/notes`;

  readonly notes = signal<Note[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly activeFilter = signal<string | null>(null);
  readonly searchQuery = signal<string>('');

  readonly filteredNotes = computed(() => {
    let result = this.notes();
    const filter = this.activeFilter();
    const query = this.searchQuery().trim().toLowerCase();

    if (filter) {
      result = result.filter(n => n.type.toLowerCase() === filter.toLowerCase());
    }

    if (query) {
      result = result.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
      );
    }

    return result;
  });

  readonly totalCount = computed(() => this.notes().length);
  readonly ideasCount = computed(() => this.notes().filter(n => n.type === 'Idea').length);
  readonly metasCount = computed(() => this.notes().filter(n => n.type === 'Meta').length);
  readonly aprendizajesCount = computed(() => this.notes().filter(n => n.type === 'Aprendizaje').length);

  loadNotes(type?: string, startDate?: string, endDate?: string): Observable<Note[]> {
    this.isLoading.set(true);
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<Note[]>(this.baseUrl, { params }).pipe(
      tap(notes => {
        this.notes.set(notes);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  createNote(request: CreateNoteRequest): Observable<Note> {
    this.isLoading.set(true);
    return this.http.post<Note>(this.baseUrl, request).pipe(
      tap(created => {
        this.notes.update(current => [created, ...current]);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  updateNote(id: string, request: UpdateNoteRequest): Observable<Note> {
    this.isLoading.set(true);
    return this.http.put<Note>(`${this.baseUrl}/${id}`, request).pipe(
      tap(updated => {
        this.notes.update(current =>
          current.map(n => n.id === id ? updated : n)
        );
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  deleteNote(id: string): Observable<void> {
    this.isLoading.set(true);
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.notes.update(current => current.filter(n => n.id !== id));
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  setFilter(filter: string | null): void {
    this.activeFilter.set(filter);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }
}
