import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface FilterButtonProps extends React.ComponentProps<typeof Button> {
  active?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}

const FilterButton = forwardRef<HTMLButtonElement, FilterButtonProps>(
  ({ active = false, icon: Icon, label, value, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={cn(
          active
            ? "border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80"
            : "border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 ",
          className,
        )}
        {...props}
      >
        {Icon && <Icon />}
        <span>{label}</span>
        {value && active && (
          <>
            <span className="text-neutral-400">•</span>
            <span className="font-normal">{value}</span>
          </>
        )}
      </Button>
    );
  },
);

FilterButton.displayName = "FilterButton";

export { FilterButton };
