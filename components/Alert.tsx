import type { ReactNode } from "react";

type Variant = "error" | "warning" | "success" | "info";

const styles: Record<Variant, string> = {
  error: "border-coral/40 bg-coral/10 text-coral",
  warning: "border-ember/40 bg-ember/10 text-ember",
  success: "border-mint/40 bg-mint/10 text-mint",
  info: "border-arc-blue/40 bg-arc-blue/10 text-arc-blue",
};

export function Alert({
  variant = "info",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-sm border-[0.5px] px-3 py-2.5 text-[13px] font-normal leading-[1.43] tracking-[-0.32px] sm:px-4 sm:py-3 ${styles[variant]}`}
    >
      {children}
    </div>
  );
}
