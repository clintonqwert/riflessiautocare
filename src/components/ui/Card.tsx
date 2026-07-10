import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  /** Adds a border/surface lift on hover for interactive cards. */
  hover?: boolean;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "className">;

export function Card({ children, hover = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "bg-raised border border-line rounded-lg",
        hover &&
          "transition-colors duration-300 hover:border-line-strong hover:bg-overlay",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
