import React from "react";
import { format, isSameDay, isToday } from "date-fns";

interface CalendarGridProps {
  days: {
    date: Date;
    isPreviousMonth?: boolean;
    isNextMonth?: boolean;
  }[];
  loggedDays: string[];
  onDateSelect?: (date: Date) => void;
}

export const CalendarGrid = ({ days, loggedDays, onDateSelect }: CalendarGridProps) => {
  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
    <>
      <div className="grid grid-cols-7 gap-0 text-center mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-xs text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0">
        {days.map(({ date, isPreviousMonth, isNextMonth }) => {
          const isLogged = loggedDays?.some(loggedDate => 
            isSameDay(new Date(loggedDate), date)
          );
          const isCurrentDay = isToday(date);
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={`
                aspect-square border flex items-center justify-center
                ${isLogged ? 'bg-primary text-primary-foreground border-primary/30' : 'border-border/50'}
                ${(isPreviousMonth || isNextMonth) ? 'text-muted-foreground/50' : 'text-muted-foreground'}
                ${isCurrentDay ? 'border-2 border-primary' : ''}
                hover:bg-accent/50 transition-colors duration-200
              `}
            >
              <span className="text-xs">
                {format(date, "d")}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};