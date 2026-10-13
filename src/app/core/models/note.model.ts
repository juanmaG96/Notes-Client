export type NoteType = 'Idea' | 'Meta' | 'Aprendizaje';
export type NoteColor = 'indigo' | 'emerald' | 'amber' | 'purple' | 'rose' | 'slate';

export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  color: NoteColor;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  targetDateUtc?: string | null;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  type: NoteType;
  color: NoteColor;
  targetDateUtc?: string | null;
}

export interface UpdateNoteRequest {
  title: string;
  content: string;
  type: NoteType;
  color: NoteColor;
  targetDateUtc?: string | null;
}
