import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from "react-native";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

type FormInputProps = {
  icon: IconName;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  touched?: boolean;
  type?: "text" | "email" | "password";
} & Omit<TextInputProps, "style" | "placeholderTextColor">;

export function FormInput({
  icon,
  placeholder,
  value,
  onChangeText,
  error,
  touched = false,
  type = "text",
  ...textInputProps
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const showError = touched && error;

  return (
    <View>
      <View style={[styles.inputContainer, showError && styles.inputError]}>
        <MaterialCommunityIcons name={icon} size={24} color="#6B7280" />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={type === "email" ? "none" : undefined}
          keyboardType={type === "email" ? "email-address" : "default"}
          secureTextEntry={isPassword && !showPassword}
          {...textInputProps}
        />
        {isPassword && (
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons
              name={showPassword ? "eye-lock-open-outline" : "eye-lock-outline"}
              size={24}
              color="#6B7280"
            />
          </Pressable>
        )}
      </View>
      {showError && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#0F1317",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#20262B",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    opacity: 0.9,
    fontSize: 16,
  },

  inputError: {
    borderColor: "#EF4444",
  },

  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
