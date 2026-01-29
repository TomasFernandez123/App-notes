// services/auth.service.ts
import { account, databases } from "@/lib/appwrite";
import { ID, Permission, Role } from "appwrite";

// 1. Copia estos IDs de tu consola de Appwrite
const DATABASE_ID = "697a41ee000b6c76797e";
const COLLECTION_ID = "profiles";

export const authService = {
  // Ahora el registro recibe el fullName
  async register(email: string, password: string, fullName: string) {
    // A. Creamos la cuenta en Auth
    const userAccount = await account.create(
      ID.unique(),
      email,
      password,
      fullName,
    );

    // B. Iniciamos sesión inmediatamente (necesario para tener permisos de escribir en la DB)
    await account.createEmailPasswordSession(email, password);

    // C. Creamos el documento en la tabla 'profiles'
    // Usamos el ID del usuario como ID del documento para que sea fácil de encontrar luego
    await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      userAccount.$id,
      {
        full_name: fullName, // Asegúrate de que coincida con el nombre que pusiste en la consola
      },
      [
        Permission.read(Role.user(userAccount.$id)),
        Permission.update(Role.user(userAccount.$id)),
      ],
    );

    return userAccount;
  },

  async login(email: string, password: string) {
    return account.createEmailPasswordSession(email, password);
  },

  // Nueva función para obtener TODO: cuenta + datos extras de la tabla
  async getUserData() {
    const userAccount = await account.get();
    try {
      const profile = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        userAccount.$id,
      );
      // Mezclamos ambos objetos
      return { ...userAccount, profileData: profile };
    } catch (e) {
      // Si el perfil no existe por alguna razón, devolvemos solo la cuenta
      return { ...userAccount, profileData: null };
    }
  },

  logout() {
    return account.deleteSession("current");
  },
};
