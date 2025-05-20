
import React from "react";
import { format, isSameDay, isToday } from "date-fns";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

interface CalendarGridProps {
  days: {
    date: Date;
    isPreviousMonth?: boolean;
    isNextMonth?: boolean;
  }[];
  loggedDays: string[];
}

export const CalendarGrid = ({ days, loggedDays }: CalendarGridProps) => {
  const navigate = useNavigate();

  const handleDateClick = (date: Date) => {
    navigate(`/food-diary?date=${format(date, "yyyy-MM-dd")}`);
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
                aspect-square flex items-center justify-center relative
                ${(isPreviousMonth || isNextMonth) ? 'text-muted-foreground/50' : 'text-muted-foreground'}
                ${isCurrentDay ? 'ring-2 ring-[#D946EF]' : ''}
                hover:bg-accent/50 transition-colors duration-200
              `}
            >
              {isLogged ? (
                <span className="text-success">✅</span>
              ) : (
                <span className="text-xs">
                  {format(date, "d")}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};
