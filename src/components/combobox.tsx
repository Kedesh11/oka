"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Option {
  value: string
  label: string
}

interface ComboboxProps {
  options: Option[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (value: string) => void
  selectedValue: string
  type: string
}

export function Combobox({ options, open, onOpenChange, onSelect, selectedValue, type }: ComboboxProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild className="h-10 w-[160px] flex-none">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-[160px] text-md"
        >
          {selectedValue
            ? options.find((option) => option.value === selectedValue)?.label
            : type === "start" ?"Lieu de départ": "Lieu d'arrivé"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[160px] p-0">
        <Command>
          <CommandInput placeholder="Search option..." />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onSelect(currentValue === selectedValue ? "" : currentValue)
                    onOpenChange(false)
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedValue === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}