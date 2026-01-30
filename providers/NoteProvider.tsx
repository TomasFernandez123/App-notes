import { notesService } from "@/services/notes.service"; // Tu servicio ya creado
import * as ImagePicker from "expo-image-picker";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

export type Note = {
  $id: string;
  title: string;
  content: string;
  user_id: string;
  color: string;
  is_pinned: boolean;
  imageId?: string;
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
    imageAsset?: ImagePicker.ImagePickerAsset,
  ) => Promise<void>;
  deleteNote: (id: string, imageId?: string) => Promise<void>;
  updateNote: (
    id: string,
    title: string,
    content: string,
    color: string,
    is_pinned?: boolean,
    imageAsset?: ImagePicker.ImagePickerAsset,
    oldImageId?: string,
    shouldRemoveImage?: boolean,
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
    imageAsset?: any, // Recibimos el asset de Expo
  ) => {
    try {
      let imageId = undefined;

      if (imageAsset) {
        // Llamamos al servicio pasando el asset completo
        const uploadedFile = await notesService.uploadImage(imageAsset);
        if (uploadedFile && uploadedFile.$id) {
          imageId = uploadedFile.$id;
        } else {
          console.error(
            "Upload failed or returned invalid file object",
            uploadedFile,
          );
          throw new Error("Failed to upload image.");
        }
      }

      const newNote = await notesService.createNote(
        title,
        content,
        userId,
        color,
        imageId,
      );

      setNotes((prev) => sortNotes([newNote as unknown as Note, ...prev]));
    } catch (error) {
      console.error("Error en addNote:", error);
      throw error;
    }
  };

  const deleteNote = async (id: string, imageId?: string) => {
    try {
      // Actualización optimista: borramos de la UI antes de que termine la API
      setNotes((prev) => prev.filter((n) => n.$id !== id));
      await notesService.deleteNote(id);
      if (imageId) {
        await notesService.deleteImage(imageId);
      }
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
    newImageAsset?: any,
    oldImageId?: string,
    shouldRemoveImage?: boolean,
  ) => {
    try {
      let currentImageId: string | null | undefined = oldImageId;

      // Si hay un asset nuevo, lo subimos (tiene prioridad sobre shouldRemoveImage)
      if (newImageAsset) {
        const uploadedFile = await notesService.uploadImage(newImageAsset);
        currentImageId = uploadedFile.$id;

        // Borramos la imagen vieja si existía
        if (oldImageId) {
          try {
            await notesService.deleteImage(oldImageId);
          } catch (e) {
            console.warn("No se pudo eliminar la imagen anterior:", e);
          }
        }
      }
      // Si el usuario solo quiere eliminar la imagen (sin reemplazarla)
      else if (shouldRemoveImage && oldImageId) {
        try {
          await notesService.deleteImage(oldImageId);
        } catch (e) {
          console.warn("No se pudo eliminar la imagen anterior:", e);
        }
        currentImageId = null; // null para limpiar el campo en Appwrite
      }

      const updatedNote = await notesService.updateNote(
        id,
        title,
        content,
        color,
        currentImageId,
        is_pinned,
      );

      setNotes((prev) => {
        const filtered = prev.filter((n) => n.$id !== id);
        return sortNotes([updatedNote as unknown as Note, ...filtered]);
      });
    } catch (error) {
      console.error("Error en updateNote:", error);
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
