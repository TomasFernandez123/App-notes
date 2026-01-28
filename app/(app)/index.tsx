import { useAuth } from "@/providers/AuthProvider";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function AppHomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Notes</Text>

      <Text style={styles.subtitle}>Logged in as {user?.email}</Text>

      <View style={styles.emptyState}>
        <Text>No notes yet</Text>
      </View>

      <Pressable style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0B0F14",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    color: "#94A3B8",
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logout: {
    padding: 14,
    backgroundColor: "#1F2937",
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "600",
  },
});
