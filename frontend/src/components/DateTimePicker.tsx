import { useMemo, useState } from 'react'

interface DateTimePickerProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

function toDateTimeValue(date: Date, time: string) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${time}`
}

function parseValue(value: string) {
  if (!value) return null
  const [datePart, timePart = '12:00'] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  if (!year || !month || !day) return null
  return {
    date: new Date(year, month - 1, day),
    time: timePart.slice(0, 5)
  }
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

export function DateTimePicker({
  value,
  onChange,
  required = false,
  placeholder = 'Selecionar data e hora'
}: DateTimePickerProps) {
  const parsed = parseValue(value)
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(parsed?.date ?? new Date())
  const selectedDate = parsed?.date ?? null
  const selectedTime = parsed?.time ?? '12:00'

  const days = useMemo(() => {
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const start = new Date(firstDay)
    start.setDate(firstDay.getDate() - firstDay.getDay())

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return date
    })
  }, [viewDate])

  const label = parsed
    ? parsed.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ` às ${selectedTime}`
    : placeholder

  function selectDate(date: Date) {
    onChange(toDateTimeValue(date, selectedTime))
  }

  function selectTime(time: string) {
    const date = selectedDate ?? new Date()
    onChange(toDateTimeValue(date, time || '12:00'))
  }

  function moveMonth(delta: number) {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1))
  }

  return (
    <div className="relative">
      <input tabIndex={-1} value={value} onChange={() => {}} required={required} className="sr-only" />
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full px-3 py-2 border rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-green-500 ${
          value ? 'border-gray-300 text-gray-800 bg-white' : 'border-gray-300 text-gray-400 bg-white'
        }`}
      >
        {label}
      </button>

      {open && (
        <div className="absolute z-40 mt-2 w-full sm:w-80 bg-white rounded-xl border border-gray-200 shadow-xl p-3 space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Mês anterior"
            >
              &lt;
            </button>
            <p className="text-sm font-semibold text-gray-800">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </p>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Próximo mês"
            >
              &gt;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map(day => (
              <span key={day} className="text-[11px] font-medium text-gray-400 py-1">{day}</span>
            ))}
            {days.map(date => {
              const isCurrentMonth = date.getMonth() === viewDate.getMonth()
              const isSelected = selectedDate ? sameDay(date, selectedDate) : false
              const isToday = sameDay(date, new Date())

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => selectDate(date)}
                  className={`aspect-square rounded-lg text-sm transition-colors ${
                    isSelected
                      ? 'bg-green-600 text-white font-semibold'
                      : isToday
                      ? 'bg-green-50 text-green-700 font-semibold'
                      : isCurrentMonth
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <label htmlFor="datetimepicker-time" className="text-xs font-medium text-gray-500">Hora</label>
            <input
              id="datetimepicker-time"
              type="time"
              value={selectedTime}
              onChange={e => selectTime(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
