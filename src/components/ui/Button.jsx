import React from "react";
import { cn } from "../../lib/utils/helpers";
import { Loader2 } from "lucide-react";

const buttonVariants = {
  primary: "bg-primary hover:bg-primary-dark text-white shadow-sm",
  secondary: "bg-secondary hover:bg-purple-600 text-white shadow-sm",
  danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm",
  outline:
    "border-2 border-primary text-primary hover:bg-primary/10 dark:text-primary dark:border-primary",
  ghost:
    "hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
};

const Button = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  type = "button",
  ...props
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        buttonVariants[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
