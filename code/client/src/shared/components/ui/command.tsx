
import * as React from "react"

const Command = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} {...props} />
))
Command.displayName = "Command"

const CommandDialog = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const CommandInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input ref={ref} {...props} />
))
CommandInput.displayName = "CommandInput"
const CommandList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} {...props} />
))
CommandList.displayName = "CommandList"
const CommandEmpty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} {...props} />
))
CommandEmpty.displayName = "CommandEmpty"
const CommandGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} {...props} />
))
CommandGroup.displayName = "CommandGroup"
const CommandItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} {...props} />
))
CommandItem.displayName = "CommandItem"
const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={className} {...props} />
}
CommandShortcut.displayName = "CommandShortcut"
const CommandSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} {...props} />
))
CommandSeparator.displayName = "CommandSeparator"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
