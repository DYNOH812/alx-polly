import * as React from "react";
import type { ReactElement } from "react";

export type ButtonVariant = "default" | "outline" | "ghost" | "destructive" | "secondary";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-50";

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-black text-white hover:bg-black/90",
  outline: "border border-black/10 bg-white hover:bg-black/5",
  ghost: "hover:bg-black/5",
  destructive: "bg-red-600 text-white hover:bg-red-600/90",
  secondary: "bg-gray-100 text-black hover:bg-gray-100/80",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3",
  md: "h-9 px-4",
  lg: "h-10 px-6",
  icon: "h-9 w-9",
};

function mergeClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "default", size = "md", asChild = false, children, ...props },
    ref
  ) => {
    const classes = mergeClassNames(baseStyles, variantStyles[variant], sizeStyles[size], className);

    if (asChild && React.isValidElement(children)) {
      const child = children as ReactElement<any>;
      const childClassName = mergeClassNames((child.props as any)?.className, classes);
      return React.cloneElement(child, { className: childClassName, ...props });
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;


