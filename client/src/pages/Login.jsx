import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import FormField, { Input } from "../components/auth/FormField";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError("");
    try {
      const { data: res } = await api.post("/api/auth/login", data);
      login(res);
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your DocSign account."
      switchText="Don't have an account?"
      switchLink="/register"
      switchLabel="Create one"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Email" error={errors.email?.message}>
          <Input
            {...register("email")}
            type="email"
            placeholder="alice@company.com"
            error={errors.email}
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <Input
            {...register("password")}
            type="password"
            placeholder="Your password"
            error={errors.password}
          />
        </FormField>

        {serverError && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "4px",
              padding: "0.7rem 1rem",
              fontSize: "0.85rem",
              color: "var(--seal)",
              marginBottom: "1.2rem",
            }}
          >
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.8rem",
            background: loading ? "var(--muted)" : "var(--ink)",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "0.95rem",
            fontWeight: 600,
            fontFamily: "DM Sans, sans-serif",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </AuthLayout>
  );
}
