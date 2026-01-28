import { Account, AppwriteException, Client, Databases, ID } from "appwrite";
import "react-native-url-polyfill/auto";

const config = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
};

if (!config.endpoint || !config.projectId) {
  throw new Error(
    "Faltan variables de entorno de Appwrite (EXPO_PUBLIC_APPWRITE_ENDPOINT, EXPO_PUBLIC_APPWRITE_PROJECT_ID)",
  );
}

export const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

export const account = new Account(client);
export const databases = new Databases(client);

export { AppwriteException, ID };
