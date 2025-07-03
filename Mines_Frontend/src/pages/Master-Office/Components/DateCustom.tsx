import React, { useState, useRef, useEffect } from 'react';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import { format, startOfDay, endOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface DateCustomProps {
  dateRange: [Date | null, Date | null];
  handleDateChange: (range: [string, string]) => void;
  aligned?:boolean;
  className?:string;
}

const DateCustom: React.FC<DateCustomProps> = ({
  dateRange,
  handleDateChange,
  aligned=false,
  className,
}) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleRangeChange = (ranges: RangeKeyDict) => {
    const { startDate, endDate } = ranges.selection;
    if (startDate && endDate) {
      const timeZone = 'Asia/Kolkata'; // IST time zone
      const formattedStartDate = formatInTimeZone(startOfDay(startDate), timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");
      const formattedEndDate = formatInTimeZone(endOfDay(endDate), timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");
      handleDateChange([formattedStartDate, formattedEndDate]);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatDateRange = (range: [Date | null, Date | null]): string => {
    if (!range[0] || !range[1]) return "";
    return `${format(range[0], "dd MMM yyyy")} - ${format(
      range[1],
      "dd MMM yyyy"
    )}`;
  };
  const align = aligned ? "right-[38rem]" : "left-0";
  return (
    <div
      className="datepicker"
      style={{ position: "relative" }}
      ref={dropdownRef}
    >
      <input
        type="text"
        value={formatDateRange(dateRange)}
        onClick={() => setShowDropdown(!showDropdown)}
        // className="text-gray-900 text-lg rounded-md block w-72 p-2 bg-neutral-50 border focus:outline-none focus:ring-2 focus:ring-blue-800"
        className={className}
        placeholder="Select Date Range"
        readOnly
      />
      {showDropdown && (
          <div className={`dropdown w-full absolute z-10 mt-2 text-black ${align} `}>
          <DateRangePicker
            ranges={[
              {
                startDate: dateRange[0] || new Date(),
                endDate: dateRange[1] || new Date(),
                key: "selection",
              },
            ]}
            onChange={handleRangeChange}
            moveRangeOnFirstSelection={false}
            months={2}
            direction="horizontal"
            className='border-2 rounded-md shadow-md'
          />
        </div>
      )}
    </div>
  );
};

export default DateCustom;
