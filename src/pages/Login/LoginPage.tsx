import AuthLayout from "../../layouts/AuthLayout";
import BrandPanel from "./BrandPanel";
import LoginForm from "./LoginForm";

function LoginPage() {
  return (
    <AuthLayout>
      <BrandPanel />
      <LoginForm />
    </AuthLayout>
  );
}

export default LoginPage;
