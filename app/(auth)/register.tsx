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

const registerSchema = z
  .object({
    fullname: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
    email: z.string().email("Por favor, ingresa un email válido."),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const validation = useMemo(() => {
    const result = registerSchema.safeParse({
      email,
      password,
      confirmPassword,
      fullname,
    });
    if (result.success) {
      return {
        isValid: true,
        errors: {
          email: null,
          password: null,
          confirmPassword: null,
          fullname: null,
        },
      };
    }
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      isValid: false,
      errors: {
        fullname: fieldErrors.fullname?.[0] ?? null,
        email: fieldErrors.email?.[0] ?? null,
        password: fieldErrors.password?.[0] ?? null,
        confirmPassword: fieldErrors.confirmPassword?.[0] ?? null,
      },
    };
  }, [email, password, confirmPassword, fullname]);

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    fullname: false,
  });

  const isButtonDisabled =
    !validation.isValid ||
    loading ||
    !email ||
    !password ||
    !confirmPassword ||
    !fullname;

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (!touched.email) {
      setTouched((prev) => ({ ...prev, email: true }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (!touched.password) {
      setTouched((prev) => ({ ...prev, password: true }));
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (!touched.confirmPassword) {
      setTouched((prev) => ({ ...prev, confirmPassword: true }));
    }
  };

  const handleFullnameChange = (text: string) => {
    setFullname(text);
    if (!touched.fullname) {
      setTouched((prev) => ({ ...prev, fullname: true }));
    }
  };

  const handleSubmit = async () => {
    if (!validation.isValid) return;
    setLoading(true);
    try {
      await register(email, password, fullname);
    } catch (e: any) {
      console.log(e);
      setApiError(e.message);
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
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start organizing your notes</Text>

        <View style={styles.form}>
          <FormInput
            icon="account-outline"
            placeholder="Full name"
            value={fullname}
            onChangeText={handleFullnameChange}
            error={validation.errors.fullname}
            touched={touched.fullname}
            type="text"
          />

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

          <FormInput
            icon="lock-check-outline"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            error={validation.errors.confirmPassword}
            touched={touched.confirmPassword}
            type="password"
          />

          <Pressable
            style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
            disabled={isButtonDisabled}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creating account..." : "Create account"}
            </Text>
          </Pressable>

          <Text style={styles.linkText}>
            Already have an account?{" "}
            <Link style={styles.link} href="/login">
              Login
            </Link>{" "}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
