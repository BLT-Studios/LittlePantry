import Logo from '@assets/logo.png';
import { Button } from '@shared/components/Button';

const LoginPage = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--color-bg] text-[--color-text]">
      <div className="w-full max-w-sm space-y-6 rounded-[--radius-lg] border border-[--color-border-subtle] bg-slate-900/60 p-6 shadow-lg">
        <div className="flex flex-col items-center gap-2">
          <img src={Logo} alt="Little Pantry" className="w-40" />
          <p className="text-sm text-[--color-text-muted]">
            Welcome back to the pantry.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-xs font-medium text-[--color-text]"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-[--radius-md] border border-[--color-border-subtle] bg-slate-900/60 px-3 py-2 text-[--color-text] placeholder:text-[--color-text-muted] focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-[--color-text]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-[--radius-md] border border-[--color-border-subtle] bg-slate-900/60 px-3 py-2 text-[--color-text] placeholder:text-[--color-text-muted] focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-[--color-text-muted] text-[--text-xs]">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="h-3 w-3 rounded border-[--color-border-subtle] bg-slate-900/60 text-[--color-primary]"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="text-[--color-primary] hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" variant="secondary" fullWidth>
            Sign in
          </Button>
        </form>

        <p className="text-center text-[--color-text-muted] text-[--text-xs]">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="text-[--color-primary] hover:underline"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
