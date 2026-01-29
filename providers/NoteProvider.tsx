import { notesService } from "@/services/notes.service"; // Tu servicio ya creado
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

export type Note = {
  $id: string;
  title: string;
  content: string;
  user_id: string;
  color: string;
  is_pinned: boolean;
  $createdAt: string;
  $updatedAt: string;
};

type NotesContextType = {
  notes: Note[];
  loading: boolean;
  fetchNotes: (title?: string) => Promise<void>;
  addNote: (
    title: string,
    content: string,
    userId: string,
    color: string,
  ) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  updateNote: (
    id: string,
    title: string,
    content: string,
    color: string,
    is_pinned?: boolean,
  ) => Promise<void>;
};

const NotesContext = createContext<NotesContextType | null>(null);

const sortNotes = (notes: Note[]) => {
  return [...notes].sort((a, b) => {
    // Primero los pinned
    if (a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1;
    }
    // Luego por fecha de actualización (más reciente primero)
    return new Date(b.$updatedAt).getTime() - new Date(a.$updatedAt).getTime();
  });
};

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchNotes = async (title?: string) => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await notesService.listNotes(user.$id, title);
      setNotes(data.documents as unknown as Note[]);
    } catch (error) {
      console.error("Error al buscar notas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargamos las notas automáticamente cuando el usuario se loguea
  useEffect(() => {
    if (user) fetchNotes();
    else setNotes([]);
  }, [user]);

  const addNote = async (
    title: string,
    content: string,
    userId: string,
    color: string,
  ) => {
    try {
      const newNote = await notesService.createNote(
        title,
        content,
        userId,
        color,
      );
      setNotes((prev) => sortNotes([newNote as unknown as Note, ...prev]));
    } catch (error) {
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      // Actualización optimista: borramos de la UI antes de que termine la API
      setNotes((prev) => prev.filter((n) => n.$id !== id));
      await notesService.deleteNote(id);
    } catch (error) {
      // Si falla, podrías volver a cargar las notas o mostrar un error
      fetchNotes();
      throw error;
    }
  };

  const updateNote = async (
    id: string,
    title: string,
    content: string,
    color: string,
    is_pinned?: boolean,
  ) => {
    try {
      const updatedNote = await notesService.updateNote(
        id,
        title,
        content,
        color,
        is_pinned,
      );
      setNotes((prev) => {
        const filtered = prev.filter((n) => n.$id !== id);
        return sortNotes([updatedNote as unknown as Note, ...filtered]);
      });
    } catch (error) {
      throw error;
    }
  };

  return (
    <NotesContext.Provider
      value={{ notes, loading, fetchNotes, addNote, deleteNote, updateNote }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes debe usarse dentro de NotesProvider");
  return ctx;
}
