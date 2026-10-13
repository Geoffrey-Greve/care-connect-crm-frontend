import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DropdownProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const currentYear = new Date().getFullYear();
  const fromYear = 1900;
  const toYear = currentYear + 10;

  // Custom dropdown component for month/year selection
  const CustomDropdown = React.useCallback(
    ({ value, onChange, children, ...dropdownProps }: DropdownProps) => {
      const options = React.Children.toArray(children) as React.ReactElement<
        React.OptionHTMLAttributes<HTMLOptionElement>
      >[];
      
      const selected = options.find((child) => child.props.value === value);
      const handleChange = (newValue: string) => {
        const changeEvent = {
          target: { value: newValue },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange?.(changeEvent);
      };

      return (
        <Select value={value?.toString()} onValueChange={handleChange}>
          <SelectTrigger className="h-8 w-fit border-white/20 bg-transparent text-white hover:bg-slate-700 focus:ring-white/20">
            <SelectValue>
              {selected?.props?.children}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="pointer-events-auto">
            {options.map((option, id: number) => (
              <SelectItem
                key={`${option.props.value}-${id}`}
                value={option.props.value?.toString() ?? ""}
              >
                {option.props.children}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
    []
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("pointer-events-auto rounded-lg overflow-hidden border", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-0 sm:space-x-0 sm:space-y-0",
        month: "space-y-0",
        caption: "flex justify-center pt-3 pb-3 relative items-center bg-slate-800 text-white px-4",
        caption_label: "text-base font-semibold",
        caption_dropdowns: "flex gap-2",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 text-white hover:bg-slate-700 hover:text-white pointer-events-auto",
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse pt-3 pb-3",
        head_row: "flex bg-slate-800 text-white px-3 pb-2",
        head_cell: "text-white rounded-md w-9 font-semibold text-xs",
        row: "flex w-full mt-1 px-3",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100 pointer-events-auto hover:bg-slate-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-500 focus:text-white rounded-lg",
        day_today: "bg-blue-100 text-blue-600 font-semibold rounded-lg",
        day_outside:
          "day-outside text-gray-400 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-gray-400 opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Dropdown: CustomDropdown,
      }}
      captionLayout="dropdown"
      fromYear={fromYear}
      toYear={toYear}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
