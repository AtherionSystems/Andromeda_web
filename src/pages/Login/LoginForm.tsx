import { useState } from "react";
import InputField from "../../components/InputField";
import TwoFactorInput from "../../components/TwoFactorInput";
import Button from "../../components/Button";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    code: "",
  });

  const validate = () => {
    const newErrors = { email: "", password: "", code: "" };
    let isValid = true;

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Security key is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Must be at least 6 characters";
      isValid = false;
    }

    if (code.length !== 6) {
      newErrors.code = "Enter the 6-digit code";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    console.log("LOGIN OK", { email, password, code });
  };

  return (
    <div className="flex flex-1 flex-col justify-center bg-white px-8 py-10 md:px-12 md:py-12 lg:p-[60px]">
      <h2 className="mb-6 text-3xl font-semibold text-slate-900">Identify Credentials</h2>

      <InputField
        label="Corporate Email"
        value={email}
        onChange={(val) => {
          setEmail(val);
          if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
        }}
        placeholder="name@oracle.com"
        error={errors.email}
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

      <TwoFactorInput
        onChange={(val) => {
          setCode(val);
          if (errors.code) setErrors((prev) => ({ ...prev, code: "" }));
        }}
        error={errors.code}
      />
      <Button text="Authorize Session" onClick={handleSubmit} />
      <div className="mt-8 text-xs text-slate-600">
        <span>© 2026 Atherion Systems. All rights reserved.</span> | <span>Privacy</span> | <span>Compliance</span>
      </div>
    </div>
  );
}

export default LoginForm;