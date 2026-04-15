"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  NUMBER_FORMAT_LOCALE,
  canonicalToEditable,
  formatNumberBlurred,
  normalizeNumberInput,
  roundCanonicalDecimal,
} from "@/lib/localized-number";

export type FormattedNumberInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "onChange" | "inputMode"
> & {
  value: string;
  onValueChange: (value: string) => void;
  mode?: "integer" | "decimal";
  maxFractionDigits?: number;
  locale?: string;
};

export function FormattedNumberInput({
  value,
  onValueChange,
  mode = "integer",
  maxFractionDigits: maxFdProp,
  locale = NUMBER_FORMAT_LOCALE,
  onBlur,
  onFocus,
  className,
  min,
  max,
  ...rest
}: FormattedNumberInputProps) {
  const maxFractionDigits = maxFdProp ?? (mode === "decimal" ? 2 : 0);
  const [focused, setFocused] = React.useState(false);

  const displayValue = focused
    ? canonicalToEditable(value, locale, mode)
    : formatNumberBlurred(value, locale, mode, maxFractionDigits);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = normalizeNumberInput(
      e.target.value,
      locale,
      mode,
      maxFractionDigits,
    );
    onValueChange(next);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    setFocused(false);
    let next = normalizeNumberInput(
      e.target.value,
      locale,
      mode,
      maxFractionDigits,
    );
    if (mode === "decimal" && next && maxFractionDigits >= 0) {
      next = roundCanonicalDecimal(next, maxFractionDigits);
    }
    if (mode === "integer" && next) {
      const n = Number(next);
      if (Number.isFinite(n)) next = String(Math.trunc(n));
    }
    if (min !== undefined && min !== "" && next !== "") {
      const n = Number(next);
      const minN = Number(min);
      if (Number.isFinite(n) && Number.isFinite(minN) && n < minN) {
        next = String(minN);
      }
    }
    if (max !== undefined && max !== "" && next !== "") {
      const n = Number(next);
      const maxN = Number(max);
      if (Number.isFinite(n) && Number.isFinite(maxN) && n > maxN) {
        next = String(maxN);
      }
    }
    onValueChange(next);
    onBlur?.(e);
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    setFocused(true);
    onFocus?.(e);
  }

  return (
    <Input
      {...rest}
      type="text"
      inputMode={mode === "integer" ? "numeric" : "decimal"}
      className={className}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
    />
  );
}
