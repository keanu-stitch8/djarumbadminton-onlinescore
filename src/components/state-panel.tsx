import type { ReactNode } from "react";

type StatePanelProps = {
  as?: "div" | "main";
  heading?: "h1" | "h3";
  role?: "alert" | "status";
  icon?: ReactNode;
  title: string;
  children: ReactNode;
  action?: ReactNode;
};

// Centered message card for loading failures, an idle board and the error/404 pages.
export function StatePanel({ as: Tag = "div", heading: Heading = "h3", role, icon, title, children, action }: StatePanelProps) {
  return <Tag role={role} className="flex min-h-[310px] flex-col items-center justify-center gap-[13px] rounded-[10px] border border-[#e1e6ef] bg-white px-5 py-[55px] text-center">
    {icon && <div className="mb-0.5 rounded-[15px] bg-[#edf2fc] p-[15px] text-[#7183a9]">{icon}</div>}
    <Heading className="text-[19px] font-bold">{title}</Heading>
    <p className="max-w-[390px] text-[13px] leading-[1.7] text-[#8b94a6]">{children}</p>
    {action}
  </Tag>;
}
