import { useNotes, type Note } from "@/providers/NoteProvider";
import AntDesign from "@expo/vector-icons/AntDesign";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Note({ note }: { note: Note }) {
  const router = useRouter();
  const date = new Date(note.$updatedAt);
  const formattedDate = formatDistanceToNow(date, { addSuffix: true });
  const { updateNote } = useNotes();

  const backgroundColor = note.color || "#0F1418";
  const textColor = note.color !== "#0F1418" ? "#ECEFF4" : "#6B7280";

  const handlePress = () => {
    // Navegamos pasando el ID como parámetro de búsqueda
    router.push({
      pathname: "/createNote",
      params: { id: note.$id },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.note,
        { backgroundColor },
        pressed && styles.notePressed,
      ]}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title}
        </Text>
        {note.is_pinned ? (
          <Pressable
            onPress={() =>
              updateNote(note.$id, note.title, note.content, note.color, false)
            }
          >
            <AntDesign name="pushpin" size={24} color={textColor} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() =>
              updateNote(note.$id, note.title, note.content, note.color, true)
            }
          >
            <EvilIcons name="star" size={24} color={textColor} />
          </Pressable>
        )}
      </View>

      <Text style={[styles.content, { color: textColor }]} numberOfLines={2}>
        {note.content}
      </Text>

      <Text style={[styles.date, { color: textColor }]}>{formattedDate}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  note: {
    gap: 8,
    padding: 16,
    borderRadius: 22,
    marginBottom: 12,
  },
  notePressed: {
    opacity: 0.6,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#ECEFF4",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    fontSize: 14,
    color: "#6B7280",
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
  },
});
