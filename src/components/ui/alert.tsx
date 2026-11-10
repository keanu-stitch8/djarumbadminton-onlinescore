import { cn } from "@/lib/utils";

export function Alert({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert" role="alert" className={cn("relative mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0", className)} {...props} />;
}
