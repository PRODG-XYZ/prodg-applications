import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg hover:shadow-gray-600/25 hover:scale-105 border border-gray-500/20",
        destructive: "bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg hover:shadow-gray-700/25 hover:scale-105 border border-gray-600/20",
        outline: "border-2 border-gray-400 bg-transparent text-gray-400 hover:bg-gray-400/10 hover:shadow-gray-400/25",
        secondary: "bg-gradient-to-r from-slate-700 to-slate-800 text-slate-100 hover:from-slate-600 hover:to-slate-700 border border-slate-600",
        ghost: "text-gray-400 hover:bg-gray-400/10 hover:text-gray-300",
        link: "text-gray-400 underline-offset-4 hover:underline hover:text-gray-300",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 