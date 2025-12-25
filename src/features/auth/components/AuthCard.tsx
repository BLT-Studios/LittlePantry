import type { ReactNode } from "react";
import { Card } from "@shared/components/Card";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function AuthCard({
  title,
  subtitle,
  children,
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          {children}
        </div>
      </div>
    </Card>
  );
}