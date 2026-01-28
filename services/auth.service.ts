import { account, AppwriteException, ID } from "@/lib/appwrite";
import { Models } from "appwrite";

export const authService = {
  register(
    email: string,
    password: string,
  ): Promise<Models.User<Models.Preferences>> {
    return account.create(ID.unique(), email, password);
  },

  login(email: string, password: string): Promise<Models.Session> {
    return account.createEmailPasswordSession(email, password);
  },

  getCurrent(): Promise<Models.User<Models.Preferences>> {
    return account.get();
  },

  logout(): Promise<{}> {
    return account.deleteSession("current");
  },
};

export { AppwriteException };
