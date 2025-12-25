type AuthFormProps = {
  mode: "login" | "signup";
};

export default function AuthForm({ mode }: AuthFormProps) {
  return (
    <form className="space-y-4">
      {mode === "signup" && (
        <div className="space-y-1">
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            placeholder="Jane Doe"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 invalid: text-pink-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 "
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-sky-800 py-2 text-sm font-medium text-white hover:bg-sky-700"
      >
        {mode === "login" ? "Sign In" : "Create Account"}
      </button>
    </form>
  );
}