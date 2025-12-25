import { useState } from "react";
import AuthShell from "@features/auth/components/AuthShell";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-300 p-9">
      <AuthShell mode={mode} onToggle={toggleMode} />
    </div>
  );
}