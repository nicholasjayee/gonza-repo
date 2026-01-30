
import * as React from "react"
import { cn } from "@/lib/utils"

const Pagination = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <nav className={cn("mx-auto flex w-full justify-center", className)}>{children}</nav>
)
const PaginationContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <ul className={cn("flex flex-row items-center gap-1", className)}>{children}</ul>
)
const PaginationItem = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <li className={className}>{children}</li>
)
const PaginationLink = ({ children, className, onClick, isActive }: { children: React.ReactNode, className?: string, onClick?: () => void, isActive?: boolean }) => (
  <a 
    onClick={onClick} 
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9",
      isActive && "border border-input bg-background",
      className
    )}
  >
    {children}
  </a>
)
const PaginationNext = ({ className, onClick }: { className?: string, onClick?: () => void }) => (
  <a onClick={onClick} className={cn("inline-flex items-center gap-1 pr-2.5", className)}>
    <span>Next</span>
  </a>
)
const PaginationPrevious = ({ className, onClick }: { className?: string, onClick?: () => void }) => (
  <a onClick={onClick} className={cn("inline-flex items-center gap-1 pl-2.5", className)}>
    <span>Previous</span>
  </a>
)
const PaginationEllipsis = ({ className }: { className?: string }) => (
  <span className={cn("flex h-9 w-9 items-center justify-center", className)}>...</span>
)

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
}
