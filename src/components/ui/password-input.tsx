"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { JSX } from "react";

export function PasswordInput({ className, disabled, ref, ...props }: JSX.IntrinsicElements["input"]) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        autoComplete="current-password"
        className={cn("hide-password-toggle pr-10", className)}
        disabled={disabled}
        ref={ref}
        type={showPassword ? "text" : "password"}
      />
      <Button
        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
        disabled={disabled}
        onClick={() => setShowPassword((prev) => !prev)}
        size="sm"
        type="button"
        variant="ghost"
      >
        {showPassword && !disabled ? (
          <EyeIcon aria-hidden="true" className="size-4" />
        ) : (
          <EyeOffIcon aria-hidden="true" className="size-4" />
        )}
        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
      </Button>

      {/* hides browsers password toggles */}
      <style>{`
      .hide-password-toggle::-ms-reveal,
      .hide-password-toggle::-ms-clear {
          visibility: hidden;
          pointer-events: none;
          display: none;
      }
  `}</style>
    </div>
  );
}
