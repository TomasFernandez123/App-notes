import { FormInput } from "@/components/FormInput";
import { useAuth } from "@/providers/AuthProvider";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Por favor, ingresa un email válido."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { login } = useAuth();

  const validation = useMemo(() => {
    const result = loginSchema.safeParse({ email, password });
    if (result.success) {
      return { isValid: true, errors: { email: null, password: null } };
    }
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      isValid: false,
      errors: {
        email: fieldErrors.email?.[0] ?? null,
        password: fieldErrors.password?.[0] ?? null,
      },
    };
  }, [email, password]);

  // Only show errors after user has started typing
  const [touched, setTouched] = useState({ email: false, password: false });

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (!touched.email) setTouched((prev) => ({ ...prev, email: true }));
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (!touched.password) setTouched((prev) => ({ ...prev, password: true }));
  };

  const isButtonDisabled =
    !validation.isValid || loading || !email || !password;

  const handleLogin = async () => {
    if (!validation.isValid) return;

    try {
      setLoading(true);
      setApiError(null);
      await login(email, password);
    } catch (e: any) {
      console.log(e);
      const message =
        e.code === 401
          ? "Credenciales incorrectas. Inténtalo de nuevo."
          : e.code === 429
            ? "Demasiados intentos. Espera un momento."
            : "Error de conexión. Revisa tu internet.";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Login in to access your notes</Text>

        <View style={styles.form}>
          <FormInput
            icon="email-outline"
            placeholder="name@example.com"
            value={email}
            onChangeText={handleEmailChange}
            error={validation.errors.email}
            touched={touched.email}
            type="email"
          />

          <FormInput
            icon="lock-outline"
            placeholder="Password"
            value={password}
            onChangeText={handlePasswordChange}
            error={validation.errors.password}
            touched={touched.password}
            type="password"
          />

          {apiError && <Text style={styles.error}>{apiError}</Text>}

          <Pressable
            style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isButtonDisabled}
          >
            <Text style={styles.buttonText}>
              {loading ? "Logging in..." : "Log in"}
            </Text>
          </Pressable>

          <Text style={styles.linkText}>
            Don't have an account?{" "}
            <Link style={styles.link} href="/register">
              Register
            </Link>{" "}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0B0F14",
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ECEFF4",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 40,
  },

  form: {
    gap: 16,
    flexDirection: "column",
  },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#7C5CFF",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.2,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  error: {
    color: "#EF4444",
    marginTop: 8,
    fontSize: 14,
  },

  linkText: {
    marginTop: 24,
    color: "#6B7280",
    fontSize: 15,
    textAlign: "center",
  },

  link: {
    color: "#7C5CFF",
  },
});
