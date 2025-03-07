"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from 'date-fns/locale/fr';
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    date?: Date // La date sélectionnée
    setDate: (date?: Date) => void // Fonction pour mettre à jour la date
}

export default function DatePicker({ date, setDate }: DatePickerProps) {
    const [open, setOpen] = React.useState(false)
    
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className="h-10 w-full">
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal text-md",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon />
                    {date ? format(date, "PPP", { locale: fr }) : <span>Choisissez une date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    onSelect={(selectedDate) => {
                        setDate(selectedDate) // Met à jour la date sélectionnée
                        setOpen(false) // Ferme le Popover
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
