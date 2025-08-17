"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
      <PopoverContent className="w-[160px] p-1">
        <div role="listbox" className="max-h-60 overflow-auto">
          {options.map((option) => {
            const isSelected = selectedValue === option.value
            return (
              <button
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onSelect(isSelected ? "" : option.value)
                  onOpenChange(false)
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                  isSelected && "bg-accent text-accent-foreground"
                )}
              >
                <span className="truncate">{option.label}</span>
                <Check className={cn("ml-auto", isSelected ? "opacity-100" : "opacity-0")} />
              </button>
            )
          })}
          {options.length === 0 && (
            <div className="py-2 text-center text-sm text-muted-foreground">Aucun élément</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}