import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importación necesaria
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import { useAuth } from "../../contexts/AuthContext";
import type { ApiUser } from "../../types/api";

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate(); // Inicializamos el hook de navegación

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    code: "",
  });

  const validate = () => {
    const newErrors = { username: "", password: "", code: "" };
    let isValid = true;

    if (!username) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Security key is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Login failed:", data);
        setErrors((prev) => ({
          ...prev,
          username: data.message || "Invalid credentials",
        }));
        return;
      }

      // Procesamos el usuario según la estructura de tu API
      const loggedUser = ((data as { user?: ApiUser }).user ?? data) as ApiUser;
      
      // 1. Actualizamos el contexto global (y localStorage)
      login(loggedUser);

      // 2. Redirección basada en el rol del usuario
      const role = loggedUser.userType?.toLowerCase();
      if (role === "developer") {
        navigate("/developer", { replace: true });
      } else {
        navigate("/po", { replace: true });
      }
      
    } catch (error) {
      console.error("Network error:", error);
      setErrors((prev) => ({
        ...prev,
        username: "Could not connect to server",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col justify-center bg-white px-8 py-10 md:px-12 md:py-12 lg:p-[60px]">
      <h2 className="mb-6 text-3xl font-semibold text-slate-900">
        Identify Credentials
      </h2>

      <InputField
        label="Username"
        value={username}
        onChange={(val) => {
          setUsername(val);
          if (errors.username) setErrors((prev) => ({ ...prev, username: "" }));
        }}
        placeholder="Enter your username"
        error={errors.username}
      />

      <InputField
        label="Security Key"
        type="password"
        value={password}
        onChange={(val) => {
          setPassword(val);
          if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
        }}
        placeholder="Enter your password"
        error={errors.password}
      />

      <div className="mt-2">
        <Button
          text={loading ? "Authorizing..." : "Authorize Session"}
          onClick={handleSubmit}
        />
      </div>

      <div className="mt-8 text-xs text-slate-600">
        <span>© 2026 Atherion Systems. All rights reserved.</span> |{" "}
        <span>Privacy</span> | <span>Compliance</span>
      </div>
    </div>
  );
}

export default LoginForm;