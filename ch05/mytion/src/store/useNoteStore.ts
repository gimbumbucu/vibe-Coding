import { create } from 'zustand'

export interface Note {
  id: string // full path to the .md file
  title: string
  content: string
  updatedAt: number
}

interface NoteState {
  notes: Note[]
  activeNoteId: string | null
  workspacePath: string | null
  setWorkspacePath: (path: string | null) => void
  setNotes: (notes: Note[]) => void
  addNoteToState: (note: Note) => void
  updateNoteState: (id: string, content: string, title: string) => void
  deleteNoteFromState: (id: string) => void
  setActiveNote: (id: string | null) => void
}

export const useNoteStore = create<NoteState>()((set) => ({
  notes: [],
  activeNoteId: null,
  workspacePath: null,
  setWorkspacePath: (path) => set({ workspacePath: path, notes: [], activeNoteId: null }),
  setNotes: (notes) => set({ notes }),
  addNoteToState: (note) => set((state) => ({ notes: [note, ...state.notes], activeNoteId: note.id })),
  updateNoteState: (id, content, title) => set((state) => ({
    notes: state.notes.map((n) =>
      n.id === id ? { ...n, content, title, updatedAt: Date.now() } : n
    ),
  })),
  deleteNoteFromState: (id) => set((state) => {
    const newNotes = state.notes.filter((n) => n.id !== id)
    return {
      notes: newNotes,
      activeNoteId: state.activeNoteId === id ? (newNotes[0]?.id || null) : state.activeNoteId
    }
  }),
  setActiveNote: (id) => set({ activeNoteId: id }),
}))
