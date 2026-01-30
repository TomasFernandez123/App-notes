import { databases, storage } from "@/lib/appwrite";
import { ID, Permission, Query, Role } from "react-native-appwrite"; // 1. Importamos Query

const DATABASE_ID = "697a41ee000b6c76797e";
const COLLECTION_ID = "notes";
const BUCKET_ID = "697b81e6003c73ec7197";

export interface Note {
  $id: string;
  title: string;
  content: string;
  user_id: string;
  color: string;
  is_pinned: boolean;
  imageId?: string;
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
    imageId?: string,
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
        imageId,
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
    imageId?: string | null,
    is_pinned?: boolean,
  ) {
    return databases.updateDocument(DATABASE_ID, COLLECTION_ID, noteId, {
      title,
      content,
      color,
      imageId: imageId === undefined ? undefined : imageId, // null will clear the field
      is_pinned,
    });
  },

  async deleteNote(noteId: string, imageId?: string) {
    if (imageId) {
      try {
        await this.deleteImage(imageId);
      } catch (e) {
        console.error("No se pudo borrar la imagen asociada", e);
      }
    }
    return databases.deleteDocument(DATABASE_ID, COLLECTION_ID, noteId);
  },

  async uploadImage(imageAsset: any) {
    console.log("uploadImage called with:", imageAsset);

    try {
      // react-native-appwrite expects a file object with specific structure
      // Normalize the filename: replace .jpeg with .jpg (more commonly allowed)
      let fileName = imageAsset.fileName ?? `image_${Date.now()}.jpg`;
      fileName = fileName.replace(/\.jpeg$/i, ".jpg");

      const file = {
        name: fileName,
        type: imageAsset.mimeType ?? "image/jpeg",
        size: imageAsset.fileSize,
        uri: imageAsset.uri,
      };

      console.log("File object created for Appwrite:", file);

      // Create file in Appwrite Storage with public read permissions
      const result = await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        file,
        [Permission.read(Role.any())], // Allow anyone to view the image
      );

      console.log("storage.createFile result:", result);

      if (!result || !result.$id) {
        throw new Error("Upload returned invalid response");
      }

      return result;
    } catch (error) {
      console.error("Error in storage.createFile:", error);
      throw error;
    }
  },

  async deleteImage(imageId: string) {
    return storage.deleteFile(BUCKET_ID, imageId);
  },

  getImagePreview(imageId: string): string {
    const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;

    return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${imageId}/view?project=${projectId}&mode=admin`;
  },
};
