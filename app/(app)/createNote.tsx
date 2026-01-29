import { useAuth } from "@/providers/AuthProvider";
import { useNotes } from "@/providers/NoteProvider";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const noteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(150, "Title is too long (max 150 chars)"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(1000, "Content is too long (max 1000 chars)"),
});

const COLORS = [
  "#0F1418", // Default
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#A855F7", // Purple
];

export default function CreateNoteScreen() {
  const { id }: { id?: string } = useLocalSearchParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const { addNote, notes, updateNote, deleteNote } = useNotes();
  const { user } = useAuth();
  const router = useRouter();

  // Track touched fields to show errors only after interaction
  const [touched, setTouched] = useState({ title: false, content: false });

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      const existingNote = notes.find((n) => n.$id === id);
      if (existingNote) {
        setTitle(existingNote.title);
        setContent(existingNote.content);
        setSelectedColor(existingNote.color || COLORS[0]);
      }
    }
  }, [id, notes]); // Added notes dependency

  const validation = useMemo(() => {
    const result = noteSchema.safeParse({ title, content });
    if (result.success) {
      return { isValid: true, errors: { title: null, content: null } };
    }
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      isValid: false,
      errors: {
        title: fieldErrors.title?.[0] ?? null,
        content: fieldErrors.content?.[0] ?? null,
      },
    };
  }, [title, content]);

  const handleSaveNote = async () => {
    if (!validation.isValid) return;

    try {
      setLoading(true);
      if (isEditing && id) {
        await updateNote(id, title, content, selectedColor);
      } else {
        await addNote(title, content, user!.$id, selectedColor);
      }
      router.back();
    } catch (error) {
      console.error("Error al guardar la nota:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!id) return;
    try {
      setLoading(true);
      await deleteNote(id);
      router.back();
    } catch (error) {
      console.error("Error al eliminar la nota:", error);
    } finally {
      setLoading(false);
    }
  };

  const isSaveDisabled = !validation.isValid || loading;

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={styles.header}>
        <Link href="/(app)">
          <MaterialIcons name="keyboard-arrow-left" size={40} color="#ECEFF4" />
        </Link>

        {loading && <ActivityIndicator size="small" color="#7C5CFF" />}

        <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
          {isEditing && !loading && (
            <Pressable onPress={handleDeleteNote}>
              <FontAwesome name="trash-o" size={24} color="#ECEFF4" />
            </Pressable>
          )}

          {!loading && (
            <Pressable
              style={[
                styles.saveButton,
                isSaveDisabled ? styles.disabledButton : undefined,
              ]}
              onPress={handleSaveNote}
              disabled={isSaveDisabled}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.form}>
        <View>
          <TextInput
            placeholder="Title"
            placeholderTextColor="#6B7280"
            style={styles.input}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (!touched.title)
                setTouched((prev) => ({ ...prev, title: true }));
            }}
            maxLength={150}
            multiline
          />
          {touched.title && validation.errors.title && (
            <Text style={styles.errorText}>{validation.errors.title}</Text>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <TextInput
            placeholder="Content"
            placeholderTextColor="#6B7280"
            style={styles.contentInput}
            value={content}
            onChangeText={(text) => {
              setContent(text);
              if (!touched.content)
                setTouched((prev) => ({ ...prev, content: true }));
            }}
            multiline
            textAlignVertical="top"
            maxLength={1000}
          />
          {touched.content && validation.errors.content && (
            <Text style={styles.errorText}>{validation.errors.content}</Text>
          )}
          <Text style={styles.charCount}>{content.length}/1000</Text>
        </View>
      </View>

      <View style={styles.colorPicker}>
        {COLORS.map((color) => (
          <Pressable
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColorOption,
            ]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 50,
  },
  saveButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Changed to be visible on any color
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  saveButtonText: {
    color: "#FFFFFF", // Changed to white for better contrast
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  form: {
    flex: 1,
    flexDirection: "column",
    gap: 16,
  },
  input: {
    color: "#ECEFF4",
    fontSize: 28,
  },
  contentInput: {
    color: "#ECEFF4",
    fontSize: 17,
    flex: 1,
  },
  errorText: {
    color: "#EF4444", // Might need adjustment on red background, but standard invalid color
    fontSize: 12,
    marginTop: 4,
    fontWeight: "bold",
  },
  charCount: {
    color: "#ECEFF4", // Changed to match text color
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  colorPicker: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginBottom: 20,
    paddingVertical: 10,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  selectedColorOption: {
    borderColor: "#FFFFFF",
    borderWidth: 3,
  },
});
