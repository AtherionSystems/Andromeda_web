function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {children}
    </div>
  );
}

export default AuthLayout;