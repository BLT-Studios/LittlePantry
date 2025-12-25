import type { ReactNode } from "react";

type AuthPanelProps = {
  children: ReactNode;
};

export default function AuthPanel({ children }: AuthPanelProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="transition-transform duration-500 ease-in-out">
        {children}
      </div>
    </div>
  );
}