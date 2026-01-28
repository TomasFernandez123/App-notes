import { useAuth } from "@/providers/AuthProvider";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
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

  // Inline validation with Zod
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
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#6B7280"
        value={email}
        onChangeText={handleEmailChange}
        autoCapitalize="none"
        keyboardType="email-address"
        style={[
          styles.input,
          touched.email && validation.errors.email && styles.inputError,
        ]}
      />
      {touched.email && validation.errors.email && (
        <Text style={styles.fieldError}>{validation.errors.email}</Text>
      )}

      <TextInput
        placeholder="Password"
        placeholderTextColor="#6B7280"
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry
        style={[
          styles.input,
          touched.password && validation.errors.password && styles.inputError,
        ]}
      />
      {touched.password && validation.errors.password && (
        <Text style={styles.fieldError}>{validation.errors.password}</Text>
      )}

      {apiError && <Text style={styles.error}>{apiError}</Text>}

      <Pressable
        style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isButtonDisabled}
      >
        <Text style={styles.buttonText}>
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 24,
  },

  input: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#1F2937",
  },

  inputError: {
    borderColor: "#EF4444",
  },

  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
  },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  buttonDisabled: {
    backgroundColor: "#1E3A5F",
    opacity: 0.7,
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
});
