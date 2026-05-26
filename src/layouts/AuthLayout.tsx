function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {children}
    </div>
  );
}

export default AuthLayout;