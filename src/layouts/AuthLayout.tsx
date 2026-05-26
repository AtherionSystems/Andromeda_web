function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      {children}
    </div>
  );
}

export default AuthLayout;