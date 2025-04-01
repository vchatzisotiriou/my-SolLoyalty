import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  isActive: boolean;
}

export default function TabButton({ label, isActive, className, ...props }: TabButtonProps) {
  return (
    <button
      className={cn(
        "px-3 py-4 text-sm font-medium border-b-2",
        isActive 
          ? "border-[#14F195] text-[#14F195]" 
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
        className
      )}
      {...props}
    >
      {label}
    </button>
  );
}
