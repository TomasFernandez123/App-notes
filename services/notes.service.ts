import { databases } from "@/lib/appwrite";
import { ID, Permission, Query, Role } from "appwrite"; // 1. Importamos Query

const DATABASE_ID = "697a41ee000b6c76797e";
const COLLECTION_ID = "notes";

export interface Note {
  $id: string;
  title: string;
  content: string;
  user_id: string;
  $createdAt: string;
  $updatedAt: string;
}

export const notesService = {
  // Obtener todas las notas del usuario logueado
  async listNotes(userId: string, title?: string) {
    const queries = [
      Query.equal("user_id", userId),
      Query.orderDesc("is_pinned"),
      Query.orderDesc("$updatedAt"),
    ];
    if (title) {
      queries.push(Query.search("title", title));
    }
    return databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
  },

  // Obtener una sola nota por su ID
  async getNote(noteId: string) {
    return databases.getDocument(DATABASE_ID, COLLECTION_ID, noteId);
  },

  async createNote(
    title: string,
    content: string,
    userId: string,
    color: string,
  ) {
    return databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        title,
        content,
        user_id: userId,
        color,
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ],
    );
  },

  async updateNote(
    noteId: string,
    title: string,
    content: string,
    color: string,
    is_pinned?: boolean,
  ) {
    return databases.updateDocument(DATABASE_ID, COLLECTION_ID, noteId, {
      title,
      content,
      color,
      is_pinned,
    });
  },

  async deleteNote(noteId: string) {
    return databases.deleteDocument(DATABASE_ID, COLLECTION_ID, noteId);
  },
};
