type AuthToggleProps = {
  mode: "login" | "signup";
  onToggle: () => void;
};

export default function AuthToggle({ mode, onToggle }: AuthToggleProps) {
  return (
    <div className="text-center text-sm">
      {mode === "login" ? (
        <>
          <span className="text-slate-600">Don’t have an account? </span>
          <button
            type="button"
            onClick={onToggle}
            className="font-medium text-sky-700 hover:underline"
          >
            Sign up
          </button>
        </>
      ) : (
        <>
          <span className="text-slate-600">Already have an account? </span>
          <button
            type="button"
            onClick={onToggle}
            className="font-medium text-sky-700 hover:underline"
          >
            Sign in
          </button>
        </>
      )}
    </div>
  );
}