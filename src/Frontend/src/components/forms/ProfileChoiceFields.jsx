import { useEffect, useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  composeDateValue,
  getDaysInMonth,
  includeCurrentOption,
  parseDateParts
} from '../../constants/profileOptions';

const currentYear = new Date().getFullYear();
const birthYears = Array.from({ length: 70 }, (_, index) => String(currentYear - 15 - index));
const months = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));

export function ChoiceSelect({ value, onChange, options, placeholder, disabled = false }) {
  const optionList = includeCurrentOption(options, value);

  return (
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger disabled={disabled} className={disabled ? 'bg-gray-100' : ''}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {optionList.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DateOfBirthSelect({ value, onChange, disabled = false }) {
  const [parts, setParts] = useState(parseDateParts(value));

  useEffect(() => {
    setParts(parseDateParts(value));
  }, [value]);

  const dayOptions = useMemo(() => {
    const maxDay = getDaysInMonth(parts.year || currentYear, parts.month || '01');
    return Array.from({ length: maxDay }, (_, index) => String(index + 1).padStart(2, '0'));
  }, [parts.month, parts.year]);

  const updatePart = (part, nextValue) => {
    const nextParts = { ...parts, [part]: nextValue };
    const maxDay = getDaysInMonth(nextParts.year || currentYear, nextParts.month || '01');

    if (nextParts.day && Number(nextParts.day) > maxDay) {
      nextParts.day = String(maxDay).padStart(2, '0');
    }

    setParts(nextParts);
    onChange(composeDateValue(nextParts));
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select value={parts.day} onValueChange={(value) => updatePart('day', value)}>
        <SelectTrigger disabled={disabled} className={disabled ? 'bg-gray-100' : ''}>
          <SelectValue placeholder="Ngày" />
        </SelectTrigger>
        <SelectContent>
          {dayOptions.map((day) => (
            <SelectItem key={day} value={day}>
              {day}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={parts.month} onValueChange={(value) => updatePart('month', value)}>
        <SelectTrigger disabled={disabled} className={disabled ? 'bg-gray-100' : ''}>
          <SelectValue placeholder="Tháng" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month} value={month}>
              Tháng {Number(month)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={parts.year} onValueChange={(value) => updatePart('year', value)}>
        <SelectTrigger disabled={disabled} className={disabled ? 'bg-gray-100' : ''}>
          <SelectValue placeholder="Năm" />
        </SelectTrigger>
        <SelectContent>
          {birthYears.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
