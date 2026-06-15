import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import FormField, { Input } from "../components/auth/FormField";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function Register() {
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
      const { data: res } = await api.post("/api/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      login(res);
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start signing documents in minutes."
      switchText="Already have an account?"
      switchLink="/login"
      switchLabel="Sign in"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Full Name" error={errors.name?.message}>
          <Input
            {...register("name")}
            type="text"
            placeholder="Alice Johnson"
            error={errors.name}
          />
        </FormField>

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
            placeholder="Min. 6 characters"
            error={errors.password}
          />
        </FormField>

        <FormField
          label="Confirm Password"
          error={errors.confirmPassword?.message}
        >
          <Input
            {...register("confirmPassword")}
            type="password"
            placeholder="Repeat password"
            error={errors.confirmPassword}
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
            background: loading ? "var(--muted)" : "var(--seal)",
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
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </AuthLayout>
  );
}
