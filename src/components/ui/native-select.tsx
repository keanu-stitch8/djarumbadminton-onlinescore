import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return <div className="relative min-w-0"><select data-slot="native-select" className={cn("h-11 w-full appearance-none rounded-lg border border-input bg-white py-2 pr-9 pl-3 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20", className)} {...props}>{children}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-4 text-muted-foreground" aria-hidden="true" /></div>;
}
