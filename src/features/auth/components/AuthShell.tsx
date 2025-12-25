import AuthForm from "@features/auth/components/AuthForm";
import AuthToggle from "@features/auth/components/AuthToggle";

type AuthShellProps = {
  mode: "login" | "signup";
  onToggle: () => void;
};

export default function AuthShell({ mode, onToggle }: AuthShellProps) {
  const isLogin = mode === "login";

  return (
    <div className="relative w-full max-w-3xl h-[520px] overflow-hidden rounded-3xl bg-bg shadow-2xl">
      {/* FORM SIDE */}
      <div
        className={[
          "absolute top-0 h-full w-[65%] transition-all duration-700 ease-in-out",
          isLogin ? "right-0 z-10" : "right-[35%] z-10",
        ].join(" ")}
      >
        <div className="h-full p-10 flex flex-col justify-center gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isLogin ? "Sign in to continue" : "Join Little Pantry today"}
            </p>
          </div>

          <AuthForm mode={mode} />

          <AuthToggle mode={mode} onToggle={onToggle} />
        </div>
      </div>

      {/* BANNER SIDE */}
      <div
        className={[
          "absolute top-0 h-full w-[35%] transition-all duration-700 ease-in-out",
          "bg-linear-to-br from-slate-500 via-secondary-300 to-red-600 text-white",
          isLogin ? "right-[65%] z-20" : "right-0 z-20",
        ].join(" ")}
      >
        <div className="h-full p-10 flex flex-col justify-center gap-6">
          <h2 className="text-3xl font-bold leading-tight">
            {isLogin ? "Little Pantry" : "You’re almost in"}
          </h2>

          <p className="text-white/80">
            {isLogin
              ? "Trade, share, and find what you need locally."
              : "Create your account and start browsing."}
          </p>

          <button
            type="button"
            onClick={onToggle}
            className="w-full rounded-full bg-white/15 px-4 py-2 text-sm font-medium hover:bg-white/25"
          >
            {isLogin ? "Create account" : "Sign in instead"}
          </button>
        </div>
      </div>
    </div>
  );
}