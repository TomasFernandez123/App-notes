import { account, ID } from "@/lib/appwrite";

export const authService = {
  register(email: string, password: string) {
    return account.create(ID.unique(), email, password);
  },

  login(email: string, password: string) {
    return account.createEmailPasswordSession(email, password);
  },

  getCurrent() {
    return account.get();
  },

  logout() {
    return account.deleteSession("current");
  },
};
