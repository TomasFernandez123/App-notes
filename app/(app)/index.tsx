import Note from "@/components/Note";
import { useAuth } from "@/providers/AuthProvider";
import { useNotes } from "@/providers/NoteProvider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function AppHomeScreen() {
  const { user, logout } = useAuth();
  const { notes, fetchNotes } = useNotes();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    if (user) {
      fetchNotes(searchQuery);
    }
  }, [searchQuery, user]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Notes</Text>
        <Pressable onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#ECEFF4" />
        </Pressable>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search notes..."
        placeholderTextColor="#6B7280"
        value={searchQuery}
        onChangeText={setSearchQuery}
      ></TextInput>

      <ScrollView>
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No notes found</Text>
          </View>
        ) : (
          notes.map((note) => <Note key={note.$id} note={note} />)
        )}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          styles.addNoteButton,
          pressed && styles.addNoteButtonPressable,
        ]}
        onPress={() => {
          router.push("/createNote");
        }}
      >
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0B0F14",
    paddingTop: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ECEFF4",
    marginBottom: 20,
  },
  addNoteButton: {
    backgroundColor: "#7C5CFF",
    borderRadius: 999,
    height: 54,
    width: 54,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    bottom: 20,
    right: 20,
    position: "absolute",
  },
  addNoteButtonPressable: {
    height: 56,
    width: 56,
    opacity: 0.6,
  },
  searchInput: {
    backgroundColor: "#0F1418",
    borderRadius: 12,
    height: 48,
    width: "100%",
    borderWidth: 1,
    borderColor: "#20262B",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#ECEFF4",
    marginBottom: 20,
  },
  emptyState: {
    flexGrow: 1,
    height: "100%",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 22,
    color: "#6B7280",
    fontWeight: "bold",
  },
});
