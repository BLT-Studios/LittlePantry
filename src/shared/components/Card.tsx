import type { ReactNode } from "react";


type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={[
        "rounded-4xl border-amber-600 shadow-amber-700 p-8 shadow-xl bg-bg",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}