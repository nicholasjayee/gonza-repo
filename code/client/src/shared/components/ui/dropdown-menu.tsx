
import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenu = ({ children }: { children: React.ReactNode }) => <div className="relative inline-block text-left">{children}</div>
const DropdownMenuTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => (
  <div className={cn("inline-flex w-full justify-center", asChild && "as-child")}>{children}</div>
)
const DropdownMenuContent = ({ children, align, className }: { children: React.ReactNode, align?: "start" | "center" | "end", className?: string }) => (
  <div className={cn(
    "absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
    align === "start" && "left-0",
    align === "end" && "right-0",
    align === "center" && "left-1/2 -translate-x-1/2",
    className
  )}>
    <div className="py-1">{children}</div>
  </div>
)
const DropdownMenuItem = ({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) => (
  <div 
    onClick={onClick} 
    className={cn("text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer", className)}
  >
    {children}
  </div>
)
const DropdownMenuCheckboxItem = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const DropdownMenuRadioItem = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => <div className="px-4 py-2 text-sm font-semibold">{children}</div>
const DropdownMenuSeparator = () => <div className="h-px bg-gray-100 my-1" />
const DropdownMenuShortcut = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const DropdownMenuSubContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const DropdownMenuSubTrigger = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
