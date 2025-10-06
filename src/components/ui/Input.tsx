import * as React from "react";

// Simple class name merger - works without external dependencies
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Input wrapper className */
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      className,
      wrapperClassName,
      disabled,
      required,
      id,
      type = "text",
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();

    return (
      <div className={cn("w-full space-y-2", wrapperClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium text-gray-700",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          className={cn(
            // Base styles
            "w-full rounded-lg border px-4 py-2 text-base transition-all",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            // States
            error
              ? "border-red-500 bg-red-50 focus:ring-red-500"
              : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500",
            disabled && "cursor-not-allowed opacity-50 bg-gray-100",
            className
          )}
          {...props}
        />

        {/* Error Message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Helper Text */}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";