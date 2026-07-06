import React from 'react';
import { MONTH_NAMES } from './mockData';
import { Calendar, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface DateTravelerProps {
  simulatedDate: Date;
  onChangeDate: (date: Date) => void;
}

export default function DateTraveler({
  simulatedDate,
  onChangeDate
}: DateTravelerProps) {
  const currentMonth = simulatedDate.getMonth();
  const currentDay = simulatedDate.getDate();
  const currentYear = simulatedDate.getFullYear();

  const handleMonthChange = (newMonth: number) => {
    const updated = new Date(simulatedDate);
    // Use Math.min to prevent day overflow (e.g., February 30)
    const maxDays = new Date(currentYear, newMonth + 1, 0).getDate();
    updated.setMonth(newMonth);
    updated.setDate(Math.min(currentDay, maxDays));
    onChangeDate(updated);
  };

  const handleDayChange = (newDay: number) => {
    const updated = new Date(simulatedDate);
    updated.setDate(newDay);
    onChangeDate(updated);
  };

  const handleReset = () => {
    // Reset to June 15, 2026 (the prime date for demonstrating mock data)
    onChangeDate(new Date(2026, 5, 15));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
          <Calendar className="h-5.5 w-5.5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            Fecha de Simulación del Sistema
          </h4>
          <p className="text-xs text-slate-400 font-medium">
            Cambia la fecha para probar la detección automática de alumnos atrasados y estados de mora.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Month Selector */}
        <div className="flex items-center border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50/50">
          <button
            id="prev-month-btn"
            onClick={() => handleMonthChange(Math.max(0, currentMonth - 1))}
            disabled={currentMonth === 0}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="text-xs font-bold text-slate-700 w-28 text-center px-1">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>

          <button
            id="next-month-btn"
            onClick={() => handleMonthChange(Math.min(11, currentMonth + 1))}
            disabled={currentMonth === 11}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day Selector */}
        <div className="flex items-center border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50/50">
          <button
            id="prev-day-btn"
            onClick={() => handleDayChange(Math.max(1, currentDay - 1))}
            disabled={currentDay === 1}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="text-xs font-bold text-slate-700 w-16 text-center">
            Día {currentDay}
          </span>

          <button
            id="next-day-btn"
            onClick={() => {
              const maxDays = new Date(currentYear, currentMonth + 1, 0).getDate();
              handleDayChange(Math.min(maxDays, currentDay + 1));
            }}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Reset button */}
        <button
          id="reset-date-btn"
          onClick={handleReset}
          title="Resetear a Fecha Inicial (15 de Junio)"
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all cursor-pointer flex items-center justify-center bg-white"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
